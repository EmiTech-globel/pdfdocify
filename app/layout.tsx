import {Space_Grotesk, IBM_Plex_Sans} from 'next/font/google'
import './globals.css'

const display = Space_Grotesk({subsets: ['latin'], weight: ['500', '700'], variable: '--font-display'})
const body = IBM_Plex_Sans({subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body'})

// Bare shell only. The store chrome (header, footer, Clerk, site CSS) lives in app/(site)/layout.tsx,
// so routes outside that group, such as /studio, stay clean.
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}