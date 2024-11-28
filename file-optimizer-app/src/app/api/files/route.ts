import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

export async function GET(): Promise<NextResponse> {
  try {
    const db = await connectToDatabase();

    // Fetch all files, including hash
    const files = await db.collection('files').find({}, {
      projection: { hash: 1, file_path: 1, file_size: 1, last_modified: 1, duplicates: 1 }
    }).toArray();

    return NextResponse.json(files);
  } catch (e) {
    console.error('Error retrieving files:', e);
    return NextResponse.json({ error: 'Error retrieving files' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const db = await connectToDatabase();
    const formData = await request.formData();

    // Get uploaded file
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate file hash
    const buffer = await file.arrayBuffer();
    const hash = crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');

    // Check if file with the same hash exists
    const existingFile = await db.collection('files').findOne({ hash });

    if (existingFile) {
      // Update duplicates if file already exists
      await db.collection('files').updateOne(
        { hash },
        { $addToSet: { duplicates: file.name } }
      );
    } else {
      // Insert new file record
      await db.collection('files').insertOne({
        hash,
        file_path: file.name,
        file_size: file.size,
        last_modified: new Date(file.lastModified),
        duplicates: [],
      });
    }

    // Return response
    return NextResponse.json({
      hash,
      isDuplicate: !!existingFile,
    });
  } catch (e) {
    console.error('Error processing file:', e);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}
