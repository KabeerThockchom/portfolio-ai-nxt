import { useState } from "react"
import type {
  PortfolioAggregation,
  DonutChartData,
  BenchmarkComparison,
  BenchmarkChartData,
  RiskAnalysisResult,
  BubbleChartData,
  GaugeChartData,
  ReturnsAttribution,
  WaterfallChartData,
  RelativePerformance,
} from "@/types/portfolio"

/**
 * Custom hook for managing portfolio analysis state
 * Handles aggregation, benchmarking, risk, attribution, and relative performance
 */
export function usePortfolioAnalysis() {
  // Aggregation state
  const [aggregationData, setAggregationData] = useState<PortfolioAggregation[]>([])
  const [aggregationChartData, setAggregationChartData] = useState<DonutChartData | null>(
    null
  )
  const [aggregationDimension, setAggregationDimension] = useState<string>("")
  const [isLoadingAggregation, setIsLoadingAggregation] = useState<boolean>(false)

  // Benchmark state
  const [benchmarkComparison, setBenchmarkComparison] = useState<BenchmarkComparison[]>([])
  const [benchmarkChartData, setBenchmarkChartData] = useState<BenchmarkChartData | null>(
    null
  )
  const [benchmarkType, setBenchmarkType] = useState<string>("")
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState<boolean>(false)

  // Risk analysis state
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult[]>([])
  const [overallRiskScore, setOverallRiskScore] = useState<number>(0)
  const [riskBubbleData, setRiskBubbleData] = useState<BubbleChartData[]>([])
  const [riskGaugeData, setRiskGaugeData] = useState<GaugeChartData | null>(null)
  const [isLoadingRisk, setIsLoadingRisk] = useState<boolean>(false)

  // Returns attribution state
  const [attributionData, setAttributionData] = useState<ReturnsAttribution[]>([])
  const [totalReturn, setTotalReturn] = useState<number>(0)
  const [attributionChartData, setAttributionChartData] =
    useState<WaterfallChartData | null>(null)
  const [isLoadingAttribution, setIsLoadingAttribution] = useState<boolean>(false)

  // Relative performance state
  const [relativePerformance, setRelativePerformance] = useState<RelativePerformance[]>([])
  const [isLoadingRelativePerformance, setIsLoadingRelativePerformance] =
    useState<boolean>(false)

  // Clear all analysis data
  const clearAnalysisData = () => {
    setAggregationData([])
    setAggregationChartData(null)
    setAggregationDimension("")
    setBenchmarkComparison([])
    setBenchmarkChartData(null)
    setBenchmarkType("")
    setRiskAnalysis([])
    setOverallRiskScore(0)
    setRiskBubbleData([])
    setRiskGaugeData(null)
    setAttributionData([])
    setTotalReturn(0)
    setAttributionChartData(null)
    setRelativePerformance([])
  }

  return {
    // Aggregation
    aggregationData,
    setAggregationData,
    aggregationChartData,
    setAggregationChartData,
    aggregationDimension,
    setAggregationDimension,
    isLoadingAggregation,
    setIsLoadingAggregation,

    // Benchmark
    benchmarkComparison,
    setBenchmarkComparison,
    benchmarkChartData,
    setBenchmarkChartData,
    benchmarkType,
    setBenchmarkType,
    isLoadingBenchmark,
    setIsLoadingBenchmark,

    // Risk
    riskAnalysis,
    setRiskAnalysis,
    overallRiskScore,
    setOverallRiskScore,
    riskBubbleData,
    setRiskBubbleData,
    riskGaugeData,
    setRiskGaugeData,
    isLoadingRisk,
    setIsLoadingRisk,

    // Attribution
    attributionData,
    setAttributionData,
    totalReturn,
    setTotalReturn,
    attributionChartData,
    setAttributionChartData,
    isLoadingAttribution,
    setIsLoadingAttribution,

    // Relative performance
    relativePerformance,
    setRelativePerformance,
    isLoadingRelativePerformance,
    setIsLoadingRelativePerformance,

    // Actions
    clearAnalysisData,
  }
}
