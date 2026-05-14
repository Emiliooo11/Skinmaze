import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Skinmaze — CS2 Cases & Marketplace',
  description: 'Open CS2 cases and trade skins on the fairest platform in the game.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
