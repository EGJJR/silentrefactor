import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Silent Refactor',
  description: 'AI-powered code refactoring tool'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={cn('min-h-screen font-sans antialiased grainy', inter.className)}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}