import { useState } from "react";
import { ChartData, ChartViewMode } from "@/types";

// Hook for managing all stock-related state
export function useStockData() {
  const [selectedStock, setSelectedStock] = useState("");
  const [comparisonStocks, setComparisonStocks] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [statisticsData, setStatisticsData] = useState<any | null>(null);
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [recommendationTrendData, setRecommendationTrendData] = useState<any | null>(null);
  const [earningsCalendarData, setEarningsCalendarData] = useState<any | null>(null);
  const [trendingTickersData, setTrendingTickersData] = useState<any | null>(null);
  const [insiderTransactionsData, setInsiderTransactionsData] = useState<any | null>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<any | null>(null);
  const [incomeStatementDataState, setIncomeStatementDataState] = useState<any | null>(null);
  const [cashFlowDataState, setCashFlowDataState] = useState<any | null>(null);

  // Symbol tracking
  const [profileSymbol, setProfileSymbol] = useState<string>("");
  const [statisticsSymbol, setStatisticsSymbol] = useState<string>("");
  const [analysisSymbol, setAnalysisSymbol] = useState<string>("");
  const [recommendationTrendSymbol, setRecommendationTrendSymbol] = useState<string>("");
  const [insiderTransactionsSymbol, setInsiderTransactionsSymbol] = useState<string>("");
  const [balanceSheetSymbol, setBalanceSheetSymbol] = useState<string>("");
  const [incomeStatementSymbol, setIncomeStatementSymbol] = useState<string>("");
  const [cashFlowSymbol, setCashFlowSymbol] = useState<string>("");

  // Additional context
  const [earningsCalendarDateRange, setEarningsCalendarDateRange] = useState<{ period1?: string; period2?: string }>({});
  const [trendingTickersRegion, setTrendingTickersRegion] = useState<string>("");

  // Chart-specific state
  const [currentChartView, setCurrentChartView] = useState<ChartViewMode>("price");
  const [mainStock, setMainStock] = useState("");

  // Helper function to clear all data
  const clearAllData = () => {
    setChartData(null);
    setProfileData(null);
    setStatisticsData(null);
    setAnalysisData(null);
    setRecommendationTrendData(null);
    setEarningsCalendarData(null);
    setTrendingTickersData(null);
    setInsiderTransactionsData(null);
    setBalanceSheetData(null);
    setIncomeStatementDataState(null);
    setCashFlowDataState(null);
  };

  return {
    // State
    selectedStock,
    comparisonStocks,
    chartData,
    profileData,
    statisticsData,
    analysisData,
    recommendationTrendData,
    earningsCalendarData,
    trendingTickersData,
    insiderTransactionsData,
    balanceSheetData,
    incomeStatementDataState,
    cashFlowDataState,
    profileSymbol,
    statisticsSymbol,
    analysisSymbol,
    recommendationTrendSymbol,
    insiderTransactionsSymbol,
    balanceSheetSymbol,
    incomeStatementSymbol,
    cashFlowSymbol,
    earningsCalendarDateRange,
    trendingTickersRegion,
    currentChartView,
    mainStock,

    // Setters
    setSelectedStock,
    setComparisonStocks,
    setChartData,
    setProfileData,
    setStatisticsData,
    setAnalysisData,
    setRecommendationTrendData,
    setEarningsCalendarData,
    setTrendingTickersData,
    setInsiderTransactionsData,
    setBalanceSheetData,
    setIncomeStatementDataState,
    setCashFlowDataState,
    setProfileSymbol,
    setStatisticsSymbol,
    setAnalysisSymbol,
    setRecommendationTrendSymbol,
    setInsiderTransactionsSymbol,
    setBalanceSheetSymbol,
    setIncomeStatementSymbol,
    setCashFlowSymbol,
    setEarningsCalendarDateRange,
    setTrendingTickersRegion,
    setCurrentChartView,
    setMainStock,

    // Helpers
    clearAllData,
  };
}
