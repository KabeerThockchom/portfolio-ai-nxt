// API response type definitions

import { ChartData } from "./chart";

// Type for the full API response from /api/stock/chart, which might contain chartData
export interface ApiStockChartResponse {
  chartData?: ChartData; // The actual chart data is nested here
  success?: boolean;
  error?: string;
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// API call metadata for tracking how data was retrieved
export interface ApiCallMetadata {
  endpoint: string;
  method: string;
  parameters: Record<string, any>;
  timestamp: number;
  duration?: number;
  region?: string;
}
