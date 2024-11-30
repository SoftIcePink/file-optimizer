import FileExplorer from '../components/FileExplorer'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Next File Optimizer</h1>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
        Explore your files, sort them by hash or path, and identify duplicate files across your repository.
      </p>
      <FileExplorer />
    </main>
  )
}

