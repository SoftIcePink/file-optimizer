import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import { createReadStream } from 'fs';

interface ScanResult {
  filesScanned: number;
  filesBypassed: number;
  inaccessible: string[];
  timeTaken: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Starting directory scan...');
    const rootDir = process.env.SYSTEM_ROOT_DIR || 'C:\\';
    const db = await connectToDatabase();

    console.log(`Scanning directory: ${rootDir}`);
    const totalFiles = await estimateTotalFiles(rootDir);
    console.log(`Estimated total files: ${totalFiles}`);

    const startTime = Date.now(); // Start the timer

    const scanResult = await scanDirectory(rootDir, db, totalFiles);

    const endTime = Date.now(); // End the timer
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Calculate time in seconds
    scanResult.timeTaken = `${timeTaken} seconds`;

    console.log(`Scan completed. Scanned ${scanResult.filesScanned} files in ${scanResult.timeTaken}.`);

    return NextResponse.json(scanResult);
  } catch (error) {
    console.error('Error during scan:', error);
    return NextResponse.json({ error: 'Failed to scan system files' }, { status: 500 });
  }
}

async function estimateTotalFiles(dir: string): Promise<number> {
  console.log('Estimating total files...');
  let count = 0;
  const stack: string[] = [dir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          stack.push(path.resolve(currentDir, entry.name));
        } else {
          count++;
        }
      }
    } catch (error: any) {
      if (
        error.code === 'EPERM' ||
        error.code === 'EACCES' ||
        error.code === 'ENOTDIR' ||
        error.code === 'ENOENT' ||
        error.code === 'ELOOP' ||
        error.code === 'EBUSY'
      ) {
        console.warn(`Permission denied: ${currentDir}`);
      } else {
        throw error;
      }
    }
  }

  console.log(`Total files estimated: ${count}`);
  return count;
}
async function scanDirectory(rootDir: string, db: any, totalFiles: number): Promise<ScanResult> {
  const result: ScanResult = { filesScanned: 0, filesBypassed: 0, inaccessible: [], timeTaken: '' };
  const stack: string[] = [rootDir];
  const scannedPaths = new Set<string>(); // Tracks already scanned paths
  let processedFiles = 0;

  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir || scannedPaths.has(dir)) continue; // Skip if already scanned

    scannedPaths.add(dir); // Mark this directory as scanned

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.resolve(dir, entry.name);

        if (scannedPaths.has(fullPath)) {
          continue; // Skip if already scanned
        }

        try {
          if (entry.isDirectory()) {
            stack.push(fullPath);
          } else {
            // Get file stats
            const fileStats = await fs.stat(fullPath);

            // Generate hash using a stream for large files
            const hash = await generateFileHash(fullPath);

            // Store file data with hash in MongoDB
            await db.collection('files').updateOne(
              { file_path: fullPath },
              {
                $set: {
                  hash,
                  file_size: fileStats.size,
                  last_modified: fileStats.mtime,
                },
              },
              { upsert: true }
            );

            result.filesScanned++;
            processedFiles++;
            scannedPaths.add(fullPath); // Mark this file as scanned
            console.log(`[${((processedFiles / totalFiles) * 100).toFixed(2)}%] Scanned: ${fullPath}`);
          }
        } catch (fileError: any) {
          if (
            fileError.code === 'EPERM' ||
            fileError.code === 'EACCES' ||
            fileError.code === 'ENOTDIR' ||
            fileError.code === 'ENOENT' ||
            fileError.code === 'ELOOP' ||
            fileError.code === 'EBUSY'
          ) {
            console.warn(`Permission denied: ${fullPath}`);
            result.filesBypassed++;
            result.inaccessible.push(fullPath);
          } else if (fileError.code === 'ERR_FS_FILE_TOO_LARGE') {
            console.warn(`File too large to process: ${fullPath}`);
            result.filesBypassed++;
            result.inaccessible.push(fullPath);
          } else {
            console.error(`Error processing file: ${fullPath}`, fileError);
          }
        }
      }
    } catch (dirError: any) {
      if (
        dirError.code === 'EPERM' ||
        dirError.code === 'EACCES' ||
        dirError.code === 'ENOTDIR' ||
        dirError.code === 'ENOENT' ||
        dirError.code === 'ELOOP' ||
        dirError.code === 'EBUSY'
      ) {
        console.warn(`Permission denied: ${dir}`);
        result.filesBypassed++;
        result.inaccessible.push(dir);
      } else {
        console.error(`Error processing directory: ${dir}`, dirError);
      }
    }
  }

  return result;
}


// Helper function to calculate file hash using a stream
async function generateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
