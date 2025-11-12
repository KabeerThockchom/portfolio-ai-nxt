# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EY Prometheus is a voice-enabled AI web application for financial insights, stock analysis, and portfolio management. It's built with Next.js 15+ (App Router) using React 19, TypeScript, and Tailwind CSS. The application integrates OpenAI's Realtime API (model: `gpt-realtime`) for voice interaction via WebRTC and fetches stock data from Yahoo Finance via RapidAPI.

**Key Features:**
- Real-time voice interaction with OpenAI
- 11 different content types: charts, profiles, statistics, analysis, recommendation trends, earnings calendar, trending tickers, insider transactions, balance sheets, income statements, and cash flow statements
- **Portfolio Management System** (NEW):
  - Portfolio holdings tracking with real-time valuations
  - Order management (place, track, cancel orders)
  - Portfolio aggregation by asset class, sector, ticker, manager
  - Risk analysis with bubble charts and gauge visualizations
  - Benchmark comparison against SPX, VTSAX, VBTLX
  - Returns attribution waterfall charts
  - Relative performance analysis
  - SQLite database with Drizzle ORM
- Conversation persistence with markdown-based storage
- Modular architecture with custom hooks and centralized type system
- Interactive financial visualizations using ApexCharts
- Dark/light theme support

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

# OpenAI API Key for voice assistant (used in app/api/session/route.ts)
OPENAI_API_KEY=your_openai_api_key_here
```

Never commit API keys or credentials. The OpenAI Realtime API endpoint is configured in `app/api/session/route.ts` and `app/page.tsx`.

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
│   ├── conversation/ # Conversation persistence
│   │   ├── save/     # Saves conversation messages to markdown
│   │   ├── load/     # Loads conversation history (last 30 messages)
│   │   └── clear/    # Clears conversation history
│   ├── portfolio/    # Portfolio management APIs (NEW)
│   │   ├── holdings/ # User portfolio holdings with valuations
│   │   ├── aggregation/ # Portfolio distribution analysis
│   │   ├── risk/     # Risk analysis and scoring
│   │   ├── benchmark/ # Benchmark performance comparison
│   │   ├── attribution/ # Returns attribution analysis
│   │   └── relative-performance/ # Relative performance vs benchmarks
│   ├── orders/       # Order management APIs (NEW)
│   │   ├── place/    # Place buy/sell orders
│   │   ├── history/  # Order history and status
│   │   └── cancel/   # Cancel pending orders
│   ├── user/         # User-specific data (NEW)
│   │   └── cash-balance/ # Cash balance and total portfolio value
│   ├── keys/         # Exposes RapidAPI key to client
│   ├── session/      # Creates OpenAI Realtime voice sessions
│   ├── market/       # Market-level data requests
│   │   └── trending-tickers/ # Fetches trending stocks
│   └── stock/        # Proxies stock data requests
│       ├── chart/    # Fetches historical price data
│       ├── profile/  # Fetches company profile
│       ├── statistics/ # Fetches key financial stats
│       ├── analysis/ # Fetches analyst analysis and recommendations
│       ├── recommendation-trend/ # Fetches historical recommendation trends
│       ├── earnings-calendar/ # Fetches earnings calendar events
│       ├── insider-transactions/ # Fetches insider trading data
│       └── financials/ # Fetches financial statements
├── layout.tsx        # Root layout with ThemeProvider
├── page.tsx          # Main UI component (orchestrates state and events)
└── portfolio/        # Portfolio management pages (NEW)
    └── page.tsx      # Portfolio dashboard (planned)

components/
├── ui/               # Shadcn UI components (53 total, including custom)
│   ├── audio-sphere-visualizer.tsx # 3D voice visualization with Three.js
│   ├── auto-awesome-icon.tsx # Custom animated icon
│   ├── typewriter-badges.tsx # Animated example prompts
│   └── [50+ other Shadcn components]
├── portfolio/        # Portfolio management components (NEW)
│   ├── donut-chart.tsx # Multi-level donut charts for aggregation
│   ├── bubble-chart.tsx # Risk analysis bubble charts (planned)
│   ├── benchmark-chart.tsx # Benchmark comparison charts (planned)
│   ├── gauge-chart.tsx # Risk score gauge (planned)
│   ├── holdings-table.tsx # Portfolio holdings table
│   ├── portfolio-summary-card.tsx # Portfolio summary metrics
│   ├── trade-form.tsx # Order placement form (planned)
│   └── order-history-table.tsx # Order history table (planned)
├── stock-chart.tsx   # ApexCharts wrapper for stock visualization
├── stock-info-panel.tsx # Stock details sidebar
├── stock-profile-card.tsx # Company profile display
├── stock-statistics-card.tsx # Financial statistics display
├── stock-analysis-card.tsx # Analyst analysis display
├── stock-recommendation-trend-card.tsx # Historical recommendation trends
├── stock-earnings-calendar-card.tsx # Earnings events calendar
├── trending-tickers-card.tsx # Trending stocks grid
├── stock-insider-transactions-card.tsx # Insider trading display
├── stock-balance-sheet-card.tsx # Balance sheet visualization
├── stock-income-statement-card.tsx # Income statement display
├── stock-cash-flow-card.tsx # Cash flow statement display
├── tool-calls-panel.tsx # Function call tracking UI
├── api-call-details.tsx # API call metadata display
├── theme-toggle.tsx  # Dark/light mode switcher
└── theme-provider.tsx

lib/
├── db/              # Database layer (NEW)
│   ├── schema.ts    # Drizzle ORM schema definitions (10 tables)
│   └── connection.ts # SQLite database connection
├── webrtc-helpers.ts # WebRTC utility functions
├── voice-tools-config.ts # AI function definitions
├── constants.ts      # Example prompts and constants
└── utils.ts          # Utility functions

hooks/               # Custom React hooks (13 total)
├── use-voice-session.ts # Voice/WebRTC state management
├── use-stock-data.ts # Stock data state (11 data types)
├── use-stock-api.ts  # API fetch functions (centralized)
├── use-portfolio-data.ts # Portfolio holdings state (NEW)
├── use-portfolio-analysis.ts # Portfolio analysis state (NEW)
├── use-portfolio-api.ts # Portfolio API fetch functions (NEW)
├── use-orders.ts    # Order management state (NEW)
├── use-content-history.ts # Navigation history management
├── use-conversation.ts # Conversation state & persistence
├── use-function-calls.ts # AI function call tracking
├── use-ui-state.ts   # UI-specific state
├── use-mobile.tsx    # Mobile detection
└── use-toast.ts      # Toast notifications

types/               # Centralized type definitions
├── api.ts           # API response types
├── chart.ts         # Chart data types
├── function-calls.ts # Function call types
├── history.ts       # History item types
├── voice-session.ts # Voice session types
├── portfolio.ts     # Portfolio types (NEW)
└── index.ts         # Barrel export

data/                # Runtime data storage
├── portfolio.sqlite3 # Portfolio database (31,400+ price records) (NEW)
└── session_history.md # Conversation history storage
```

### Modular Architecture

The codebase uses a modern, modular architecture with clear separation of concerns:

#### Custom Hooks Pattern

State management is distributed across 9 specialized hooks instead of a monolithic component:

1. **`use-voice-session.ts`**: Voice assistant state
   - WebRTC connection management
   - Audio stream handling
   - Session lifecycle (start, stop, mute)

2. **`use-stock-data.ts`**: Stock data state management
   - Manages 11 different data types (charts, profiles, statistics, analysis, recommendations, earnings, trending, insider transactions, balance sheets, income statements, cash flows)
   - Tracks symbols for each data type
   - Handles data updates and clearing

3. **`use-stock-api.ts`**: Centralized API functions
   - 9 API fetch functions for all stock endpoints
   - Consistent error handling and response formatting
   - Abstracts API route calls from components

4. **`use-content-history.ts`**: Navigation history
   - Unified history for all 11 content types
   - Previous/next navigation
   - Swipe gesture support
   - Slide animations

5. **`use-conversation.ts`**: Conversation persistence
   - Message storage and retrieval
   - Integration with `/api/conversation/*` routes
   - Last 30 messages caching

6. **`use-function-calls.ts`**: AI function call tracking
   - Tracks all AI function invocations
   - Stores parameters, results, and timestamps
   - Powers the Tool Calls Panel UI

7. **`use-ui-state.ts`**: UI-specific state
   - Modal states
   - Panel visibility
   - Loading indicators

8. **`use-mobile.tsx`**: Mobile detection
   - Responsive behavior triggers

9. **`use-toast.ts`**: Toast notifications
   - Success/error messages
   - User feedback

#### Centralized Type System

All TypeScript interfaces and types live in the `/types` directory:
- **`api.ts`**: API response types for all endpoints
- **`chart.ts`**: Chart data structures
- **`function-calls.ts`**: AI function call types
- **`history.ts`**: History item types (11 content types)
- **`voice-session.ts`**: WebRTC and voice session types
- **`index.ts`**: Barrel export for convenient imports

#### Tool Configuration

AI function definitions are extracted to `lib/voice-tools-config.ts`:
- 11 function schemas for AI function calling
- Parameter definitions and descriptions
- Return type specifications
- Centralized configuration for easy updates

This modular approach improves:
- **Maintainability**: Each hook has a single responsibility
- **Testability**: Hooks can be tested in isolation
- **Reusability**: Hooks can be composed in different ways
- **Type Safety**: Centralized types prevent drift
- **Developer Experience**: Clear separation of concerns

### Voice Assistant Architecture

The voice assistant uses a sophisticated WebRTC pipeline:

1. **Session Initialization** (`app/api/session/route.ts`):
   - Creates OpenAI Realtime session (model: `gpt-realtime`)
   - Endpoint: `api.openai.com/v1/realtime/sessions`
   - Returns ephemeral access token for WebRTC connection
   - Configures AI personality and system instructions

2. **WebRTC Connection** (via `use-voice-session.ts` hook):
   - Establishes peer-to-peer connection with OpenAI using `RTCPeerConnection`
   - Opens data channel (`oai-events`) for JSON event exchange
   - Sends audio stream from user's microphone
   - Receives AI-generated speech audio

3. **Function Calling Flow**:
   - On session start, client sends 11 available functions (from `lib/voice-tools-config.ts`):
     - `getStockChart(symbol, region?, comparisons?, range?, interval?, events?)`
     - `getStockProfile(symbol, region?)`
     - `getStockStatistics(symbol, region?)`
     - `getStockAnalysis(symbol, region?)`
     - `getStockRecommendationTrend(symbol, region?)`
     - `getEarningsCalendar(period1?, period2?, region?, size?, offset?, sortField?, sortType?)`
     - `getTrendingTickers(region?, lang?)`
     - `getInsiderTransactions(symbol, region?)` **(NEW)**
     - `getBalanceSheet(symbol, region?)` **(NEW)**
     - `getIncomeStatement(symbol, region?)` **(NEW)**
     - `getCashFlow(symbol, region?)` **(NEW)**
     - `muteAssistant()` - Allows user to mute the AI
   - AI model decides when to call functions based on user query
   - Client receives function call request → executes via `use-stock-api.ts` hook → returns result to AI
   - Function calls are tracked via `use-function-calls.ts` for transparency
   - AI incorporates data into spoken response

4. **Response Cycle**:
   - User speaks → STT (OpenAI) → GPT processes → calls function if needed
   - Function result returned → AI generates answer → TTS (OpenAI) → audio output
   - All function calls are logged and displayed in the Tool Calls Panel

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

The application uses a **modular hooks-based architecture** instead of centralized state. State is distributed across specialized custom hooks in the `/hooks` directory:

#### Voice State (`use-voice-session.ts`):
- `isListening`: Voice assistant active state
- `isMuted`: Microphone mute state
- `pcRef`: WebRTC peer connection reference
- `dataChannelRef`: Data channel for AI events
- Session management functions

#### Stock Data State (`use-stock-data.ts`):
Manages 11 different data types:
- `chartData`, `profileData`, `statisticsData`, `analysisData`
- `recommendationTrendData`, `earningsCalendarData`, `trendingTickersData`
- `insiderTransactionsData`, `balanceSheetData`, `incomeStatementData`, `cashFlowData` **(NEW)**
- Symbol tracking for each data type
- Metadata (date ranges, regions, etc.)

#### Chart State (in `use-stock-data.ts`):
- `mainStock`, `comparisonStocks`: Current stocks in chart
- `selectedStock`: Active stock for sidebar
- `viewMode`: Chart view ("price", "percent", "relative")

#### History State (`use-content-history.ts`):
- `contentHistory`: Array of history items (11 content types)
- `currentHistoryIndex`: Current position
- Navigation functions (previous, next, goto)
- Swipe gesture handlers

#### Conversation State (`use-conversation.ts`):
- `messages`: Array of conversation messages
- `saveMessage`, `loadConversation`, `clearConversation` functions
- Integration with `/api/conversation/*` routes

#### Function Call Tracking (`use-function-calls.ts`):
- `functionCalls`: Array of all AI function invocations
- Metadata: parameters, results, timestamps, endpoint details

#### UI State (`use-ui-state.ts`):
- Modal visibility states
- Panel open/close states
- Loading indicators

**Benefits:**
- **Separation of Concerns**: Each hook manages one aspect of state
- **Composability**: `app/page.tsx` composes these hooks together
- **Reusability**: Hooks can be used independently
- **Testability**: Each hook can be tested in isolation
- **Type Safety**: All hooks use types from `/types` directory

No external state management library is used.

### Content History & Navigation

The app uses a unified history system (`HistoryItem` interface from `types/history.ts`) that supports **11 content types**:

1. **Chart**: Contains chartData, mainStock, selectedStock, comparisonStocks, viewMode
2. **Profile**: Contains profileData and symbol
3. **Statistics**: Contains statisticsData and symbol
4. **Analysis**: Contains analysisData and symbol
5. **Recommendation Trend**: Contains recommendationTrendData and symbol
6. **Earnings Calendar**: Contains earningsCalendarData and date range
7. **Trending Tickers**: Contains trendingTickersData and region
8. **Insider Transactions**: Contains insiderTransactionsData and symbol **(NEW)**
9. **Balance Sheet**: Contains balanceSheetData and symbol **(NEW)**
10. **Income Statement**: Contains incomeStatementData and symbol **(NEW)**
11. **Cash Flow**: Contains cashFlowData and symbol **(NEW)**

**Navigation Features** (managed by `use-content-history.ts`):
- Previous/Next buttons with ChevronLeft/ChevronRight icons
- Dot indicators showing all history items (yellow for active, white/transparent for others)
- Swipe gestures on touch devices (left/right swipe)
- Slide animations (left/right) based on navigation direction
- Direct navigation by clicking dot indicators

**Content Display:**
- All content types appear in the same main content area with consistent sizing
- Smooth slide animations between content items
- The Stock Information panel only appears for charts (showing real-time price, volume, etc.)
- Financial statements and insider transactions have their own dedicated card components

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

### Conversation Persistence

The application includes a conversation persistence system that saves and loads chat history:

**API Routes** (`/app/api/conversation/*`):
1. **`/api/conversation/save`** (POST):
   - Saves individual messages to `/data/session_history.md`
   - Appends messages in markdown format with timestamps
   - Creates data directory if it doesn't exist
   - Format: `## [Timestamp]\n**Role**: message content\n\n`

2. **`/api/conversation/load`** (GET):
   - Loads the last 30 messages from session history
   - Parses markdown format back into message objects
   - Returns array of `{role, content}` objects

3. **`/api/conversation/clear`** (POST):
   - Clears the conversation history file
   - Resets the session

**Hook** (`use-conversation.ts`):
- `messages`: Array of conversation messages
- `saveMessage(role, content)`: Saves a single message
- `loadConversation()`: Loads history on app start
- `clearConversation()`: Clears all history

**Storage Format** (`/data/session_history.md`):
```markdown
## 2025-01-15 14:30:22
**user**: Show me Apple's stock chart

## 2025-01-15 14:30:25
**assistant**: I'll fetch Apple's stock chart for you...
```

**Use Cases:**
- Preserves conversation context across sessions
- Allows AI to reference previous queries
- Enables conversation review and debugging

### Insider Transactions Display

**Component**: `components/stock-insider-transactions-card.tsx`
**API Route**: `/app/api/stock/insider-transactions/route.ts`
**Function**: `getInsiderTransactions(symbol, region?)`

Displays insider trading activity for a company:

**Data Shown:**
- Transaction date and filing date
- Insider name and title (CEO, CFO, Director, etc.)
- Transaction type: Purchase, Sale, Grant, Option Exercise
- Shares traded and transaction value
- Ownership after transaction

**Insights:**
- Net buying/selling activity over 6 months
- Pattern detection: Heavy insider buying may signal confidence
- Color coding: Green for purchases, red for sales
- Sortable by date, value, or transaction type

**Data Source**: Yahoo Finance Insider Transactions endpoint via RapidAPI

**Example Query:**
```typescript
getInsiderTransactions("AAPL", "US")
// Returns: Array of insider transactions with detailed metadata
```

### Financial Statements Display

The application provides three types of financial statements with dedicated components:

#### 1. Balance Sheet (`stock-balance-sheet-card.tsx`)

**API Route**: `/app/api/stock/financials/route.ts`
**Function**: `getBalanceSheet(symbol, region?)`

**Displays:**
- **Assets**: Total assets, current assets, cash, receivables, inventory
- **Liabilities**: Total liabilities, current liabilities, debt, payables
- **Shareholders' Equity**: Total equity, retained earnings, common stock
- **Trends**: Year-over-year and quarter-over-quarter changes
- **Key Ratios**: Current ratio, debt-to-equity, book value per share

**Data Format**:
- Annual statements (last 4 years)
- Quarterly statements (last 4 quarters)
- All values in millions/billions with proper formatting

#### 2. Income Statement (`stock-income-statement-card.tsx`)

**Function**: `getIncomeStatement(symbol, region?)`

**Displays:**
- **Revenue**: Total revenue, revenue growth
- **Expenses**: Cost of revenue, operating expenses, R&D, SG&A
- **Profitability**: Gross profit, operating income, net income
- **Per-Share Metrics**: EPS (basic and diluted)
- **Margins**: Gross margin, operating margin, profit margin
- **Trends**: Revenue and profit trends over time

**Visualizations**:
- Revenue and profit trend charts
- Margin analysis over time
- Expense breakdown

#### 3. Cash Flow Statement (`stock-cash-flow-card.tsx`)

**Function**: `getCashFlow(symbol, region?)`

**Displays:**
- **Operating Cash Flow**: Cash from operations, changes in working capital
- **Investing Cash Flow**: Capital expenditures, acquisitions, investments
- **Financing Cash Flow**: Debt issued/repaid, dividends, stock buybacks
- **Free Cash Flow**: Operating cash flow - CapEx
- **Net Change in Cash**: Total cash flow impact

**Key Metrics**:
- Free cash flow trend
- Cash flow quality (operating vs. net income)
- Capital allocation patterns
- Dividend sustainability

**Data Source**: All financial statements come from Yahoo Finance Financials endpoint via RapidAPI. Data structure may nest income statement and cash flow data within the financials response.

### Tool Call Tracking

The application tracks all AI function calls for transparency and debugging:

**Component**: `components/tool-calls-panel.tsx`
**Hook**: `use-function-calls.ts`
**Detail Component**: `components/api-call-details.tsx`

**Tracked Information:**
- Function name (e.g., `getStockChart`, `getStockProfile`)
- Parameters passed to the function
- Return data (success/failure)
- Timestamp of invocation
- API endpoint called
- HTTP method used
- Response status

**UI Features:**
- Expandable panel showing all function calls in session
- Chronological list with newest first
- Color-coded status indicators (success = green, error = red)
- Click to expand and see full parameters and response
- JSON formatting for complex data structures

**Use Cases:**
- **Debugging**: See exactly what the AI requested
- **Transparency**: Users can see what data was fetched
- **Development**: Understand AI behavior patterns
- **Auditing**: Track API usage and errors

**Example Display:**
```
[14:30:25] getStockChart
  ✓ Success
  Parameters: { symbol: "AAPL", range: "1mo", interval: "1d" }
  Endpoint: /api/stock/chart
  Response: { success: true, data: {...} }
```

**Storage**: Function calls are stored in memory during the session (not persisted). Tracked via `use-function-calls.ts` hook.

### TypeScript Conventions

- **Strict typing**: All components and utilities are fully typed
- **Centralized types**: Type definitions in `/types` directory instead of inline
  - `types/api.ts` - API response types
  - `types/chart.ts` - Chart data structures
  - `types/function-calls.ts` - AI function types
  - `types/history.ts` - 11 content type definitions
  - `types/voice-session.ts` - WebRTC types
- **Barrel exports**: `types/index.ts` provides convenient imports
- **Path alias**: `@/*` maps to project root (configured in `tsconfig.json`)
- **Build configuration**: TypeScript errors ignored in `next.config.mjs` for deployment flexibility
- **Type safety**: Custom hooks use generic types for reusability

### Styling

- Tailwind CSS with custom theme (configured in `tailwind.config.ts`)
- Shadcn UI components for consistent design system
- Dark mode via `next-themes` with class strategy
- CSS custom properties for theme colors (defined in `app/globals.css`)
- Minimal custom CSS; primarily utility classes in JSX

## Common Workflows

### Adding New Stock Functions

With the modular architecture, adding new functions is streamlined:

1. **Define function schema** in `lib/voice-tools-config.ts`:
   ```typescript
   {
     name: "getNewFunction",
     description: "Fetches new data type",
     parameters: { /* parameter schema */ }
   }
   ```

2. **Add API route** in `app/api/stock/[function-name]/route.ts`:
   - Follow existing pattern with try-catch
   - Return `{ success: boolean, data: any }`
   - Add RapidAPI call with proper headers

3. **Add fetch function** in `use-stock-api.ts`:
   ```typescript
   const fetchNewData = async (symbol: string) => {
     const response = await fetch(`/api/stock/new-function?symbol=${symbol}`)
     return response.json()
   }
   ```

4. **Add state** in `use-stock-data.ts`:
   ```typescript
   const [newData, setNewData] = useState(null)
   const [newDataSymbol, setNewDataSymbol] = useState("")
   ```

5. **Add type** in `types/api.ts` or `types/history.ts`

6. **Create component** in `components/stock-new-data-card.tsx`

7. **Add to content history** in `types/history.ts`:
   - Add new content type to `HistoryItemType` union
   - Add type-specific interface

8. **Update main page** (`app/page.tsx`):
   - Import and use the new hook functions
   - Add rendering logic for the new content type

### Managing Conversation History

**Save a message:**
```typescript
import { useConversation } from '@/hooks/use-conversation'

const { saveMessage } = useConversation()
saveMessage('user', 'Show me Apple stock')
```

**Load conversation:**
```typescript
const { loadConversation } = useConversation()
await loadConversation() // Loads last 30 messages
```

**Clear history:**
```typescript
const { clearConversation } = useConversation()
await clearConversation()
```

### Modifying AI Instructions

Edit system instructions in `app/api/session/route.ts` (around line 33+). The AI personality, response style, behavior guidelines, and function calling instructions are defined here.

**Key sections to modify:**
- System personality and tone
- Stock market knowledge and hours
- Function calling guidelines
- Response format preferences

### Testing Voice Features

1. Ensure environment variables are set (`.env.local`):
   - `OPENAI_API_KEY` (OpenAI)
   - `RAPID_API_KEY` (RapidAPI)

2. Run development server:
   ```bash
   pnpm dev
   ```

3. Open `http://localhost:3000` and click microphone sphere to start voice session

4. Grant browser microphone permissions when prompted

5. Check browser console for:
   - WebRTC connection logs
   - Data channel events (`oai-events`)
   - Function call tracking
   - API responses

6. Use Tool Calls Panel (if available) to inspect AI function calls in real-time

### Debugging Tips

**Check function calls:**
- Open Tool Calls Panel in UI to see all AI function invocations
- Inspect parameters and responses
- Verify endpoint URLs and status codes

**Check conversation history:**
- Open `/data/session_history.md` to review saved conversations
- Verify message format and timestamps

**Check WebRTC connection:**
- Console should show: `Data channel opened`
- Check `pcRef.connectionState` in browser dev tools
- Verify audio stream is active

**Check API routes:**
- Test endpoints directly in browser or Postman
- Example: `http://localhost:3000/api/stock/chart?symbol=AAPL&range=1mo`
- Verify RapidAPI key is valid and not rate-limited

## Build Configuration

- ESLint and TypeScript errors are ignored during builds (`next.config.mjs`)
- Images are unoptimized for deployment flexibility
- Target: ES6 (broad compatibility)
- Output: Serverless-compatible (works on Vercel, Node servers, etc.)

## External Dependencies

### Core Services

- **OpenAI**: Realtime API endpoint
  - Model: `gpt-realtime`
  - Endpoint: `api.openai.com/v1/realtime`
  - Used for voice interaction, STT, TTS, and function calling
  - Configured in `app/api/session/route.ts` and `app/page.tsx`

- **RapidAPI (Yahoo Finance)**: Stock data provider
  - Endpoint: `yahoo-finance-real-time1.p.rapidapi.com`
  - Provides: charts, profiles, statistics, analysis, recommendations, earnings, trending tickers, insider transactions, financials
  - API key in environment variable `RAPID_API_KEY`

- **WebRTC**: Browser-native peer-to-peer communication
  - No additional infrastructure needed
  - Handles real-time audio streaming

### Key Libraries

**UI & Styling:**
- `next-themes` - Dark/light mode management
- `tailwindcss` + `@tailwindcss/typography` - Styling
- `shadcn/ui` + Radix UI - Component library (53 components)
- `lucide-react` - Icon library
- `sonner` - Toast notifications

**Visualization:**
- `apexcharts` + `react-apexcharts` - Stock charts
- `recharts` - Alternative charting (if used)
- `three` - 3D audio sphere visualizer

**AI & Voice:**
- `@openai/agents` - OpenAI Agents SDK
- `langsmith` - LangChain tracing (if used)
- `@picovoice/*` - Wake word detection

**Utilities:**
- `date-fns` - Date manipulation
- `react-markdown` - Markdown rendering
- `animejs` - Animations
- `zod` - Schema validation
- `react-hook-form` - Form handling

**Database:**
- `better-sqlite3` - SQLite database access
- `drizzle-orm` - TypeScript ORM with full type safety

## Portfolio Management System

The application includes a complete portfolio management system integrated from `PortfolioAIEY/`. This system provides holdings tracking, risk analysis, benchmarking, order management, and comprehensive portfolio analytics.

### Database Architecture

**SQLite Database**: `data/portfolio.sqlite3` (992KB, 31,400+ historical price records)

**10 Tables:**
1. **`users`** - User accounts with phone-based authentication
2. **`asset_type`** - Asset universe (stocks, bonds, ETFs, cash, mutual funds)
3. **`user_portfolio`** - Portfolio holdings with units and cost basis (5 holdings)
4. **`user_transactions`** - Transaction history of all trades (56 records)
5. **`order_book`** - Order management (placed, pending, cancelled, executed) (3 orders)
6. **`asset_history`** - Historical daily prices (31,400+ records for accurate analysis)
7. **`asset_sector`** - Sector breakdowns for each asset
8. **`default_benchmarks`** - Default benchmarks (SPX, VTSAX, VBTLX)
9. **`relative_benchmarks`** - Per-asset benchmark mappings
10. **`asset_class_risk_level_mapping`** - Risk scoring rules based on volatility

**ORM**: Uses Drizzle ORM (`lib/db/schema.ts`) with full TypeScript type safety and relationships.

### Portfolio API Routes

**10 Portfolio Management Routes:**

1. **`/api/portfolio/holdings`** (GET)
   - Fetches user's portfolio holdings with real-time valuations
   - Returns: holdings array, total value, total gain/loss, gain/loss %
   - Joins asset data, fetches latest prices from `asset_history`

2. **`/api/portfolio/aggregation`** (POST)
   - Aggregates portfolio by: asset_class, sector, ticker, asset_manager, category, concentration
   - Supports multi-level aggregation (e.g., asset_class → sectors)
   - Returns: aggregation array, donut chart data

3. **`/api/portfolio/risk`** (POST)
   - Analyzes portfolio risk using volatility and concentration metrics
   - Risk score: 0-10 scale (0-2: Low, 2-4: Moderate, 4-6: Medium, 6-8: High, 8-10: Very High)
   - Returns: risk analysis by dimension, overall risk score, bubble chart data, gauge chart data

4. **`/api/portfolio/benchmark`** (POST)
   - Compares portfolio against SPX, VTSAX, VBTLX
   - Time periods: weekly, monthly, quarterly, yearly
   - History: 1-5 years
   - Returns: indexed performance, periodic returns, chart data

5. **`/api/portfolio/attribution`** (POST)
   - Returns attribution waterfall showing contribution by dimension
   - Dimensions: asset_class, sector, ticker
   - Returns: attribution array, total return, waterfall chart data

6. **`/api/portfolio/relative-performance`** (POST)
   - Compares each holding against its relative benchmark
   - Periods: 1w, 1m, 3m, 6m, 1y, 2y, 3y, 5y
   - Returns: performance comparison for each holding

7. **`/api/user/cash-balance`** (GET)
   - Returns cash balance and total portfolio value
   - Used for order validation

8. **`/api/orders/place`** (POST)
   - Places buy/sell orders (Market Open or Limit)
   - Validates cash balance for buys
   - Returns: order confirmation with settlement date (T+2)

9. **`/api/orders/history`** (GET)
   - Fetches all orders sorted by date (newest first)
   - Returns: orders array with full details

10. **`/api/orders/cancel`** (POST)
    - Cancels pending orders (status: Placed or Under Review)
    - Cannot cancel executed or already cancelled orders

### Portfolio Components

**Chart Components** (`components/portfolio/`):
- **`donut-chart.tsx`** - Multi-level donut charts for portfolio aggregation
- **`bubble-chart.tsx`** - 3D bubble charts for risk visualization (size = risk score)
- **`gauge-chart.tsx`** - Radial gauge for overall risk score (0-10)
- **`benchmark-chart.tsx`** - Line chart comparing portfolio vs benchmark performance
- **`waterfall-chart.tsx`** - Returns attribution showing positive/negative contributions

**UI Components**:
- **`holdings-table.tsx`** - Portfolio holdings with color-coded gain/loss
- **`portfolio-summary-card.tsx`** - 4-card dashboard (value, gain/loss, risk, cash)
- **`trade-form.tsx`** - Order placement with validation
- **`order-history-table.tsx`** - Order tracking with cancel button

### Portfolio Hooks

**4 Specialized Hooks** (following modular pattern):

1. **`use-portfolio-api.ts`** - Centralized API functions
   - 10 functions matching all API routes
   - Consistent error handling

2. **`use-portfolio-data.ts`** - Portfolio holdings state
   - Holdings, total value, gain/loss, cash balance
   - Loading states

3. **`use-portfolio-analysis.ts`** - Analysis state
   - Aggregation, benchmarking, risk, attribution, relative performance
   - Chart data for all visualizations

4. **`use-orders.ts`** - Order management state
   - Orders array, placement status

### Voice Integration

**10 New Portfolio Functions** added to `lib/voice-tools-config.ts`:
- `getPortfolioHoldings()` - View all holdings
- `getPortfolioAggregation(dimension, metric, multiLevel?)` - Analyze distribution
- `getPortfolioRisk(dimension?)` - Risk analysis
- `getPortfolioBenchmark(benchmark, period, history)` - Benchmark comparison
- `getReturnsAttribution(dimension)` - Returns breakdown
- `getRelativePerformance(period)` - Holding vs benchmark
- `getCashBalance()` - Check available cash
- `placeOrder(symbol, buySell, orderType, qty, price?)` - Place trades
- `getOrderHistory()` - View order history
- `cancelOrder(orderId)` - Cancel pending orders

**Voice Assistant Usage:**
```
User: "Show me my portfolio"
AI: [calls getPortfolioHoldings()] "You have 5 holdings worth $125,000..."

User: "What's my risk level?"
AI: [calls getPortfolioRisk()] "Your overall risk score is 4.2 out of 10, which is Moderate..."

User: "Buy 10 shares of Apple"
AI: [calls getCashBalance(), then placeOrder()] "I've placed a Market Open order..."
```

### Portfolio Dashboard

**Page**: `/app/portfolio/page.tsx`

**Features:**
- Summary cards with key metrics
- Holdings table with sortable columns
- Analysis tab with:
  - Asset class distribution donut chart
  - Risk score gauge
  - Risk bubble chart by dimension
- Trading tab with:
  - Order placement form
  - Order history table with cancel functionality
- Refresh button to reload all data

**Usage:**
```typescript
// Navigate to portfolio page
router.push('/portfolio')

// Or access from main app via portfolio functions
```

### Testing

**Test Script**: `scripts/test-portfolio-api.ts`

Run tests:
```bash
npx tsx scripts/test-portfolio-api.ts
```

Tests all 10 API routes with real database data.

### Key Features

**Holdings Tracking:**
- Real-time valuations using latest prices from `asset_history`
- Gain/loss calculations (dollar and percentage)
- Support for stocks, bonds, ETFs, cash, mutual funds

**Risk Analysis:**
- Volatility-based scoring (0-10 scale)
- Concentration analysis
- Risk breakdown by asset class, sector, ticker
- Visual risk indicators (bubble charts, gauges)

**Portfolio Analytics:**
- Multi-dimensional aggregation (6 dimensions)
- Multi-level breakdowns (e.g., stocks → tech/healthcare sectors)
- Benchmark performance comparison
- Returns attribution waterfall
- Relative performance vs appropriate benchmarks

**Order Management:**
- Market Open orders (execute at next market open)
- Limit orders (execute at specified price or better)
- Order status tracking (Placed, Under Review, Cancelled, Executed)
- Cash balance validation
- Order history with filtering

**Data Integrity:**
- 31,400+ historical price records for accurate analysis
- T+2 settlement date calculation
- Foreign key relationships enforce data consistency
- Drizzle ORM provides type-safe database operations

## Important Notes

**Architecture:**
- The app is client-side rendered (`"use client"` in `app/page.tsx`)
- Modular hooks architecture distributes state across **13 specialized hooks** (9 original + 4 portfolio)
- Centralized type system in `/types` directory ensures type safety (6 type files)
- WebRTC helpers check for browser environment to avoid SSR issues
- SQLite database with Drizzle ORM for portfolio data (10 tables)

**Data & State:**
- **Stock Analysis**: 11 content types (charts, profiles, statistics, analysis, recommendations, earnings, trending, insider transactions, balance sheets, income statements, cash flows)
- **Portfolio Management**: Holdings, aggregation, risk analysis, benchmarking, orders (NEW)
- Conversation history persisted to `/data/session_history.md` (last 30 messages)
- Portfolio data persisted to `/data/portfolio.sqlite3` (31,400+ price records)
- Function calls tracked in memory for transparency (not persisted)
- Content history supports navigation with swipe gestures and animations

**Security:**
- API keys managed server-side except where explicitly exposed via `/api/keys`
- RapidAPI key required for all stock data endpoints
- OpenAI API key required for voice features
- Never commit `.env` or `.env.local` files

**Voice Sessions:**
- Voice sessions use OpenAI's `gpt-realtime` model
- Endpoint: `api.openai.com/v1/realtime`
- New session created each time user activates assistant (sessions are ephemeral)
- **21 AI functions available**: 11 stock data + 10 portfolio management
- All function calls logged and displayed in Tool Calls Panel
- Portfolio functions support: holdings, risk, benchmarking, aggregation, orders

**Stock Data:**
- All stock data from Yahoo Finance via RapidAPI
- Stock market hours awareness: US markets operate 9:30 AM - 4:00 PM ET
- Market state badges show: Open, Closed, Pre-Market, After Hours
- Supports multiple regions: US, GB, AU, IN, etc.

**Development:**
- Use `pnpm` as the primary package manager (though npm/yarn also work)
- Hot reload works for most changes; WebRTC connections may need manual refresh
- Check browser console for detailed logging of WebRTC and API calls
- Tool Calls Panel available in UI for real-time function call inspection
