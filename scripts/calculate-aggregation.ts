import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"

dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function calculateAggregation() {
  console.log("=== CALCULATING EXPECTED AGGREGATION VALUES ===\n")

  // Get all portfolio holdings with asset details
  const result = await turso.execute(`
    SELECT
      up.user_port_id,
      up.asset_total_units,
      up.investment_amount,
      at.asset_ticker,
      at.asset_name,
      at.asset_class,
      at.asset_id
    FROM user_portfolio up
    JOIN asset_type at ON up.asset_id = at.asset_id
    WHERE up.user_id = 1
    ORDER BY at.asset_class, at.asset_ticker
  `)

  console.log("Holdings Count:", result.rows.length)
  console.log("\n--- RAW HOLDINGS DATA ---")
  result.rows.forEach((row: any) => {
    console.log(`${row.asset_ticker} (${row.asset_class}): ${row.asset_total_units} units`)
  })

  // Get latest prices for each asset
  console.log("\n--- FETCHING LATEST PRICES ---")
  const holdingsWithPrices = []

  for (const row of result.rows) {
    const assetId = row.asset_id as number
    const assetClass = row.asset_class as string
    const ticker = row.asset_ticker as string
    const units = row.asset_total_units as number

    let latestPrice = 0

    if (assetClass === "Cash") {
      latestPrice = 1.0
      console.log(`${ticker}: $1.00 (Cash - hardcoded)`)
    } else {
      const priceResult = await turso.execute({
        sql: `
          SELECT close_price
          FROM asset_history
          WHERE asset_id = ?
          ORDER BY date DESC
          LIMIT 1
        `,
        args: [assetId]
      })

      if (priceResult.rows.length > 0) {
        latestPrice = priceResult.rows[0].close_price as number
        console.log(`${ticker}: $${latestPrice.toFixed(2)}`)
      } else {
        console.log(`${ticker}: NO PRICE DATA (will use 0)`)
      }
    }

    const currentValue = units * latestPrice

    holdingsWithPrices.push({
      ticker,
      assetClass,
      assetId,
      units,
      price: latestPrice,
      currentValue
    })
  }

  // Calculate asset class aggregation
  console.log("\n=== ASSET CLASS AGGREGATION ===")
  const assetClassTotals = new Map<string, number>()

  for (const holding of holdingsWithPrices) {
    const current = assetClassTotals.get(holding.assetClass) || 0
    assetClassTotals.set(holding.assetClass, current + holding.currentValue)
  }

  const totalPortfolioValue = Array.from(assetClassTotals.values()).reduce((a, b) => a + b, 0)

  console.log("\nAsset Class Breakdown:")
  for (const [assetClass, value] of assetClassTotals.entries()) {
    const percentage = (value / totalPortfolioValue) * 100
    console.log(`  ${assetClass}: $${value.toFixed(2)} (${percentage.toFixed(2)}%)`)
  }
  console.log(`\nTotal Portfolio Value: $${totalPortfolioValue.toFixed(2)}`)

  // Calculate sector aggregation
  console.log("\n=== SECTOR AGGREGATION ===")
  const sectorTotals = new Map<string, number>()

  for (const holding of holdingsWithPrices) {
    // Get sector breakdown for this asset
    const sectorResult = await turso.execute({
      sql: `
        SELECT sector_name, sector_weightage
        FROM asset_sector
        WHERE asset_id = ?
      `,
      args: [holding.assetId]
    })

    if (sectorResult.rows.length > 0) {
      // Distribute holding value across sectors
      for (const sectorRow of sectorResult.rows) {
        const sectorName = sectorRow.sector_name as string
        const weightage = sectorRow.sector_weightage as number
        const sectorValue = holding.currentValue * (weightage / 100)

        const current = sectorTotals.get(sectorName) || 0
        sectorTotals.set(sectorName, current + sectorValue)
      }
    } else {
      // No sector data (individual stocks, cash)
      console.log(`  ${holding.ticker}: No sector breakdown`)
    }
  }

  console.log("\nSector Breakdown:")
  const sortedSectors = Array.from(sectorTotals.entries()).sort((a, b) => b[1] - a[1])

  for (const [sector, value] of sortedSectors) {
    const percentage = (value / totalPortfolioValue) * 100
    console.log(`  ${sector}: $${value.toFixed(2)} (${percentage.toFixed(2)}%)`)
  }

  // Note about assets without sectors
  const assetsWithoutSectors = holdingsWithPrices.filter(h => {
    return h.currentValue > 0 && h.assetClass !== "Cash"
  })

  console.log("\n--- ASSETS WITHOUT SECTOR DATA ---")
  for (const holding of assetsWithoutSectors) {
    const sectorResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM asset_sector WHERE asset_id = ?`,
      args: [holding.assetId]
    })

    if ((sectorResult.rows[0].count as number) === 0) {
      console.log(`  ${holding.ticker} ($${holding.currentValue.toFixed(2)}) - Individual stock, no sector data`)
    }
  }

  console.log("\n=== SUMMARY ===")
  console.log(`Total Assets: ${holdingsWithPrices.length}`)
  console.log(`Asset Classes: ${assetClassTotals.size}`)
  console.log(`Sectors (from sector-allocated assets): ${sectorTotals.size}`)
  console.log(`Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}`)
}

calculateAggregation().catch(console.error)
