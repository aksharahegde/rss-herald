"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"

export default function HomePage() {
  const [feedUrl, setFeedUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedUrl.trim()) return

    setIsLoading(true)
    try {
      const encodedUrl = encodeURIComponent(feedUrl)
      router.push(`/feed?url=${encodedUrl}`)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isReaderMode = theme === "reader"

  return (
    <div className={`min-h-screen theme-bg p-8 ${isReaderMode ? "reader-mode" : ""}`}>
      <div className="max-w-4xl mx-auto">
        {/* Newspaper Header */}
        {!isReaderMode && (
          <div className="text-center mb-8 pb-6 theme-border-bottom">
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
            <p className="text-lg theme-text-secondary font-serif">
              Digital News Reader -{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Feed Input Section */}
        <div className={`max-w-2xl mx-auto theme-card p-8 ${isReaderMode ? "reader-card" : ""}`}>
          <h2 className="text-2xl font-serif font-bold text-center mb-6 theme-text">
            {isReaderMode ? "RSS Reader" : "Subscribe to News Feed"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedUrl" className="block text-sm font-serif font-medium theme-text mb-2">
                Enter RSS Feed URL:
              </label>
              <Input
                id="feedUrl"
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/rss.xml"
                className="w-full p-3 font-serif text-base theme-input"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-serif py-3 text-base theme-button-primary"
            >
              {isLoading ? "Loading..." : "Read the News"}
            </Button>
          </form>

          {/* Sample Feeds */}
          <div className="mt-8 pt-6 theme-border-top">
            <h3 className="text-lg font-serif font-semibold theme-text mb-4">Sample News Sources:</h3>
            <div className="grid gap-2">
              {[
                { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
                { name: "Estéban Soubiran", url: "https://soubiran.dev/feed.rss" },
                { name: "Daniel Roe", url: "https://roe.dev/rss.xml" },
                { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
              ].map((feed) => (
                <button
                  key={feed.name}
                  onClick={() => setFeedUrl(feed.url)}
                  className="text-left p-3 font-serif theme-button-secondary transition-colors"
                >
                  {feed.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
