import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'SL-AI | Your Smart Digital Assistant',
  description: 'SL-AI is an intelligent, bilingual AI assistant built for Sierra Leone and the world. Get help with education, technology, business, and more.',
}

export const viewport: Viewport = {
  themeColor: '#1a2b1f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
