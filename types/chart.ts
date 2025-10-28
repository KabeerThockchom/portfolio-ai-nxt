// Chart-related type definitions

export interface ChartMeta {
  dataGranularity?: string;
  range?: string;
  // Add other meta properties if known
}

export interface ChartResultItem {
  meta: ChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
    adjclose?: Array<{
      adjclose?: Array<number | null>;
    }>;
  };
  // Add other result item properties if known
}

export interface ChartData {
  chart?: {
    result?: ChartResultItem[];
    error?: any; // Or a more specific error type
  };
  success?: boolean;
  error?: string;
  // Add other chartData properties if known, e.g., from fetchStockChart response
}

export type ChartViewMode = "price" | "percent" | "relative";
