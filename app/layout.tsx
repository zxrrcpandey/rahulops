import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RahulOps - ERPNext Deployment Platform',
    template: '%s | RahulOps'
  },
  description: 'Deploy, manage, and scale ERPNext instances across multiple servers with ease.',
  keywords: ['ERPNext', 'deployment', 'multi-tenant', 'hosting', 'frappe', 'ERP'],
  authors: [{ name: 'Rahul' }],
  creator: 'RahulOps',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'RahulOps',
    description: 'ERPNext Multi-Tenant Deployment & Management Platform',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RahulOps',
    description: 'ERPNext Multi-Tenant Deployment & Management Platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
