/**
 * Rate limiter utility for API calls
 * Ensures we don't exceed the specified calls per second limit
 */

/**
 * Process items in batches with rate limiting
 * @param items - Array of items to process
 * @param processFn - Async function to process each item
 * @param maxCallsPerSecond - Maximum calls per second (default: 10 for Yahoo Finance)
 * @returns Array of results
 */
export async function rateLimitedBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  maxCallsPerSecond: number = 10
): Promise<R[]> {
  const results: R[] = []
  const delayMs = 1000 / maxCallsPerSecond

  for (const item of items) {
    const startTime = Date.now()

    // Process the item
    const result = await processFn(item)
    results.push(result)

    // Calculate how long to wait before next call
    const elapsedTime = Date.now() - startTime
    const waitTime = Math.max(0, delayMs - elapsedTime)

    // Wait if needed (skip for last item)
    if (results.length < items.length && waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  return results
}

/**
 * Process items in parallel batches with rate limiting
 * @param items - Array of items to process
 * @param processFn - Async function to process each item
 * @param batchSize - Number of items to process in parallel (default: 10)
 * @param delayBetweenBatches - Delay between batches in ms (default: 1000ms)
 * @returns Array of results
 */
export async function batchedParallel<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayBetweenBatches: number = 1000
): Promise<R[]> {
  const results: R[] = []

  // Process items in chunks
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(item => processFn(item))
    )

    results.push(...batchResults)

    // Wait between batches (except for last batch)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return results
}
