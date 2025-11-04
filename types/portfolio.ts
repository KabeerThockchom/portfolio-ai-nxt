// User types
export interface User {
  userId: number
  name: string
  username: string
  dob: string
  phoneNumber: string
}

// Asset types
export interface Asset {
  assetId: number
  assetTicker: string
  assetName: string
  assetClass: string // Stock, Cash, Bond, ETF, Mutual Fund
  netExpenseRatio?: number
  morningstarRating?: number
  maturityDate?: string
  oneYrVolatility?: number
  similarAsset?: string
  category?: string
  assetManager?: string
  portfolioComposition?: Record<string, any>
  bondRating?: number
  concentration?: string
}

// Portfolio holding
export interface PortfolioHolding {
  userPortId: number
  userId: number
  assetId: number
  assetTotalUnits: number
  avgCostPerUnit: number
  investmentAmount: number
  // Calculated/joined fields
  asset?: Asset
  latestClosePrice?: number
  currentAmount?: number
  gainLoss?: number
  gainLossPercent?: number
}

// Account
export interface Account {
  accountId: number
  userId: number
  accountName: string
  accountType: "checking" | "savings" | "brokerage"
  cashBalance: number
  isDefault: boolean
  createdAt: string
}

// Transaction
export interface Transaction {
  transId: number
  userId: number
  accountId?: number
  assetId?: number
  transType: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW"
  date: string
  units?: number
  pricePerUnit?: number
  cost: number
  description?: string
  // Joined fields
  asset?: Asset
  accountName?: string
  accountType?: string
  assetTicker?: string
  assetName?: string
}

// Order
export interface Order {
  orderId: number
  userId: number
  accountId?: number
  assetId: number
  orderType: string // Market Open, Limit, etc.
  symbol: string
  description?: string
  buySell: "Buy" | "Sell"
  unitPrice: number
  limitPrice?: number
  qty: number
  amount: number
  settlementDate: string
  orderStatus: "Placed" | "Under Review" | "Cancelled" | "Executed"
  confirmationStatus: "pending_confirmation" | "confirmed" | "rejected"
  orderDate: string
  // Joined fields
  asset?: Asset
}

// Order preview (shown before confirmation)
export interface OrderPreview {
  orderId: number
  symbol: string
  buySell: "Buy" | "Sell"
  quantity: number
  estimatedPrice: number
  estimatedTotal: number
  accountName: string
  accountBalance: number
  balanceAfterTrade: number
}

// Asset historical price
export interface AssetHistoryRecord {
  assetHistId: number
  assetId: number
  date: string
  closePrice: number
}

// Asset sector breakdown
export interface AssetSector {
  assetSecId: number
  assetId: number
  sectorSymbol: string
  sectorName: string
  sectorWeightage: number
}

// Benchmark
export interface Benchmark {
  benchmarkId: number
  benchmarkAssetId: number
  benchmarkForAssetClass: string
  asset?: Asset
}

// Relative benchmark
export interface RelativeBenchmark {
  id: number
  assetTicker: string
  assetName: string
  relativeBenchmark: string
}

// Risk level mapping
export interface AssetRiskMapping {
  assetRiskId: number
  assetType: string
  volatilityRangeStart: number
  volatilityRangeEnd: number
  riskScore: number
  concentration?: string
  score1?: number
  addon1?: number
  addon2?: number
}

// Portfolio aggregation result
export interface PortfolioAggregation {
  dimension: string // Asset Class, Sector, Ticker, Asset Manager, etc.
  label: string // The value (e.g., "Stock", "Technology", "AAPL")
  totalValue: number
  percentageReturn?: number
  count?: number
  children?: PortfolioAggregation[] // For multi-level charts
}

// Benchmark comparison result
export interface BenchmarkComparison {
  date: string
  portfolioValue: number
  benchmarkValue: number
  portfolioReturn?: number
  benchmarkReturn?: number
}

// Risk analysis result
export interface RiskAnalysisResult {
  dimension: string // Asset Class, Sector, Ticker
  label: string
  investmentAmount: number
  riskScore: number
  volatility?: number
  concentration?: string
}

// Returns attribution result
export interface ReturnsAttribution {
  dimension: string
  label: string
  contribution: number
  weightedReturn: number
}

// Relative performance result
export interface RelativePerformance {
  ticker: string
  assetName: string
  portfolioReturn: number
  benchmarkReturn: number
  relativeBenchmark: string
  outperformance: number
}

// Chart data types
export interface DonutChartData {
  labels: string[]
  series: number[]
  colors?: string[]
  children?: DonutChartData // For multi-level donut
}

export interface BubbleChartData {
  name: string
  data: Array<{
    x: string
    y: number
    z: number // Bubble size (risk score)
  }>
}

export interface BenchmarkChartData {
  categories: string[] // Dates or time periods
  portfolioSeries: number[]
  benchmarkSeries: number[]
  portfolioReturnSeries?: number[]
  benchmarkReturnSeries?: number[]
}

export interface WaterfallChartData {
  categories: string[]
  data: number[]
}

export interface GaugeChartData {
  value: number
  min: number
  max: number
  label: string
}

// API request/response types
export interface PortfolioAggregationRequest {
  userId: number
  dimension: "asset_class" | "sector" | "ticker" | "asset_manager" | "category" | "concentration"
  metric: "total_value" | "percentage_return"
  multiLevel?: boolean // For multi-level donut charts
}

export interface BenchmarkRequest {
  userId: number
  benchmark: "^GSPC" | "VTSAX" | "VBTLX"
  period: "weekly" | "monthly" | "quarterly" | "yearly"
  history: 1 | 2 | 3 | 4 | 5 // Years
}

export interface RiskAnalysisRequest {
  userId: number
  dimension?: "asset_class" | "sector" | "ticker"
}

export interface ReturnsAttributionRequest {
  userId: number
  dimension: "asset_class" | "sector" | "ticker"
  period?: "1m" | "3m" | "6m" | "1y" | "2y" | "3y" | "5y"
}

export interface RelativePerformanceRequest {
  userId: number
  period: "1w" | "1m" | "3m" | "6m" | "1y" | "2y" | "3y" | "5y"
}

export interface PlaceOrderRequest {
  userId: number
  accountId: number
  symbol: string
  buySell: "Buy" | "Sell"
  orderType: "Market Open" | "Limit"
  qty: number
  price?: number // Required for Limit orders
}

export interface CancelOrderRequest {
  userId: number
  orderId: number
}

export interface ConfirmOrderRequest {
  orderId: number
}

export interface RejectOrderRequest {
  orderId: number
}

export interface UpdateOrderRequest {
  orderId: number
  qty?: number
  orderType?: "Market Open" | "Limit"
  limitPrice?: number
}

export interface DepositRequest {
  accountId: number
  amount: number
  description?: string
}

export interface WithdrawalRequest {
  accountId: number
  amount: number
  description?: string
}

export interface CreateAccountRequest {
  userId: number
  accountName: string
  accountType: "checking" | "savings" | "brokerage"
  initialBalance?: number
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type PortfolioHoldingsResponse = ApiResponse<{
  holdings: PortfolioHolding[]
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
}>

export type PortfolioAggregationResponse = ApiResponse<{
  aggregation: PortfolioAggregation[]
  chartData: DonutChartData
}>

export type BenchmarkResponse = ApiResponse<{
  comparison: BenchmarkComparison[]
  chartData: BenchmarkChartData
}>

export type RiskAnalysisResponse = ApiResponse<{
  analysis: RiskAnalysisResult[]
  overallRiskScore: number
  chartData: {
    bubbleData: BubbleChartData[]
    gaugeData: GaugeChartData
  }
}>

export type ReturnsAttributionResponse = ApiResponse<{
  attribution: ReturnsAttribution[]
  totalReturn: number
  chartData: WaterfallChartData
}>

export type RelativePerformanceResponse = ApiResponse<{
  performance: RelativePerformance[]
}>

export type OrderHistoryResponse = ApiResponse<{
  orders: Order[]
}>

export type PlaceOrderResponse = ApiResponse<{
  order: Order
  message: string
  orderPreview: OrderPreview
}>

export type ConfirmOrderResponse = ApiResponse<{
  orderId: number
  message: string
  newBalance: number
}>

export type RejectOrderResponse = ApiResponse<{
  orderId: number
  message: string
}>

export type UpdateOrderResponse = ApiResponse<{
  order: Order
  message: string
}>

export type AccountListResponse = ApiResponse<{
  accounts: Account[]
  totalCash: number
}>

export type AccountBalanceResponse = ApiResponse<{
  accountId: number
  accountName: string
  accountType: string
  cashBalance: number
}>

export type DepositResponse = ApiResponse<{
  accountId: number
  accountName: string
  depositAmount: number
  previousBalance: number
  newBalance: number
  transactionId: number
  timestamp: string
}>

export type WithdrawalResponse = ApiResponse<{
  accountId: number
  accountName: string
  withdrawAmount: number
  previousBalance: number
  newBalance: number
  transactionId: number
  timestamp: string
}>

export type CreateAccountResponse = ApiResponse<{
  account: Account
  message: string
}>

export type TransactionHistoryResponse = ApiResponse<{
  transactions: Transaction[]
  totalTransactions: number
  summary: {
    totalDeposits: number
    totalWithdrawals: number
    totalBuys: number
    totalSells: number
  }
}>

export type CashBalanceResponse = ApiResponse<{
  userId: number
  cashBalance: number
  totalPortfolioValue: number
  totalInvested: number
}>

// Price trend types
export interface PriceTrendRequest {
  userId: number
  tickers?: string[]
  timeHistory: number
}

export interface PriceTrendData {
  ticker: string
  assetName: string
  priceHistory: Array<{
    date: string
    price: number
    percentChange: number
  }>
  startPrice: number
  currentPrice: number
  totalReturn: number
  totalReturnPercent: number
}

export type PriceTrendResponse = ApiResponse<{
  trends: PriceTrendData[]
  chartData: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
}>
