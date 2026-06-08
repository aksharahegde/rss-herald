import { type NextRequest, NextResponse } from "next/server"

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

interface FeedData {
  title: string
  description: string
  items: FeedItem[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const feedUrl = searchParams.get("url")

  if (!feedUrl) {
    return NextResponse.json({ error: "Feed URL is required" }, { status: 400 })
  }

  try {
    // Fetch the RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "RSS-Reader/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`)
    }

    const feedText = await response.text()

    // Try to parse as JSON first (for JSON feeds)
    if (feedText.trim().startsWith("{")) {
      try {
        const jsonFeed = JSON.parse(feedText)
        return NextResponse.json(parseJsonFeed(jsonFeed))
      } catch (e) {
        // If JSON parsing fails, continue to XML parsing
      }
    }

    // Parse XML RSS feed
    const feedData = parseXmlFeed(feedText)
    return NextResponse.json(feedData)
  } catch (error) {
    console.error("RSS parsing error:", error)
    return NextResponse.json({ error: "Failed to parse RSS feed" }, { status: 500 })
  }
}

function parseJsonFeed(jsonFeed: any): FeedData {
  return {
    title: jsonFeed.title || "Untitled Feed",
    description: jsonFeed.description || "",
    items: (jsonFeed.items || []).map((item: any) => ({
      title: item.title || "Untitled",
      description: item.summary || item.content_text || item.content_html || "",
      link: item.url || item.external_url || "",
      pubDate: item.date_published || new Date().toISOString(),
      author: item.author?.name || item.authors?.[0]?.name,
      guid: item.id || item.url || Math.random().toString(),
      content: item.content_html || item.content_text,
    })),
  }
}

function parseXmlFeed(xmlText: string): FeedData {
  // Simple XML parsing - in production, you'd want to use a proper XML parser
  const titleMatch = xmlText.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i)
  const descriptionMatch = xmlText.match(
    /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i,
  )

  const feedTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : "Untitled Feed"
  const feedDescription = descriptionMatch ? (descriptionMatch[1] || descriptionMatch[2] || "").trim() : ""

  // Extract items
  const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []

  const items: FeedItem[] = itemMatches.map((itemXml, index) => {
    const getTagContent = (tag: string) => {
      const cdataMatch = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "is"))
      if (cdataMatch) return cdataMatch[1].trim()

      const regularMatch = itemXml.match(new RegExp(`<${tag}[^>]*>(.*?)<\\/${tag}>`, "is"))
      return regularMatch ? regularMatch[1].trim() : ""
    }

    const title = getTagContent("title") || "Untitled"
    const description = getTagContent("description") || getTagContent("summary") || ""
    const link = getTagContent("link") || getTagContent("guid") || ""
    const pubDate = getTagContent("pubDate") || getTagContent("published") || new Date().toISOString()
    const author = getTagContent("author") || getTagContent("dc:creator") || ""
    const guid = getTagContent("guid") || link || `item-${index}`

    // Try to get full content from various possible fields
    const content = getTagContent("content:encoded") || getTagContent("content") || getTagContent("description") || ""

    // If content is very short, it's likely just a summary
    const isFullContent = content.length > 500 || content.includes("<p>") || content.includes("<div>")

    return {
      title: decodeHtmlEntities(title),
      description: decodeHtmlEntities(description),
      link,
      pubDate,
      author: decodeHtmlEntities(author),
      guid,
      content: decodeHtmlEntities(content),
      isFullContent, // Add this flag to indicate if we have full content
    }
  })

  return {
    title: decodeHtmlEntities(feedTitle),
    description: decodeHtmlEntities(feedDescription),
    items,
  }
}

function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  }

  return text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity
  })
}
