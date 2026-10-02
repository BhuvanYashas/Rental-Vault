import type { Metadata } from 'next'
import './globals.css'

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
      <body className="bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  )
}