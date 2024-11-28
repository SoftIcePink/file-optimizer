import FileManager from '@/components/FileManager'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">File Optimizer</h1>
      <FileManager />
    </main>
  )
}

