import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Enermax | Profesionales de confianza para tu hogar',
    template: '%s | Enermax'
  },
  description: 'Conectamos clientes con electricistas, plomeros, gasistas y más profesionales verificados. Pago protegido. Garantía de satisfacción.',
  keywords: ['electricista', 'plomero', 'gasista', 'servicios del hogar', 'profesionales', 'Buenos Aires', 'Argentina'],
  authors: [{ name: 'Enermax' }],
  creator: 'Enermax',
  publisher: 'Enermax',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://enermax.com.ar'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Enermax | Profesionales de confianza para tu hogar',
    description: 'Conectamos clientes con electricistas, plomeros, gasistas y más profesionales verificados. Pago protegido.',
    url: '/',
    siteName: 'Enermax',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Enermax - Profesionales de confianza',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enermax | Profesionales de confianza',
    description: 'Electricistas, plomeros, gasistas verificados. Pago protegido.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
