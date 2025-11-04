// Content history type definitions

import { ChartData, ChartViewMode } from "./chart";
import { ApiCallMetadata } from "./api";

export type HistoryContentType =
  | "chart"
  | "profile"
  | "statistics"
  | "analysis"
  | "recommendation-trend"
  | "earnings-calendar"
  | "trending-tickers"
  | "insider-transactions"
  | "balance-sheet"
  | "income-statement"
  | "cash-flow"
  | "portfolio-holdings"
  | "portfolio-aggregation"
  | "portfolio-risk"
  | "portfolio-benchmark"
  | "portfolio-attribution"
  | "portfolio-relative-performance"
  | "portfolio-price-trend";

// Interface for history items - supports chart, profile, and statistics
export interface HistoryItem {
  type: HistoryContentType;
  symbol: string;
  // API call metadata
  apiCallDetails?: ApiCallMetadata;
  // Chart-specific data
  chartData?: ChartData;
  mainStock?: string;
  selectedStock?: string;
  comparisonStocks?: string[];
  viewMode?: ChartViewMode;
  // Profile-specific data
  profileData?: any;
  // Statistics-specific data
  statisticsData?: any;
  // Analysis-specific data
  analysisData?: any;
  // Recommendation Trend-specific data
  recommendationTrendData?: any;
  // Earnings Calendar-specific data
  earningsCalendarData?: any;
  earningsCalendarDateRange?: { period1?: string; period2?: string };
  // Trending Tickers-specific data
  trendingTickersData?: any;
  trendingTickersRegion?: string;
  // Insider Transactions-specific data
  insiderTransactionsData?: any;
  // Financial Statements-specific data
  balanceSheetData?: any;
  incomeStatementData?: any;
  cashFlowData?: any;
  // Portfolio-specific data
  portfolioHoldingsData?: any;
  portfolioAggregationData?: any;
  portfolioRiskData?: any;
  portfolioBenchmarkData?: any;
  portfolioAttributionData?: any;
  portfolioRelativePerformanceData?: any;
  portfolioPriceTrendData?: any;
}

export type SlideDirection = 'none' | 'left' | 'right';
