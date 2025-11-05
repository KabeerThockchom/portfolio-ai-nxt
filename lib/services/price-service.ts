import { db } from "@/lib/db/connection"
import { priceCache, assetHistory, assetType, userPortfolio } from "@/lib/db/schema"
import { eq, and, gte, lte } from "drizzle-orm"

export interface HistoricalPrice {
  date: string // ISO date string YYYY-MM-DD
  closePrice: number
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Rate limiting: 10 requests per second
// Use a sliding window to track requests in the last second
const MAX_REQUESTS_PER_SECOND = 10
const requestTimestamps: number[] = []

/**
 * Rate limiter for API requests (10 req/sec max) using sliding window
 */
async function rateLimitedFetch<T>(fetchFn: () => Promise<T>): Promise<T> {
  const now = Date.now()

  // Remove timestamps older than 1 second
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 1000) {
    requestTimestamps.shift()
  }

  // If we've hit the limit, wait until we can make another request
  if (requestTimestamps.length >= MAX_REQUESTS_PER_SECOND) {
    const oldestTimestamp = requestTimestamps[0]
    const waitTime = 1000 - (now - oldestTimestamp) + 10 // Add 10ms buffer
    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Clean up old timestamps again after waiting
    const newNow = Date.now()
    while (requestTimestamps.length > 0 && requestTimestamps[0] < newNow - 1000) {
      requestTimestamps.shift()
    }
  }

  // Record this request
  requestTimestamps.push(Date.now())

  // Execute the fetch
  return await fetchFn()
}

/**
 * Get historical prices for a symbol with automatic caching
 * @param symbol Stock ticker symbol
 * @param startDate ISO date string (YYYY-MM-DD)
 * @param endDate ISO date string (YYYY-MM-DD)
 * @param baseUrl Optional base URL for API calls (useful in development with dynamic ports)
 * @returns Array of historical prices
 */
export async function getHistoricalPrices(
  symbol: string,
  startDate: string,
  endDate: string,
  baseUrl?: string
): Promise<HistoricalPrice[]> {
  try {
    // 1. Check cache for this symbol and date range
    const cachedPrices = await getCachedPrices(symbol, startDate, endDate)

    // 2. If cache is complete and fresh, return it
    if (cachedPrices.length > 0 && isCacheFresh(cachedPrices)) {
      console.log(`Cache HIT for ${symbol} (${startDate} to ${endDate}): ${cachedPrices.length} records`)
      return cachedPrices.map(cp => ({
        date: cp.date,
        closePrice: cp.closePrice
      }))
    }

    // 3. Cache miss or stale - fetch from Yahoo Finance
    console.log(`Cache MISS for ${symbol} (${startDate} to ${endDate}), fetching from API...`)
    const fetchedPrices = await fetchHistoricalPricesFromAPI(symbol, startDate, endDate, baseUrl)

    // 4. Store in cache
    if (fetchedPrices.length > 0) {
      await cachePrices(symbol, fetchedPrices)
      console.log(`Cached ${fetchedPrices.length} prices for ${symbol}`)
    }

    // 5. Return fetched prices
    return fetchedPrices
  } catch (error) {
    console.error(`Error getting historical prices for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get current price for a symbol with database caching (updated once per day)
 * @param symbol Stock ticker symbol
 * @param baseUrl Optional base URL for API calls (useful in development with dynamic ports)
 * @param forceRefresh Force fetch from API, bypassing cache
 * @returns Current price
 */
export async function getCurrentPrice(symbol: string, baseUrl?: string, forceRefresh = false): Promise<number> {
  try {
    // Special case for CASH
    if (symbol === "CASH") {
      return 1.0
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Check cache first (unless forceRefresh is true)
    if (!forceRefresh) {
      // Get asset ID from symbol
      const assetRecord = await db
        .select()
        .from(assetType)
        .where(eq(assetType.assetTicker, symbol))
        .limit(1)

      if (assetRecord.length > 0) {
        const assetId = assetRecord[0].assetId

        // Check if we have today's price in asset_history
        const cachedPrice = await db
          .select()
          .from(assetHistory)
          .where(
            and(
              eq(assetHistory.assetId, assetId),
              eq(assetHistory.date, today)
            )
          )
          .limit(1)

        // If cached and updated today, return cached price
        if (cachedPrice.length > 0 && cachedPrice[0].updatedAt) {
          const updatedDate = cachedPrice[0].updatedAt.split('T')[0]
          if (updatedDate === today) {
            console.log(`[Cache HIT] ${symbol}: $${cachedPrice[0].closePrice} (updated: ${cachedPrice[0].updatedAt})`)
            return cachedPrice[0].closePrice
          }
        }
      }
    }

    // Cache miss or forceRefresh - fetch from API
    console.log(`[Cache MISS] ${symbol}: fetching from API...`)
    const price = await rateLimitedFetch(async () => {
      const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const quoteResponse = await fetch(`${apiBase}/api/stock/quote?symbol=${symbol}`)

      if (!quoteResponse.ok) {
        console.warn(`Quote API returned ${quoteResponse.status} for ${symbol}`)
        return 0
      }

      const quoteData = await quoteResponse.json()

      if (quoteData.success && quoteData.data?.price) {
        return quoteData.data.price
      } else {
        console.warn(`Failed to fetch real-time price for ${symbol}: ${quoteData.error || 'Unknown error'}`)
        return 0
      }
    })

    // Update cache with new price
    if (price > 0) {
      await updatePriceCache(symbol, today, price)
    }

    return price
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}:`, error)
    return 0
  }
}

/**
 * Check cache for historical prices
 */
async function getCachedPrices(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; closePrice: number; cachedAt: string }>> {
  const cached = await db
    .select()
    .from(priceCache)
    .where(
      and(
        eq(priceCache.symbol, symbol),
        gte(priceCache.date, startDate),
        lte(priceCache.date, endDate)
      )
    )
    .orderBy(priceCache.date)

  return cached
}

/**
 * Check if cached prices are still fresh (< 24 hours old)
 */
function isCacheFresh(cachedPrices: Array<{ cachedAt: string }>): boolean {
  if (cachedPrices.length === 0) return false

  // Check the oldest cached price
  const oldestCachedAt = new Date(cachedPrices[0].cachedAt).getTime()
  const now = Date.now()

  return (now - oldestCachedAt) < CACHE_TTL_MS
}

/**
 * Fetch historical prices from Yahoo Finance API with rate limiting
 */
async function fetchHistoricalPricesFromAPI(
  symbol: string,
  startDate: string,
  endDate: string,
  baseUrl?: string
): Promise<HistoricalPrice[]> {
  try {
    // Use rate limiter to ensure we don't exceed 10 req/sec
    return await rateLimitedFetch(async () => {
      // Yahoo Finance API expects dates in YYYY-MM-DD format, not Unix timestamps
      const apiBase = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const url = `${apiBase}/api/stock/chart?symbol=${symbol}&region=US&interval=1d&period1=${startDate}&period2=${endDate}`

      console.log(`Fetching historical prices from: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        console.error(`Chart API returned ${response.status} for ${symbol}`)
        return []
      }

      const data = await response.json()

      if (!data.success || !data.chartData?.chart?.result?.[0]) {
        console.error(`No chart data available for ${symbol}`)
        return []
      }

      const result = data.chartData.chart.result[0]
      const timestamps = result.timestamp || []
      const closes = result.indicators?.quote?.[0]?.close || []

      // Convert to HistoricalPrice format
      const prices: HistoricalPrice[] = []
      for (let i = 0; i < timestamps.length; i++) {
        if (closes[i] != null) {
          const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
          prices.push({
            date,
            closePrice: closes[i]
          })
        }
      }

      return prices
    })
  } catch (error) {
    console.error(`Error fetching historical prices from API for ${symbol}:`, error)
    return []
  }
}

/**
 * Store prices in cache
 */
async function cachePrices(symbol: string, prices: HistoricalPrice[]): Promise<void> {
  try {
    const now = new Date().toISOString()

    // Delete old cached prices for this symbol and date range
    const dates = prices.map(p => p.date)
    if (dates.length > 0) {
      await db
        .delete(priceCache)
        .where(
          and(
            eq(priceCache.symbol, symbol),
            gte(priceCache.date, dates[0]),
            lte(priceCache.date, dates[dates.length - 1])
          )
        )
    }

    // Insert new prices
    const records = prices.map(price => ({
      symbol,
      date: price.date,
      closePrice: price.closePrice,
      cachedAt: now
    }))

    if (records.length > 0) {
      await db.insert(priceCache).values(records)
    }
  } catch (error) {
    console.error(`Error caching prices for ${symbol}:`, error)
    // Don't throw - caching is not critical
  }
}

/**
 * Clear expired cache entries (older than 24 hours)
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - CACHE_TTL_MS).toISOString()

    await db
      .delete(priceCache)
      .where(lte(priceCache.cachedAt, cutoffTime))

    console.log(`Cleared cache entries older than ${cutoffTime}`)
  } catch (error) {
    console.error('Error clearing expired cache:', error)
  }
}

/**
 * Clear ALL cache entries (use with caution - clears entire cache)
 * @param symbol Optional symbol to clear cache for specific ticker (e.g., "SPX")
 */
export async function clearAllCache(symbol?: string): Promise<void> {
  try {
    if (symbol) {
      // Clear cache for specific symbol
      await db
        .delete(priceCache)
        .where(eq(priceCache.symbol, symbol))

      console.log(`Cleared all cache entries for ${symbol}`)
    } else {
      // Clear all cache
      await db.delete(priceCache)

      console.log('Cleared ALL cache entries')
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
    throw error
  }
}

/**
 * Update price cache in asset_history table
 * @param symbol Stock ticker symbol
 * @param date ISO date string (YYYY-MM-DD)
 * @param price Closing price
 */
async function updatePriceCache(symbol: string, date: string, price: number): Promise<void> {
  try {
    // Get asset ID from symbol
    const assetRecord = await db
      .select()
      .from(assetType)
      .where(eq(assetType.assetTicker, symbol))
      .limit(1)

    if (assetRecord.length === 0) {
      console.warn(`Asset not found for symbol: ${symbol}`)
      return
    }

    const assetId = assetRecord[0].assetId
    const now = new Date().toISOString()

    // Check if record already exists for this date
    const existingRecord = await db
      .select()
      .from(assetHistory)
      .where(
        and(
          eq(assetHistory.assetId, assetId),
          eq(assetHistory.date, date)
        )
      )
      .limit(1)

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(assetHistory)
        .set({
          closePrice: price,
          updatedAt: now
        })
        .where(eq(assetHistory.assetHistId, existingRecord[0].assetHistId))

      console.log(`[Cache UPDATE] ${symbol}: $${price} (date: ${date})`)
    } else {
      // Insert new record
      await db.insert(assetHistory).values({
        assetId,
        date,
        closePrice: price,
        updatedAt: now
      })

      console.log(`[Cache INSERT] ${symbol}: $${price} (date: ${date})`)
    }
  } catch (error) {
    console.error(`Error updating price cache for ${symbol}:`, error)
    // Don't throw - caching is not critical
  }
}

/**
 * Refresh prices for all holdings in a user's portfolio
 * @param userId User ID
 * @param baseUrl Optional base URL for API calls
 * @returns Number of prices updated
 */
export async function refreshAllHoldingsPrices(userId: number, baseUrl?: string): Promise<number> {
  try {
    console.log(`[Refresh] Fetching all holdings for user ${userId}...`)

    // Get all holdings with asset details
    const holdings = await db
      .select()
      .from(userPortfolio)
      .where(eq(userPortfolio.userId, userId))
      .leftJoin(assetType, eq(userPortfolio.assetId, assetType.assetId))

    const today = new Date().toISOString().split('T')[0]
    let updatedCount = 0

    console.log(`[Refresh] Found ${holdings.length} holdings to update`)

    // Fetch fresh prices for each holding
    for (const holding of holdings) {
      if (!holding.asset_type) continue

      const symbol = holding.asset_type.assetTicker

      // Skip CASH (always $1.00)
      if (symbol === "CASH") continue

      try {
        // Force refresh from API
        const price = await getCurrentPrice(symbol, baseUrl, true)

        if (price > 0) {
          updatedCount++
          console.log(`[Refresh] ${symbol}: $${price}`)
        }
      } catch (error) {
        console.error(`[Refresh] Failed to update price for ${symbol}:`, error)
      }
    }

    console.log(`[Refresh] Successfully updated ${updatedCount}/${holdings.length} prices`)
    return updatedCount
  } catch (error) {
    console.error('Error refreshing holding prices:', error)
    throw error
  }
}
