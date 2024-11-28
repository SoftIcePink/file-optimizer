import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri!)

export async function DELETE(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    await client.connect()
    const db = client.db("fileOptimizer")

    const result = await db.collection("files").deleteOne({ hash: params.hash })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { hash: string } }
) {
  try {
    await client.connect()
    const db = client.db("fileOptimizer")

    const body = await request.json()
    const { file_path } = body

    const result = await db.collection("files").updateOne(
      { hash: params.hash },
      { $set: { file_path } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'File updated successfully' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error updating file' }, { status: 500 })
  } finally {
    await client.close()
  }
}

