import type {
  PortfolioHoldingsResponse,
  PortfolioAggregationResponse,
  PortfolioAggregationRequest,
  BenchmarkRequest,
  BenchmarkResponse,
  RiskAnalysisRequest,
  RiskAnalysisResponse,
  ReturnsAttributionRequest,
  ReturnsAttributionResponse,
  RelativePerformanceRequest,
  RelativePerformanceResponse,
  CashBalanceResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  OrderHistoryResponse,
} from "@/types/portfolio"

/**
 * Custom hook for centralized portfolio API functions
 * Follows the same pattern as use-stock-api.ts
 */
export function usePortfolioApi() {
  // Portfolio holdings
  const fetchPortfolioHoldings = async (userId: number): Promise<PortfolioHoldingsResponse> => {
    const response = await fetch(`/api/portfolio/holdings?userId=${userId}`)
    return response.json()
  }

  // Portfolio aggregation
  const fetchPortfolioAggregation = async (
    request: PortfolioAggregationRequest
  ): Promise<PortfolioAggregationResponse> => {
    const response = await fetch("/api/portfolio/aggregation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Portfolio benchmarking
  const fetchPortfolioBenchmark = async (
    request: BenchmarkRequest
  ): Promise<BenchmarkResponse> => {
    const response = await fetch("/api/portfolio/benchmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Portfolio risk analysis
  const fetchPortfolioRisk = async (
    request: RiskAnalysisRequest
  ): Promise<RiskAnalysisResponse> => {
    const response = await fetch("/api/portfolio/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Returns attribution
  const fetchReturnsAttribution = async (
    request: ReturnsAttributionRequest
  ): Promise<ReturnsAttributionResponse> => {
    const response = await fetch("/api/portfolio/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Relative performance
  const fetchRelativePerformance = async (
    request: RelativePerformanceRequest
  ): Promise<RelativePerformanceResponse> => {
    const response = await fetch("/api/portfolio/relative-performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Cash balance
  const fetchCashBalance = async (userId: number): Promise<CashBalanceResponse> => {
    const response = await fetch(`/api/user/cash-balance?userId=${userId}`)
    return response.json()
  }

  // Place order
  const placeOrder = async (request: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    const response = await fetch("/api/orders/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Get order history
  const fetchOrderHistory = async (userId: number): Promise<OrderHistoryResponse> => {
    const response = await fetch(`/api/orders/history?userId=${userId}`)
    return response.json()
  }

  // Cancel order
  const cancelOrder = async (userId: number, orderId: number) => {
    const response = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, orderId }),
    })
    return response.json()
  }

  return {
    fetchPortfolioHoldings,
    fetchPortfolioAggregation,
    fetchPortfolioBenchmark,
    fetchPortfolioRisk,
    fetchReturnsAttribution,
    fetchRelativePerformance,
    fetchCashBalance,
    placeOrder,
    fetchOrderHistory,
    cancelOrder,
  }
}
