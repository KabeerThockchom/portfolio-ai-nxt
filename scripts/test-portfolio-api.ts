/**
 * Simple test script to verify portfolio API routes
 * Run with: npx tsx scripts/test-portfolio-api.ts
 */

const API_BASE = "http://localhost:3000"
const USER_ID = 1

async function testAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function runTests() {
  console.log("🧪 Testing Portfolio API Routes\n")
  console.log("=" .repeat(60))

  // Test 1: Get Portfolio Holdings
  console.log("\n1️⃣  Testing GET /api/portfolio/holdings")
  const holdings = await testAPI(`/api/portfolio/holdings?userId=${USER_ID}`)
  console.log("Success:", holdings.success)
  if (holdings.success) {
    console.log("Total Value:", holdings.data.totalValue)
    console.log("Holdings Count:", holdings.data.holdings.length)
    console.log("Gain/Loss:", holdings.data.totalGainLoss)
  } else {
    console.error("Error:", holdings.error)
  }

  // Test 2: Get Cash Balance
  console.log("\n2️⃣  Testing GET /api/user/cash-balance")
  const cash = await testAPI(`/api/user/cash-balance?userId=${USER_ID}`)
  console.log("Success:", cash.success)
  if (cash.success) {
    console.log("Cash Balance:", cash.data.cashBalance)
    console.log("Total Portfolio Value:", cash.data.totalPortfolioValue)
  } else {
    console.error("Error:", cash.error)
  }

  // Test 3: Portfolio Aggregation
  console.log("\n3️⃣  Testing POST /api/portfolio/aggregation")
  const aggregation = await testAPI("/api/portfolio/aggregation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      dimension: "asset_class",
      metric: "total_value",
    }),
  })
  console.log("Success:", aggregation.success)
  if (aggregation.success) {
    console.log("Aggregations:", aggregation.data.aggregation.length)
    console.log("Chart Labels:", aggregation.data.chartData.labels)
  } else {
    console.error("Error:", aggregation.error)
  }

  // Test 4: Risk Analysis
  console.log("\n4️⃣  Testing POST /api/portfolio/risk")
  const risk = await testAPI("/api/portfolio/risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: USER_ID,
      dimension: "asset_class",
    }),
  })
  console.log("Success:", risk.success)
  if (risk.success) {
    console.log("Overall Risk Score:", risk.data.overallRiskScore)
    console.log("Risk Analysis Count:", risk.data.analysis.length)
  } else {
    console.error("Error:", risk.error)
  }

  // Test 5: Get Order History
  console.log("\n5️⃣  Testing GET /api/orders/history")
  const orders = await testAPI(`/api/orders/history?userId=${USER_ID}`)
  console.log("Success:", orders.success)
  if (orders.success) {
    console.log("Orders Count:", orders.data.orders.length)
    if (orders.data.orders.length > 0) {
      const order = orders.data.orders[0]
      console.log("First Order:", {
        id: order.orderId,
        status: order.orderStatus,
        symbol: order.symbol,
        buySell: order.buySell,
      })
    }
  } else {
    console.error("Error:", orders.error)
  }

  console.log("\n" + "=".repeat(60))
  console.log("✅ Testing Complete\n")
}

// Run tests
runTests().catch(console.error)
