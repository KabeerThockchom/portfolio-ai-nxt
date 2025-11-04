import { createClient } from "@libsql/client"
import * as dotenv from "dotenv"

dotenv.config()

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function checkCash() {
  try {
    // Check if there are any Cash asset types
    const cashAssets = await turso.execute(`
      SELECT asset_id, asset_ticker, asset_name, asset_class 
      FROM asset_type 
      WHERE asset_class = 'Cash'
    `)
    
    console.log("Cash assets in asset_type table:")
    console.log(JSON.stringify(cashAssets.rows, null, 2))
    
    // Check if user has Cash holdings in portfolio
    const cashHoldings = await turso.execute(`
      SELECT up.*, at.asset_ticker, at.asset_class
      FROM user_portfolio up
      JOIN asset_type at ON up.asset_id = at.asset_id
      WHERE at.asset_class = 'Cash'
    `)
    
    console.log("\nCash holdings in user_portfolio:")
    console.log(JSON.stringify(cashHoldings.rows, null, 2))
    
    // Check user_accounts cash
    const accountsCash = await turso.execute("SELECT account_id, account_name, cash_balance FROM user_accounts WHERE user_id = 1")
    console.log("\nCash in user_accounts:")
    console.log(JSON.stringify(accountsCash.rows, null, 2))
    
  } catch (error) {
    console.error("Error:", error)
  }
}

checkCash()
