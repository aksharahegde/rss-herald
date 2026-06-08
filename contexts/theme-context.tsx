"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export type ThemeMode = "light" | "dark" | "sepia" | "high-contrast" | "reader" | "e-ink"

export interface ReaderSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  maxWidth: number
}

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  readerSettings: ReaderSettings
  setReaderSettings: (settings: Partial<ReaderSettings>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultReaderSettings: ReaderSettings = {
  fontSize: 16,
  fontFamily: "serif",
  lineHeight: 1.6,
  maxWidth: 65,
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [readerSettings, setReaderSettingsState] = useState<ReaderSettings>(defaultReaderSettings)

  useEffect(() => {
    const savedTheme = localStorage.getItem("rss-herald-theme") as ThemeMode
    const savedSettings = localStorage.getItem("rss-herald-reader-settings")

    if (savedTheme) {
      setTheme(savedTheme)
    }

    if (savedSettings) {
      setReaderSettingsState(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("rss-herald-theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const setReaderSettings = (newSettings: Partial<ReaderSettings>) => {
    const updatedSettings = { ...readerSettings, ...newSettings }
    setReaderSettingsState(updatedSettings)
    localStorage.setItem("rss-herald-reader-settings", JSON.stringify(updatedSettings))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, readerSettings, setReaderSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
