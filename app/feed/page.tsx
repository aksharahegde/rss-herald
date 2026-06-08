"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface FeedItem {
  title: string
  description: string
  link: string
  pubDate: string
  author?: string
  guid: string
  isFullContent?: boolean
}

interface FeedData {
  title: string
  description: string
  items: FeedItem[]
}

function FeedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme } = useTheme()
  const feedUrl = searchParams.get("url")
  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!feedUrl) {
      router.push("/")
      return
    }

    const fetchFeed = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch RSS feed")
        }

        const data = await response.json()
        setFeedData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchFeed()
  }, [feedUrl, router])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
  }

  const isReaderMode = theme === "reader"

  if (loading) {
    return (
      <div className={`min-h-screen theme-bg p-8 ${isReaderMode ? "reader-mode" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {!isReaderMode && (
              <div className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</div>
            )}
            <p className="text-lg theme-text-secondary font-serif mb-8">Loading news...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen theme-bg p-8 ${isReaderMode ? "reader-mode" : ""}`}>
        <div className="max-w-4xl mx-auto text-center">
          {!isReaderMode && (
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
          )}
          <div className="theme-card p-8 mt-8">
            <h2 className="text-2xl font-serif font-bold theme-text-error mb-4">Error Loading Feed</h2>
            <p className="theme-text-secondary font-serif mb-6">{error}</p>
            <Button onClick={() => router.push("/")} className="theme-button-primary font-serif">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen theme-bg p-8 ${isReaderMode ? "reader-mode" : ""}`}>
      <div className="max-w-6xl mx-auto">
        {/* Newspaper Header */}
        {!isReaderMode && (
          <div className="text-center mb-8 pb-6 theme-border-bottom">
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
            <p className="text-lg theme-text-secondary font-serif">
              {feedData?.title} - {formatDate(new Date().toISOString())}
            </p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="mt-4 font-serif theme-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}

        {/* Reader Mode Header */}
        {isReaderMode && (
          <div className="text-center mb-8 pb-6 reader-header">
            <h1 className="text-3xl font-serif font-bold theme-text mb-2">{feedData?.title}</h1>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="font-serif theme-button-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}

        {feedData && (
          <>
            {/* Articles in Newspaper Column Layout */}
            <div
              className={`grid gap-8 ${isReaderMode ? "grid-cols-1 max-w-4xl mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}
            >
              {feedData.items.slice(0, 8).map((item, index) => (
                <div key={item.guid || index} className={`theme-card p-6 ${isReaderMode ? "reader-card" : ""}`}>
                  {/* Article Header */}
                  <div className={`pb-3 mb-4 ${isReaderMode ? "reader-header" : "border-b theme-border"}`}>
                    <h2 className="text-xl font-serif font-bold theme-text leading-tight mb-2">{item.title}</h2>
                    <p className="text-sm theme-text-secondary font-serif italic">From {feedData.title}</p>
                    {!isReaderMode && <div className="w-12 h-px bg-gray-400 mt-2"></div>}
                  </div>

                  {/* Article Meta */}
                  <p className="text-xs theme-text-secondary font-serif italic mb-3">
                    Published: {formatDate(item.pubDate)}
                  </p>

                  {/* Article Content */}
                  <div className="text-sm theme-text font-serif leading-relaxed mb-4 text-justify">
                    {stripHtml(item.description)}
                  </div>

                  {/* Read More Button */}
                  <Link
                    href={`/article?url=${encodeURIComponent(feedUrl || "")}&guid=${encodeURIComponent(item.guid || item.link)}`}
                  >
                    <Button variant="outline" className="w-full font-serif text-sm theme-button-secondary">
                      Read More
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Additional Articles */}
            {feedData.items.length > 8 && !isReaderMode && (
              <div className="mt-12 pt-8 theme-border-top">
                <h3 className="text-2xl font-serif font-bold text-center mb-8 theme-text">More Stories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {feedData.items.slice(8, 17).map((item, index) => (
                    <div key={item.guid || index} className="theme-card p-4">
                      <h4 className="text-base font-serif font-bold theme-text mb-2 leading-tight">{item.title}</h4>
                      <p className="text-xs theme-text-secondary font-serif mb-3">{formatDate(item.pubDate)}</p>
                      <p className="text-sm theme-text font-serif mb-3 text-justify">
                        {stripHtml(item.description).substring(0, 100)}...
                      </p>
                      <Link
                        href={`/article?url=${encodeURIComponent(feedUrl || "")}&guid=${encodeURIComponent(item.guid || item.link)}`}
                      >
                        <Button variant="outline" size="sm" className="font-serif text-xs theme-button-secondary">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reader Mode Additional Articles */}
            {feedData.items.length > 8 && isReaderMode && (
              <div className="mt-12 pt-8 reader-header max-w-4xl mx-auto">
                <h3 className="text-2xl font-serif font-bold text-center mb-8 theme-text">More Articles</h3>
                <div className="space-y-6">
                  {feedData.items.slice(8, 17).map((item, index) => (
                    <div key={item.guid || index} className="theme-card p-6 reader-card">
                      <h4 className="text-lg font-serif font-bold theme-text mb-2 leading-tight">{item.title}</h4>
                      <p className="text-sm theme-text-secondary font-serif mb-3">{formatDate(item.pubDate)}</p>
                      <p className="text-sm theme-text font-serif mb-4 text-justify">
                        {stripHtml(item.description).substring(0, 200)}...
                      </p>
                      <Link
                        href={`/article?url=${encodeURIComponent(feedUrl || "")}&guid=${encodeURIComponent(item.guid || item.link)}`}
                      >
                        <Button variant="outline" size="sm" className="font-serif theme-button-secondary">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedContent />
    </Suspense>
  )
}
