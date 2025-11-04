import dotenv from "dotenv"
import { resolve } from "path"
import { createClient } from "@libsql/client"

dotenv.config({ path: resolve(__dirname, "../.env") })

async function fixSPX() {
  console.log("Fixing SPX ticker in database...\n")

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing database credentials")
    process.exit(1)
  }

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  try {
    // Check current SPX entry
    console.log("1. Checking current SPX entry...")
    const currentSPX = await turso.execute({
      sql: "SELECT * FROM asset_type WHERE asset_ticker = ?",
      args: ["SPX"],
    })

    if (currentSPX.rows.length === 0) {
      console.log("❌ No SPX entry found")
      return
    }

    console.log("Current SPX entry:")
    console.log(currentSPX.rows[0])

    // Update SPX to ^GSPC
    console.log("\n2. Updating SPX → ^GSPC...")
    const updateResult = await turso.execute({
      sql: "UPDATE asset_type SET asset_ticker = ? WHERE asset_ticker = ?",
      args: ["^GSPC", "SPX"],
    })

    console.log(`✅ Updated ${updateResult.rowsAffected} rows`)

    // Update relative_benchmarks table if it references SPX
    console.log("\n3. Updating relative_benchmarks...")
    const updateBenchmarks = await turso.execute({
      sql: "UPDATE relative_benchmarks SET relative_benchmark = ? WHERE relative_benchmark = ?",
      args: ["^GSPC", "SPX"],
    })

    console.log(`✅ Updated ${updateBenchmarks.rowsAffected} benchmark references`)

    // Verify the change
    console.log("\n4. Verifying changes...")
    const newEntry = await turso.execute({
      sql: "SELECT * FROM asset_type WHERE asset_ticker = ?",
      args: ["^GSPC"],
    })

    if (newEntry.rows.length > 0) {
      console.log("✅ Verification successful:")
      console.log(newEntry.rows[0])
      console.log("\n🎉 SPX ticker successfully updated to ^GSPC!")
      console.log("Next benchmark request will fetch correct S&P 500 data.")
    }

  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

fixSPX()
