# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio Assistant is a voice-enabled AI web application for financial insights and stock analysis. It's built with Next.js 15+ (App Router) using React 19, TypeScript, and Tailwind CSS. The application integrates Azure OpenAI's real-time API for voice interaction via WebRTC and fetches stock data from Yahoo Finance via RapidAPI.

## Development Commands

```bash
# Install dependencies (preferred package manager)
pnpm install

# Development server (runs on http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

Note: The project uses `pnpm` as indicated by `pnpm-lock.yaml`, but npm/yarn also work.

## Environment Variables

Required environment variables in `.env.local`:

```env
# RapidAPI Key for Yahoo Finance API (used in app/api/stock/*)
RAPID_API_KEY=your_rapidapi_key_here

# Azure OpenAI API Key for voice assistant (used in app/api/session/route.ts)
OPENAI_API_KEY=your_azure_openai_api_key_here
```

Never commit API keys or credentials. The Azure endpoint URL is hardcoded in `app/api/session/route.ts` and should be updated if using a different Azure resource.

## Architecture

### Full-Stack Structure

This is a unified Next.js application with:
- **Frontend**: React components in `app/page.tsx` and `components/`
- **Backend**: Next.js API routes in `app/api/*` (serverless functions)
- **No separate backend server**: API routes handle all server-side logic

### Key Directories

```
app/
├── api/              # Server-side API routes
│   ├── keys/         # Exposes RapidAPI key to client
│   ├── session/      # Creates Azure AI voice sessions
│   ├── market/       # Market-level data requests
│   │   └── trending-tickers/ # Fetches trending stocks
│   └── stock/        # Proxies stock data requests
│       ├── chart/    # Fetches historical price data
│       ├── profile/  # Fetches company profile
│       ├── statistics/ # Fetches key financial stats
│       ├── analysis/ # Fetches analyst analysis and recommendations
│       ├── recommendation-trend/ # Fetches historical recommendation trends
│       └── earnings-calendar/ # Fetches earnings calendar events
├── layout.tsx        # Root layout with ThemeProvider
└── page.tsx          # Main UI component (orchestrates state and events)

components/
├── ui/               # Shadcn UI components (cards, buttons, etc.)
├── stock-chart.tsx   # ApexCharts wrapper for stock visualization
├── stock-info-panel.tsx # Stock details sidebar
├── stock-profile-card.tsx # Company profile display (sector, industry, description)
├── stock-statistics-card.tsx # Financial statistics display (P/E, beta, margins)
├── stock-analysis-card.tsx # Analyst analysis display (recommendations, price targets)
├── stock-recommendation-trend-card.tsx # Historical recommendation trends
├── stock-earnings-calendar-card.tsx # Earnings events calendar
├── trending-tickers-card.tsx # Trending stocks grid with click-to-view
├── theme-toggle.tsx  # Dark/light mode switcher
└── theme-provider.tsx

lib/
└── webrtc-helpers.ts # WebRTC utility functions

hooks/
└── use-toast.tsx     # Toast notification hook
```

### Voice Assistant Architecture

The voice assistant uses a sophisticated WebRTC pipeline:

1. **Session Initialization** (`app/api/session/route.ts`):
   - Creates Azure OpenAI real-time session (model: `gpt-4o-realtime-preview`)
   - Returns ephemeral access token for WebRTC connection
   - Configures AI personality and system instructions

2. **WebRTC Connection** (`app/page.tsx`):
   - Establishes peer-to-peer connection with Azure using `RTCPeerConnection`
   - Opens data channel (`oai-events`) for JSON event exchange
   - Sends audio stream from user's microphone
   - Receives AI-generated speech audio

3. **Function Calling Flow**:
   - On session start, client sends available functions via data channel:
     - `getStockChart(symbol, region?, comparisons?, range?, interval?, events?)`
     - `getStockProfile(symbol, region?)`
     - `getStockStatistics(symbol, region?)`
     - `getStockAnalysis(symbol, region?)`
     - `getStockRecommendationTrend(symbol, region?)`
     - `getEarningsCalendar(period1?, period2?, region?, size?, offset?, sortField?, sortType?)`
     - `getTrendingTickers(region?, lang?)`
   - AI model decides when to call functions based on user query
   - Client receives function call request → executes via API routes → returns result to AI
   - AI incorporates data into spoken response

4. **Response Cycle**:
   - User speaks → STT (Azure) → GPT-4 processes → calls function if needed
   - Function result returned → AI generates answer → TTS (Azure) → audio output

### Stock Data Flow

**Example 1: Stock Chart**
1. User asks: "Show me Apple's chart"
2. AI calls `getStockChart(symbol="AAPL", range="1mo")`
3. Frontend calls `/api/stock/chart?symbol=AAPL&range=1mo`
4. API route fetches from Yahoo Finance via RapidAPI
5. Response flows back: API → Frontend → AI → Spoken answer
6. Frontend updates `chartData` state → triggers `StockChart` re-render

**Example 2: Trending Tickers**
1. User asks: "What are the trending stocks today?"
2. AI calls `getTrendingTickers(region="US")`
3. Frontend calls `/api/market/trending-tickers?region=US`
4. API route fetches from Yahoo Finance via RapidAPI
5. Response flows back: API → Frontend → AI → Spoken answer
6. Frontend updates `trendingTickersData` state → triggers `TrendingTickersCard` re-render
7. User can click any ticker card to load its chart (triggers new `getStockChart` call)

### State Management

All state lives in `app/page.tsx` using React hooks:
- `isListening`: Voice assistant active state
- `chartData`: Stock price data for visualization
- `profileData`, `statisticsData`, `analysisData`, `recommendationTrendData`, `earningsCalendarData`, `trendingTickersData`: Various data types
- `profileSymbol`, `statisticsSymbol`, `analysisSymbol`, `recommendationTrendSymbol`: Track which symbols' data is displayed
- `earningsCalendarDateRange`, `trendingTickersRegion`: Additional context for specific data types
- `mainStock`, `comparisonStocks`: Current stocks displayed in chart
- `selectedStock`: Which stock's details to show in sidebar
- `viewMode`: Chart view ("price", "percent", or "relative")
- `contentHistory`: Unified navigation history for all content types
- `currentHistoryIndex`: Current position in content history

State updates trigger component re-renders. No external state management library is used.

### Content History & Navigation

The app uses a unified history system (`HistoryItem` interface) that supports seven content types:
- **Chart**: Contains chartData, mainStock, selectedStock, comparisonStocks, viewMode
- **Profile**: Contains profileData and symbol
- **Statistics**: Contains statisticsData and symbol
- **Analysis**: Contains analysisData and symbol
- **Recommendation Trend**: Contains recommendationTrendData and symbol
- **Earnings Calendar**: Contains earningsCalendarData and date range
- **Trending Tickers**: Contains trendingTickersData and region

Navigation features:
- Previous/Next buttons with ChevronLeft/ChevronRight icons
- Dot indicators showing all history items (yellow for active, white/transparent for others)
- Swipe gestures on touch devices (left/right)
- Slide animations (left/right) based on navigation direction

All content types appear in the same main content area with the same size and animations. The Stock Information panel only appears for charts (showing price, volume, etc.).

## Key Technical Details

### API Route Patterns

All API routes follow this structure:
```typescript
// app/api/*/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const param = searchParams.get("param")

    // Fetch from external API
    const response = await fetch(externalApiUrl, {
      headers: { "api-key": process.env.API_KEY }
    })

    return NextResponse.json({ success: true, data: await response.json() })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

### Chart Visualization

`components/stock-chart.tsx` uses ApexCharts with:
- Three view modes: absolute price, percentage change, relative (indexed) performance
- Event annotations: dividends, splits, earnings
- Dynamic theming (dark/light mode support)
- Multi-series support for stock comparisons
- Dynamically imported to avoid SSR issues

### Profile Display

`components/stock-profile-card.tsx` displays company information:
- Accesses `profileData.summaryProfile` directly (Yahoo Finance API structure)
- Shows: sector, industry, location, employees, CEO, website, business description
- Conditionally renders fields (handles missing data gracefully)

### Statistics Display

`components/stock-statistics-card.tsx` displays financial metrics:
- Accesses `statisticsData.defaultKeyStatistics` directly (Yahoo Finance API structure)
- Three metric groups: Valuation (enterprise value, P/E, book value, EPS), Trading & Risk (beta, shares, holdings), Performance (margins, growth, ratios)
- Note: Some advanced metrics (ROE, ROA, debt/equity) not available in this API endpoint

### Trending Tickers Display

`components/trending-tickers-card.tsx` displays currently trending stocks:
- Shows stocks with high trading activity and price movements
- Grid layout with individual ticker cards showing: symbol, company name, price, change %, market state badge, exchange
- Color-coded borders: green for positive, red for negative price changes
- Market state badges: Open (green), Closed (gray), Pre-Market (blue), After Hours (purple)
- Interactive click handlers: clicking a ticker loads its chart automatically
- Supports multiple regions: US, GB, AU, IN, etc.
- Data from `/api/market/trending-tickers` (Yahoo Finance trending tickers endpoint)

### TypeScript Conventions

- All components and utilities are typed
- Interface definitions at top of files (see `ChartData`, `ChartHistoryItem` in `app/page.tsx`)
- Path alias `@/*` maps to project root (configured in `tsconfig.json`)
- Build errors ignored in `next.config.mjs` for deployment flexibility

### Styling

- Tailwind CSS with custom theme (configured in `tailwind.config.ts`)
- Shadcn UI components for consistent design system
- Dark mode via `next-themes` with class strategy
- CSS custom properties for theme colors (defined in `app/globals.css`)
- Minimal custom CSS; primarily utility classes in JSX

## Common Workflows

### Adding New Stock Functions

1. Define function schema in `app/page.tsx` (in `session.update` event)
2. Add handler case in `handleFunctionCall()`
3. Create corresponding API route in `app/api/stock/[function-name]/route.ts`
4. Update state and UI as needed based on response

### Modifying AI Instructions

Edit system instructions in `app/api/session/route.ts` (line 33+). The AI personality, response style, and behavior guidelines are defined here.

### Testing Voice Features

1. Ensure environment variables are set
2. Run `pnpm dev`
3. Click microphone sphere to start voice session
4. Grant browser microphone permissions
5. Check browser console for WebRTC connection logs and data channel events

## Build Configuration

- ESLint and TypeScript errors are ignored during builds (`next.config.mjs`)
- Images are unoptimized for deployment flexibility
- Target: ES6 (broad compatibility)
- Output: Serverless-compatible (works on Vercel, Node servers, etc.)

## External Dependencies

- **Azure OpenAI**: Real-time API endpoint (currently hardcoded to `fsodnaopenai2.openai.azure.com`)
- **RapidAPI (Yahoo Finance)**: Stock data via `yahoo-finance-real-time1.p.rapidapi.com`
- **WebRTC**: Browser-native, no additional infrastructure needed

## Important Notes

- The app is client-side rendered (`"use client"` in `app/page.tsx`)
- WebRTC helpers check for browser environment to avoid SSR issues
- API keys are managed server-side except where explicitly exposed via `/api/keys`
- Voice sessions are ephemeral; new session created each time user activates assistant
- Stock market hours awareness: US markets operate 9:30 AM - 4:00 PM ET (mentioned in AI instructions)
