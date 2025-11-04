// Voice assistant tools configuration for Azure OpenAI

export const voiceAssistantTools = [
  {
    type: "function",
    name: "getStockChart",
    description: "Fetches chart data for a given stock symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
        region: { type: "string", description: "Region code (e.g., US)" },
        comparisons: { type: "string", description: "Comma-separated list of symbols for comparison" },
        range: {
          type: "string",
          description: "Time range (e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd)",
        },
        interval: {
          type: "string",
          description: "Time interval (e.g., 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
        },
        events: {
          type: "string",
          description: "Comma-separated list of events: capitalGain, div, split, earn, history",
        },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getStockProfile",
    description: "Fetches company profile information for a given stock symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
        region: { type: "string", description: "Region code (e.g., US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getStockStatistics",
    description: "Fetches key statistics for a given stock symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
        region: { type: "string", description: "Region code (e.g., US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getStockAnalysis",
    description: "Fetches comprehensive analyst analysis including recommendations, earnings estimates, price targets, and upgrade/downgrade history for a stock",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
        region: { type: "string", description: "Region code (e.g., US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getStockRecommendationTrend",
    description: "Fetches historical analyst recommendation trends showing how Buy/Hold/Sell ratings have changed over time (current, 1 month ago, 2 months ago, 3 months ago)",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
        region: { type: "string", description: "Region code (e.g., US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getEarningsCalendar",
    description: "Fetches earnings calendar showing upcoming and recent earnings events. Intelligently interprets user requests like 'next week', 'this month', 'upcoming earnings' and converts them to specific date ranges. Shows company names, tickers, earnings dates/times, EPS estimates, actual EPS, and surprise percentages.",
    parameters: {
      type: "object",
      properties: {
        period1: { type: "string", description: "Start date in YYYY-MM-DD format (e.g., 2024-10-01). Interpret user intent: 'next week' = today to +7 days, 'this month' = first day to last day of current month, 'upcoming' = today to +14 days" },
        period2: { type: "string", description: "End date in YYYY-MM-DD format (e.g., 2024-10-31). Should be after period1." },
        region: { type: "string", description: "Region code (default: US). Options: US, GB, AU, etc." },
        size: { type: "number", description: "Number of events to return (default: 100, max: 250)" },
        offset: { type: "number", description: "Pagination offset (default: 0)" },
        sortField: { type: "string", description: "Field to sort by (default: startdatetime). Options: startdatetime, companyshortname" },
        sortType: { type: "string", description: "Sort order (default: ASC). Options: ASC, DESC" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "getTrendingTickers",
    description: "Fetches currently trending stock tickers in the market. Shows stocks with high trading activity, significant price movements, and high investor interest. Displays price, change percentage, market state, and trending score for each ticker. Great for discovering what's hot in the market right now.",
    parameters: {
      type: "object",
      properties: {
        region: { type: "string", description: "Region code (default: US). Options: US, GB, AU, IN, etc." },
        lang: { type: "string", description: "Language code (default: en-US)" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "getInsiderTransactions",
    description: "Fetches insider transaction data for a given stock symbol, showing purchases, sales, and grants by company executives, directors, and major shareholders. Includes transaction dates, insider names/roles, number of shares, transaction values, and net buying/selling activity over the past 6 months. Use this to understand insider sentiment and confidence in the company.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
        region: { type: "string", description: "Region code (default: US)" },
        lang: { type: "string", description: "Language code (default: en-US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getBalanceSheet",
    description: "Fetches balance sheet data for a given stock symbol, showing assets, liabilities, and shareholders' equity over time. Displays both annual and quarterly data with trends. Use this to understand a company's financial position and health.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
        region: { type: "string", description: "Region code (default: US)" },
        lang: { type: "string", description: "Language code (default: en-US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getIncomeStatement",
    description: "Fetches income statement data for a given stock symbol, showing revenue, expenses, and profitability over time. Displays both annual and quarterly data with trends for net income and profit margins. Use this to understand a company's profitability and operational performance.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
        region: { type: "string", description: "Region code (default: US)" },
        lang: { type: "string", description: "Language code (default: en-US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getCashFlow",
    description: "Fetches cash flow statement data for a given stock symbol, showing operating, investing, and financing cash flows over time. Displays both annual and quarterly data with trends. Use this to understand how a company generates and uses cash.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., AAPL, TSLA, MSFT)" },
        region: { type: "string", description: "Region code (default: US)" },
        lang: { type: "string", description: "Language code (default: en-US)" },
      },
      required: ["symbol"],
    },
  },
  {
    type: "function",
    name: "getPortfolioHoldings",
    description: "Fetches the user's portfolio holdings with current valuations, gain/loss, and total portfolio value. Shows all assets owned including stocks, bonds, ETFs, and cash positions.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "getPortfolioAggregation",
    description: "Analyzes portfolio distribution by different dimensions such as asset class (stocks, bonds, ETFs), sector (Technology, Healthcare, etc.), individual tickers, asset managers, or concentration levels. Can create multi-level breakdowns like asset class → sectors within each class.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        dimension: {
          type: "string",
          description: "Dimension to aggregate by: 'asset_class', 'sector', 'ticker', 'asset_manager', 'category', or 'concentration'"
        },
        metric: {
          type: "string",
          description: "Metric to display: 'total_value' (dollar amounts) or 'percentage_return' (returns)"
        },
        multiLevel: {
          type: "boolean",
          description: "For asset_class dimension, show nested breakdown by sectors (default: false)"
        },
      },
      required: ["dimension", "metric"],
    },
  },
  {
    type: "function",
    name: "getPortfolioRisk",
    description: "Analyzes portfolio risk by calculating risk scores based on volatility, concentration, and asset class. Shows overall portfolio risk score (0-10 scale) and breakdown by dimension. Risk levels: 0-2 (Low), 2-4 (Moderate), 4-6 (Medium), 6-8 (High), 8-10 (Very High).",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        dimension: {
          type: "string",
          description: "Dimension to analyze risk by: 'asset_class', 'sector', or 'ticker'. If not provided, defaults to asset_class"
        },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "getPortfolioBenchmark",
    description: "Compares portfolio performance against market benchmarks like S&P 500 (SPX), Total Stock Market (VTSAX), or Total Bond Market (VBTLX). Shows indexed performance over time and periodic returns to measure outperformance or underperformance.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        benchmark: {
          type: "string",
          description: "Benchmark to compare against: 'SPX' (S&P 500), 'VTSAX' (Total Stock), or 'VBTLX' (Total Bond)"
        },
        period: {
          type: "string",
          description: "Time period for comparison: 'weekly', 'monthly', 'quarterly', or 'yearly'"
        },
        history: {
          type: "number",
          description: "Years of history to analyze: 1, 2, 3, 4, or 5"
        },
      },
      required: ["benchmark", "period", "history"],
    },
  },
  {
    type: "function",
    name: "getReturnsAttribution",
    description: "Breaks down portfolio returns to show which asset classes, sectors, or individual stocks contributed most (or least) to overall performance. Displays a waterfall chart showing positive and negative contributions adding up to total return.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        dimension: {
          type: "string",
          description: "Dimension to attribute returns by: 'asset_class', 'sector', or 'ticker'"
        },
      },
      required: ["dimension"],
    },
  },
  {
    type: "function",
    name: "getRelativePerformance",
    description: "Compares each portfolio holding against its appropriate benchmark. For example, compares tech stocks against Nasdaq, international stocks against MSCI EAFE, etc. Shows which holdings are outperforming or underperforming their peers.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        period: {
          type: "string",
          description: "Time period: '1w', '1m', '3m', '6m', '1y', '2y', '3y', or '5y'"
        },
      },
      required: ["period"],
    },
  },
  {
    type: "function",
    name: "getCashBalance",
    description: "Gets the user's available cash balance and total portfolio value. Use this to check if there's enough cash available before placing buy orders.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "placeOrder",
    description: "Places a buy or sell order for a stock. Supports Market Open orders (execute at next market open) and Limit orders (execute only at specified price or better). Validates cash balance for buy orders and checks holdings for sell orders.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        symbol: { type: "string", description: "Stock symbol to trade (e.g., AAPL, MSFT)" },
        buySell: { type: "string", description: "'Buy' or 'Sell'" },
        orderType: { type: "string", description: "'Market Open' or 'Limit'" },
        qty: { type: "number", description: "Quantity of shares to trade" },
        price: { type: "number", description: "Limit price (required for Limit orders, optional for Market Open)" },
      },
      required: ["symbol", "buySell", "orderType", "qty"],
    },
  },
  {
    type: "function",
    name: "getOrderHistory",
    description: "Gets the user's order history showing all placed, pending, cancelled, and executed orders with details like order type, symbol, quantity, price, status, and timestamps.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "cancelOrder",
    description: "Cancels a pending order. Only orders with status 'Placed' or 'Under Review' can be cancelled. Executed or already cancelled orders cannot be cancelled.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        orderId: { type: "number", description: "Order ID to cancel" },
      },
      required: ["orderId"],
    },
  },
  {
    type: "function",
    name: "muteAssistant",
    description: "Allows the assistant to end the current conversation",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "Optional message explaining why the conversation is ending" },
      },
      required: [],
    },
  },
  {
    type: "function",
    name: "authenticateUser",
    description: "Authenticate user via phone number and date of birth for voice-based login. Use this when user wants to log in or access their portfolio.",
    parameters: {
      type: "object",
      properties: {
        phonenumber: {
          type: "string",
          description: "User's 11-digit phone number (e.g., 12345678901)",
        },
        date_of_birth: {
          type: "string",
          description: "User's date of birth in YYYY-MM-DD format (e.g., 1990-01-01)",
        },
      },
      required: ["phonenumber", "date_of_birth"],
    },
  },
];

export function createDataChannelConfig() {
  return {
    type: "session.update",
    session: {
      modalities: ["text", "audio"],
      tools: voiceAssistantTools,
      input_audio_transcription: {
        model: "whisper-1"
      },
    },
  };
}
