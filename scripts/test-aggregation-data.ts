import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"

dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function testAggregation() {
  try {
    console.log("=== TESTING ASSET CLASS AGGREGATION ===\n")
    
    // Get user portfolio with asset types
    const portfolioResult = await turso.execute(`
      SELECT 
        up.user_port_id,
        up.asset_total_units,
        up.investment_amount,
        at.asset_ticker,
        at.asset_name,
        at.asset_class
      FROM user_portfolio up
      JOIN asset_type at ON up.asset_id = at.asset_id
      WHERE up.user_id = 1
      ORDER BY at.asset_class
    `)
    
    console.log("Portfolio Holdings by Asset Class:")
    console.log(JSON.stringify(portfolioResult.rows, null, 2))
    
    console.log("\n=== TESTING SECTOR AGGREGATION ===\n")
    
    // Get sector breakdown
    const sectorResult = await turso.execute(`
      SELECT 
        at.asset_ticker,
        at.asset_name,
        at.asset_class,
        up.asset_total_units,
        asec.sector_name,
        asec.sector_weightage
      FROM user_portfolio up
      JOIN asset_type at ON up.asset_id = at.asset_id
      LEFT JOIN asset_sector asec ON at.asset_id = asec.asset_id
      WHERE up.user_id = 1
      ORDER BY at.asset_ticker, asec.sector_name
    `)
    
    console.log("Portfolio Holdings with Sector Breakdown:")
    console.log(JSON.stringify(sectorResult.rows, null, 2))
    
    console.log("\n=== CHECKING PRICE DATA ===\n")
    
    // Check latest prices for each asset
    const priceResult = await turso.execute(`
      SELECT 
        at.asset_ticker,
        at.asset_class,
        MAX(ah.date) as latest_date,
        (SELECT close_price FROM asset_history 
         WHERE asset_id = at.asset_id 
         ORDER BY date DESC LIMIT 1) as latest_price
      FROM asset_type at
      LEFT JOIN asset_history ah ON at.asset_id = ah.asset_id
      WHERE at.asset_id IN (SELECT asset_id FROM user_portfolio WHERE user_id = 1)
      GROUP BY at.asset_ticker, at.asset_class
    `)
    
    console.log("Latest Prices for Portfolio Assets:")
    console.log(JSON.stringify(priceResult.rows, null, 2))
    
  } catch (error) {
    console.error("Error:", error)
  }
}

testAggregation()
