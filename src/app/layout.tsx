import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VaultMotionProvider from '@/components/VaultMotionProvider'
import { Toaster } from 'sonner'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rental Vault — Idle goods, held in trust',
  description: 'Verified peer-to-peer rentals with photo-graded intake, escrow protection, and neighbourhood vault hubs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#7BA3D0] text-[#0F172A] font-sans antialiased selection:bg-[#EA580C]/25 selection:text-[#0F172A]">
        <VaultMotionProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster richColors position="bottom-right" />
        </VaultMotionProvider>
      </body>
    </html>
  )
}