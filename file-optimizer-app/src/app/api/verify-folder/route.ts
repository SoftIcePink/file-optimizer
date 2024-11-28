import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json()
    if (!folderPath) {
      return NextResponse.json({ error: 'No folder path provided' }, { status: 400 })
    }

    const files = await scanDirectory(folderPath)
    const verificationResults = await Promise.all(files.map(verifyFile))

    // Save hashes to a JSON file
    const hashesJson = JSON.stringify(verificationResults, null, 2)
    const jsonFilePath = path.join(process.cwd(), 'file-hashes.json')
    await fs.writeFile(jsonFilePath, hashesJson, 'utf-8')

    return NextResponse.json({ 
      results: verificationResults,
      jsonFilePath
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error verifying folder' }, { status: 500 })
  }
}

async function scanDirectory(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => {
    const res = path.resolve(dir, entry.name)
    return entry.isDirectory() ? scanDirectory(res) : res
  }))
  return files.flat()
}

async function verifyFile(filePath: string) {
  const fileBuffer = await fs.readFile(filePath)
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
  const stats = await fs.stat(filePath)
  
  return {
    path: filePath,
    hash,
    size: stats.size,
    lastModified: stats.mtime.toISOString()
  }
}

