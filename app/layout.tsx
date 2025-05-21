import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import localFont from "next/font/local"

const soraFont = localFont({
  src: "../public/fonts/Sora-Light.woff2",
  variable: "--font-sora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Portfolio Assistant",
  description: "AI-powered financial assistant with voice capabilities",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={soraFont.variable}>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
      </head>
      <body className={soraFont.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
