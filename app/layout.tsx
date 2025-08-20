import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quick Polls - Create and Share Polls Instantly',
  description: 'Create and share polls instantly with your group chat. No accounts required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
          <header className="bg-white shadow-sm border-b border-primary-100">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold text-primary-600">
                  Quick Polls
                </a>
                <div className="flex space-x-4">
                  <a href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Home
                  </a>
                  <a href="/create" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Create Poll
                  </a>
                </div>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 