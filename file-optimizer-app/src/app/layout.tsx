'use client'

import './globals.css'
import { Inter } from 'next/font/google'
// import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <div className="absolute top-4 right-4">
          </div>
          {children}
      </body>
    </html>
  )
}

