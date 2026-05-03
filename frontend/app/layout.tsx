import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Space Chess | Agartu',
  description: 'Изучайте шахматы с ИИ-наставником Ұстаз в пространстве Agartu Space',
  keywords: 'chess, шахматы, обучение, ИИ, Ұстаз, Agartu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} bg-midnight text-aurora-star antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
