import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CodeScout',
  description: 'Scouts the repo to find the right answers',
  icons: {
    icon: '/favicon.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
