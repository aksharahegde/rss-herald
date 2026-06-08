# RSS Herald

A newspaper-style RSS feed reader built with Next.js. Paste a feed URL, browse headlines in a vintage editorial layout, and read articles with customizable themes and text-to-speech.

**Latest release:** [v1.0.0](https://github.com/aksharahegde/rss-herald/releases/tag/v1.0.0)

## Features

- **Feed browsing** — Subscribe to any RSS or JSON Feed URL and view articles in a newspaper-style layout
- **Article reader** — Full article view with formatted content, share link, and open-in-browser
- **RSS proxy API** — Server-side feed fetching to avoid browser CORS limits
- **Reading themes** — Light, dark, sepia, high contrast, reader, and e-ink modes
- **Reader customization** — Adjustable font size, font family, line height, and column width (persisted in local storage)
- **Voice playback** — Browser text-to-speech with voice, speed, and pitch controls
- **Sample feeds** — Quick-start links for BBC News, TechCrunch, and more

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + Radix UI

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) (recommended)

### Install

```bash
git clone https://github.com/aksharahegde/rss-herald.git
cd rss-herald
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), enter an RSS feed URL, and click **Read the News**.

### Production

```bash
pnpm build
pnpm start
```

## Usage

1. **Home** (`/`) — Enter an RSS feed URL or pick a sample source
2. **Feed** (`/feed?url=...`) — Browse headlines from the feed
3. **Article** (`/article?url=...&guid=...`) — Read a single article with voice playback

Use the **Themes** button (top right) to switch reading modes and adjust typography.

## Project Structure

```
app/
├── page.tsx              # Home — feed URL input
├── feed/page.tsx         # Feed listing
├── article/page.tsx      # Article reader
└── api/rss/route.ts      # RSS/JSON feed proxy and parser
components/
├── theme-selector.tsx    # Theme and reader settings panel
└── voice-player.tsx      # Text-to-speech controls
contexts/
└── theme-context.tsx     # Theme state and local storage
```

## API

### `GET /api/rss?url=<feed-url>`

Fetches and parses an RSS (XML) or JSON Feed, returning normalized JSON:

```json
{
  "title": "Feed Title",
  "description": "Feed description",
  "items": [
    {
      "title": "Article title",
      "description": "Summary",
      "link": "https://example.com/article",
      "pubDate": "2026-06-08T00:00:00.000Z",
      "author": "Author Name",
      "guid": "unique-id",
      "content": "Full HTML or text content",
      "isFullContent": true
    }
  ]
}
```

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start development server |
| `pnpm build`  | Production build         |
| `pnpm start`  | Run production server    |
| `pnpm lint`   | Run ESLint               |

## License

Private project. All rights reserved.
