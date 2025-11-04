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
  AccountListResponse,
  AccountBalanceResponse,
  DepositRequest,
  DepositResponse,
  WithdrawalRequest,
  WithdrawalResponse,
  CreateAccountRequest,
  CreateAccountResponse,
  ConfirmOrderRequest,
  ConfirmOrderResponse,
  RejectOrderRequest,
  RejectOrderResponse,
  TransactionHistoryResponse,
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

  // Confirm order
  const confirmOrder = async (request: ConfirmOrderRequest): Promise<ConfirmOrderResponse> => {
    const response = await fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Reject order
  const rejectOrder = async (request: RejectOrderRequest): Promise<RejectOrderResponse> => {
    const response = await fetch("/api/orders/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Get account list
  const fetchAccountList = async (userId: number): Promise<AccountListResponse> => {
    const response = await fetch(`/api/accounts/list?userId=${userId}`)
    return response.json()
  }

  // Get account balance
  const fetchAccountBalance = async (accountId: number): Promise<AccountBalanceResponse> => {
    const response = await fetch(`/api/accounts/${accountId}/balance`)
    return response.json()
  }

  // Create account
  const createAccount = async (request: CreateAccountRequest): Promise<CreateAccountResponse> => {
    const response = await fetch("/api/accounts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Deposit funds
  const depositFunds = async (request: DepositRequest): Promise<DepositResponse> => {
    const response = await fetch("/api/accounts/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Withdraw funds
  const withdrawFunds = async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    const response = await fetch("/api/accounts/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return response.json()
  }

  // Get transaction history
  const fetchTransactionHistory = async (
    userId: number,
    accountId?: number,
    type?: string
  ): Promise<TransactionHistoryResponse> => {
    let url = `/api/transactions/history?userId=${userId}`
    if (accountId) url += `&accountId=${accountId}`
    if (type) url += `&type=${type}`
    const response = await fetch(url)
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
    confirmOrder,
    rejectOrder,
    fetchAccountList,
    fetchAccountBalance,
    createAccount,
    depositFunds,
    withdrawFunds,
    fetchTransactionHistory,
  }
}
