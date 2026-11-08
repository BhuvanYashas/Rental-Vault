import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Rental Vault',
  description: 'Idle goods, held in trust.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#7BA3D0] text-[#0F172A] antialiased">
        <Header />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}