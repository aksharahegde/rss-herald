"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Share2 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface FeedItem {
  title: string
  description: string
  link: string
  pubDate: string
  author?: string
  guid: string
  content?: string
  isFullContent?: boolean
}

function ArticleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, readerSettings } = useTheme()
  const feedUrl = searchParams.get("url")
  const articleGuid = searchParams.get("guid")
  const [article, setArticle] = useState<FeedItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!feedUrl || !articleGuid) {
      router.push("/")
      return
    }

    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch RSS feed")
        }

        const data = await response.json()
        const foundArticle = data.items.find((item: FeedItem) => item.guid === articleGuid || item.link === articleGuid)

        if (!foundArticle) {
          throw new Error("Article not found")
        }

        setArticle(foundArticle)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [feedUrl, articleGuid, router])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url: shareUrl,
        })
      } catch (err) {
        navigator.clipboard.writeText(shareUrl)
        alert("Article URL copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Article URL copied to clipboard!")
    }
  }

  const isReaderMode = theme === "reader"

  const getReaderStyles = () => {
    if (!isReaderMode) return {}

    const fontFamilyMap = {
      serif: "var(--font-playfair), var(--font-crimson), 'Times New Roman', Georgia, serif",
      sans: "system-ui, -apple-system, sans-serif",
      mono: "'Courier New', Courier, monospace",
    }

    return {
      fontSize: `${readerSettings.fontSize}px`,
      fontFamily: fontFamilyMap[readerSettings.fontFamily as keyof typeof fontFamilyMap],
      lineHeight: readerSettings.lineHeight,
      maxWidth: `${readerSettings.maxWidth}ch`,
      margin: "0 auto",
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg p-8">
        <div className="max-w-4xl mx-auto text-center">
          {!isReaderMode && (
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
          )}
          <p className="text-lg theme-text-secondary font-serif">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen theme-bg p-8">
        <div className="max-w-4xl mx-auto text-center">
          {!isReaderMode && (
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
          )}
          <div className="theme-card p-8 mt-8">
            <h2 className="text-2xl font-serif font-bold theme-text-error mb-4">Article Not Found</h2>
            <p className="theme-text-secondary font-serif mb-6">
              {error || "The requested article could not be found."}
            </p>
            <Button onClick={() => router.back()} className="theme-button-primary font-serif">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen theme-bg p-8 ${isReaderMode ? "reader-mode" : ""}`}>
      <div className="max-w-4xl mx-auto">
        {/* Newspaper Header */}
        {!isReaderMode && (
          <div className="text-center mb-8 pb-6 theme-border-bottom">
            <h1 className="text-6xl font-bold tracking-wider mb-2 font-serif theme-text">RSS HERALD</h1>
            <p className="text-lg theme-text-secondary font-serif">Digital Edition - {formatDate(article.pubDate)}</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button onClick={() => router.back()} variant="outline" className="font-serif theme-button-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleShare} variant="outline" className="font-serif theme-button-secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Article */}
        <div className={`theme-card p-8 ${isReaderMode ? "reader-card" : ""}`}>
          {/* Article Header */}
          <div className={`pb-6 mb-8 ${isReaderMode ? "reader-header" : "theme-border-bottom"}`}>
            <h1
              className="text-4xl font-serif font-bold theme-text leading-tight mb-4"
              style={isReaderMode ? getReaderStyles() : {}}
            >
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 theme-text-secondary font-serif">
              <span>Published: {formatDate(article.pubDate)}</span>
              {article.author && <span>By: {article.author}</span>}
              {!isReaderMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(article.link, "_blank")}
                  className="theme-text-secondary hover:theme-text font-serif p-0"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Original Source
                </Button>
              )}
            </div>
            {isReaderMode && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                  className="font-serif theme-button-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => window.open(article.link, "_blank")}
                  variant="outline"
                  size="sm"
                  className="font-serif theme-button-secondary"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Original
                </Button>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="font-serif theme-text leading-relaxed">
            <div
              className="text-base leading-7 text-justify reader-content"
              style={isReaderMode ? getReaderStyles() : {}}
              dangerouslySetInnerHTML={{
                __html: article.content || article.description,
              }}
            />
            {(!article.content || !article.isFullContent) && !isReaderMode && (
              <div className="mt-8 p-6 theme-warning">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExternalLink className="h-5 w-5 theme-warning-icon" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm theme-warning-text font-serif">
                      <strong>Note:</strong> This RSS feed only provides a summary or excerpt. Click the button below to
                      read the complete article on the original website.
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => window.open(article.link, "_blank")}
                        className="theme-button-warning font-serif"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Read Full Article
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticleContent />
    </Suspense>
  )
}
