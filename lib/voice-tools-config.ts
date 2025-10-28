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
