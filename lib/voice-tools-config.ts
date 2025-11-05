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
    description: "Analyzes portfolio distribution by different dimensions such as asset class (stocks, bonds, ETFs), sector (Technology, Healthcare, etc.), individual tickers, asset managers, or concentration levels. Can create multi-level breakdowns like asset class → sectors within each class. Can display as donut chart or stacked bar chart. Charts are interactive - users can click on any segment to drill down into its breakdown, and use breadcrumb navigation to go back up.",
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
          description: "For asset_class dimension, enable clickable drill-down into sectors (default: true for asset_class, false otherwise)"
        },
        chartType: {
          type: "string",
          description: "Chart type to display: 'donut' or 'bar' (default: 'donut')"
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
    description: "Compares portfolio performance against market benchmarks like S&P 500 (^GSPC), Total Stock Market (VTSAX), or Total Bond Market (VBTLX). Shows indexed performance over time and periodic returns. IMPORTANT: If the user asks for benchmark comparison without specifying which benchmark, time period, or history, ask them: 'Which benchmark would you like to compare against - S&P 500 (^GSPC), Total Stock Market (VTSAX), or Total Bond Market (VBTLX)? And what time period - weekly, monthly, quarterly, or yearly? How many years of history - 1, 2, 3, 4, or 5?'",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        benchmark: {
          type: "string",
          enum: ["^GSPC", "VTSAX", "VBTLX"],
          description: "Benchmark to compare against: '^GSPC' (S&P 500 index), 'VTSAX' (Vanguard Total Stock Market), or 'VBTLX' (Vanguard Total Bond Market)"
        },
        period: {
          type: "string",
          enum: ["weekly", "monthly", "quarterly", "yearly"],
          description: "Time period for comparison data points: 'weekly', 'monthly', 'quarterly', or 'yearly'"
        },
        history: {
          type: "number",
          enum: [1, 2, 3, 4, 5],
          description: "Years of historical data to analyze: 1, 2, 3, 4, or 5"
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
        period: {
          type: "string",
          description: "Time period: '1m', '3m', '6m', '1y', '2y', '3y', or '5y' (default: '1y')"
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
    name: "getAccounts",
    description: "Gets all user accounts including checking, savings, and brokerage accounts with their balances. Use this to show available accounts or before placing trades to let user choose which account to use.",
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
    name: "depositFunds",
    description: "Instantly deposits cash into a specified account. Funds are available immediately. Use this when user wants to add money to their account for trading or other purposes.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "Account ID to deposit into" },
        amount: { type: "number", description: "Amount to deposit (must be positive)" },
        description: { type: "string", description: "Optional description (e.g., 'Monthly savings', 'Transfer from bank')" },
      },
      required: ["accountId", "amount"],
    },
  },
  {
    type: "function",
    name: "withdrawFunds",
    description: "Withdraws cash from a specified account. Validates sufficient balance before withdrawal. Use this when user wants to take money out of their account.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "Account ID to withdraw from" },
        amount: { type: "number", description: "Amount to withdraw (must be positive and <= available balance)" },
        description: { type: "string", description: "Optional description (e.g., 'Emergency expense', 'Transfer to bank')" },
      },
      required: ["accountId", "amount"],
    },
  },
  {
    type: "function",
    name: "placeOrder",
    description: "Places a buy or sell order for a stock from a specific account. IMPORTANT: This creates a PENDING order that requires user confirmation before execution. The order will NOT execute immediately - user must approve or reject it. Returns order preview with estimated costs and balance impact. Supports Market Open orders (execute at next market open) and Limit orders (execute only at specified price or better). Validates account cash balance for buy orders.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        accountId: { type: "number", description: "Account ID to trade from (default: 1 if user has only one account)" },
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
    name: "confirmOrder",
    description: "Confirms and executes a pending order. This is the REQUIRED second step after placeOrder. Only call this after presenting the order preview to the user and getting their verbal confirmation. Updates account balance, portfolio holdings, and creates transaction record. Cannot be undone once confirmed.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "number", description: "Order ID to confirm (from placeOrder response)" },
      },
      required: ["orderId"],
    },
  },
  {
    type: "function",
    name: "rejectOrder",
    description: "Rejects and cancels a pending order. Use this when user decides not to proceed with the trade after seeing the order preview. The order will be cancelled and no money or shares will be exchanged.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "number", description: "Order ID to reject (from placeOrder response)" },
      },
      required: ["orderId"],
    },
  },
  {
    type: "function",
    name: "updateOrder",
    description: "Updates a pending order's parameters before confirmation. Can modify quantity, order type (Market Open vs Limit), and limit price. Useful when user wants to change their order details after placing it but before confirming. Only works on orders with 'Placed' or 'Under Review' status. Cannot update executed or cancelled orders.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "number", description: "Order ID to update" },
        qty: { type: "number", description: "Optional: new quantity of shares" },
        orderType: { type: "string", description: "Optional: order type ('Market Open' or 'Limit')" },
        limitPrice: { type: "number", description: "Optional: limit price for Limit orders only" },
      },
      required: ["orderId"],
    },
  },
  {
    type: "function",
    name: "getTransactionHistory",
    description: "Gets unified transaction history showing all money movements: deposits, withdrawals, buys, and sells. Displays transactions from all accounts with dates, amounts, symbols, and descriptions. Can filter by account or transaction type.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        accountId: { type: "number", description: "Optional: filter by specific account ID" },
        type: { type: "string", description: "Optional: filter by type ('DEPOSIT', 'WITHDRAW', 'BUY', 'SELL', or 'all')" },
      },
      required: [],
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
    name: "getPriceTrend",
    description: "Shows historical price trends for portfolio holdings over time. Displays percentage change from start date for easy comparison. Useful for analyzing how individual holdings have performed over various time periods.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "number", description: "User ID (default: 1)" },
        tickers: {
          type: "array",
          items: { type: "string" },
          description: "Optional: array of ticker symbols to analyze. If not provided, shows all portfolio holdings."
        },
        timeHistory: {
          type: "number",
          description: "Years of history to fetch (e.g., 1, 2, 3, 5). Default: 2 years."
        },
      },
      required: [],
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
    description: "Authenticate user via full name and date of birth for voice-based login. Use this when user wants to log in or access their portfolio. Natural examples: 'My name is John Doe and my birthday is January 1st, 1990' or 'I'm Jane Smith, born on March 15th, 1985'.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "User's full name exactly as registered (e.g., 'John Doe', 'Jane Smith'). Case-sensitive match.",
        },
        date_of_birth: {
          type: "string",
          description: "User's date of birth in YYYY-MM-DD format (e.g., 1990-01-01). Parse from natural language if needed (e.g., 'January 1st, 1990' → '1990-01-01').",
        },
      },
      required: ["name", "date_of_birth"],
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
