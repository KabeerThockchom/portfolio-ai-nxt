import { NextResponse } from "next/server"
import { clearAllCache, clearExpiredCache } from "@/lib/services/price-service"

/**
 * POST /api/cache/clear
 * Clears price cache (all or specific symbol)
 *
 * Query params:
 * - symbol: Optional ticker symbol (e.g., "SPX", "AAPL")
 * - mode: "all" (default) or "expired" (only clear expired cache)
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const mode = searchParams.get("mode") || "all"

    if (mode === "expired") {
      // Only clear expired cache (older than 24 hours)
      await clearExpiredCache()
      return NextResponse.json({
        success: true,
        message: "Cleared expired cache entries",
      })
    }

    // Clear all cache or specific symbol
    await clearAllCache(symbol || undefined)

    return NextResponse.json({
      success: true,
      message: symbol
        ? `Cleared all cache for ${symbol}`
        : "Cleared all cache entries",
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear cache",
      },
      { status: 500 }
    )
  }
}
