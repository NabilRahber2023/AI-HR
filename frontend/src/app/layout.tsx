import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR AI Platform | 9-Box Grid',
  description: 'AI-Powered Employee Performance & Potential Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
