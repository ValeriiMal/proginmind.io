import type { Metadata } from 'next'
import '../src/styles/global.css'

export const metadata: Metadata = {
  title: 'Proginmind.io - Valerii Maltsev blog',
  description: 'Developer blog by Valerii Maltsev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
