import Link from 'next/link'

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <p className="text-xl mb-4">We are a team passionate about building great web applications with Next.js.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Back to Home
      </Link>
    </main>
  )
}

