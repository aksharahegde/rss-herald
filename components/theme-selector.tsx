"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme, type ThemeMode } from "@/contexts/theme-context"
import { Palette, Settings, X } from "lucide-react"

const themes: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "sepia", label: "Sepia" },
  { value: "high-contrast", label: "High Contrast" },
  { value: "reader", label: "Reader" },
  { value: "e-ink", label: "E-Ink" },
]

const fontFamilies = [
  { value: "serif", label: "Serif (Times)" },
  { value: "sans", label: "Sans-serif (Arial)" },
  { value: "mono", label: "Monospace (Courier)" },
]

export function ThemeSelector() {
  const { theme, setTheme, readerSettings, setReaderSettings } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm" className="theme-button">
        <Palette className="w-4 h-4 mr-2" />
        Themes
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 theme-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-serif">Reading Modes</CardTitle>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Selection */}
            <div className="grid grid-cols-2 gap-2">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  variant={theme === themeOption.value ? "default" : "outline"}
                  className="h-auto p-3 flex items-center justify-center text-center theme-option"
                >
                  <span className="font-semibold text-sm">{themeOption.label}</span>
                </Button>
              ))}
            </div>

            {/* Reader Mode Settings */}
            {theme === "reader" && (
              <div className="space-y-4 pt-4 border-t theme-border">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-semibold text-sm">Reader Settings</span>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Size: {readerSettings.fontSize}px</label>
                  <Slider
                    value={[readerSettings.fontSize]}
                    onValueChange={([value]) => setReaderSettings({ fontSize: value })}
                    min={12}
                    max={24}
                    step={1}
                    className="theme-slider"
                  />
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Family</label>
                  <Select
                    value={readerSettings.fontFamily}
                    onValueChange={(value) => setReaderSettings({ fontFamily: value })}
                  >
                    <SelectTrigger className="theme-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Line Height: {readerSettings.lineHeight}</label>
                  <Slider
                    value={[readerSettings.lineHeight]}
                    onValueChange={([value]) => setReaderSettings({ lineHeight: value })}
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    className="theme-slider"
                  />
                </div>

                {/* Max Width */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reading Width: {readerSettings.maxWidth}ch</label>
                  <Slider
                    value={[readerSettings.maxWidth]}
                    onValueChange={([value]) => setReaderSettings({ maxWidth: value })}
                    min={45}
                    max={85}
                    step={5}
                    className="theme-slider"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
