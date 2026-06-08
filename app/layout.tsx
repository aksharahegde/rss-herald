import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Crimson_Text } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"
import { ThemeSelector } from "@/components/theme-selector"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
})
const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
})

export const metadata: Metadata = {
  title: "The RSS Herald - Classic News Reader",
  description: "A vintage newspaper-style RSS reader for all your news feeds",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable} ${crimson.variable}`}>
        <ThemeProvider>
          <ThemeSelector />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
