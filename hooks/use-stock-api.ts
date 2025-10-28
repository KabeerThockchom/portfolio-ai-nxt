import { useCallback } from "react";
import { ApiStockChartResponse } from "@/types";

// Hook for all stock API fetch functions
export function useStockApi() {
  const fetchStockChart = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, comparisons, range, interval, events } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      if (comparisons) params.append("comparisons", comparisons);
      if (range) params.append("range", range || "1mo");
      if (interval) params.append("interval", interval || "1d");
      if (events) params.append("events", events || "div,split,earn");
      params.append("includeAdjustedClose", "true");

      const response = await fetch(`/api/stock/chart?${params.toString()}`);
      const result: ApiStockChartResponse = await response.json();

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stock chart");
      }
      return result;
    } catch (error) {
      console.error("Error fetching stock chart:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error fetching stock chart",
      };
    }
  }, []);

  const fetchStockProfile = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      const response = await fetch(`/api/stock/profile?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching stock profile:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock profile" };
    }
  }, []);

  const fetchStockStatistics = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      const response = await fetch(`/api/stock/statistics?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching stock statistics:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock statistics" };
    }
  }, []);

  const fetchStockAnalysis = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      const response = await fetch(`/api/stock/analysis?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching stock analysis:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock analysis" };
    }
  }, []);

  const fetchStockRecommendationTrend = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      const response = await fetch(`/api/stock/recommendation-trend?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching recommendation trend:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching recommendation trend" };
    }
  }, []);

  const fetchEarningsCalendar = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { period1, period2, region, size, offset, sortField, sortType } = args;
      const params = new URLSearchParams();
      if (period1) params.append("period1", period1);
      if (period2) params.append("period2", period2);
      if (region) params.append("region", region);
      if (size) params.append("size", size.toString());
      if (offset) params.append("offset", offset.toString());
      if (sortField) params.append("sortField", sortField);
      if (sortType) params.append("sortType", sortType);
      const response = await fetch(`/api/stock/earnings-calendar?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching earnings calendar:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching earnings calendar" };
    }
  }, []);

  const fetchTrendingTickers = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { region, lang } = args;
      const params = new URLSearchParams();
      if (region) params.append("region", region);
      if (lang) params.append("lang", lang);
      const response = await fetch(`/api/market/trending-tickers?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching trending tickers:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching trending tickers" };
    }
  }, []);

  const fetchInsiderTransactions = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, lang } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      if (lang) params.append("lang", lang);
      const response = await fetch(`/api/stock/insider-transactions?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching insider transactions:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching insider transactions" };
    }
  }, []);

  const fetchFinancials = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, lang } = args;
      const params = new URLSearchParams();
      params.append("symbol", symbol);
      if (region) params.append("region", region);
      if (lang) params.append("lang", lang);
      const response = await fetch(`/api/stock/financials?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching financials:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching financials" };
    }
  }, []);

  return {
    fetchStockChart,
    fetchStockProfile,
    fetchStockStatistics,
    fetchStockAnalysis,
    fetchStockRecommendationTrend,
    fetchEarningsCalendar,
    fetchTrendingTickers,
    fetchInsiderTransactions,
    fetchFinancials,
  };
}
