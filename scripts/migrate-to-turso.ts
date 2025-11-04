/**
 * Migrate Data from Local SQLite to Turso
 *
 * This script migrates all data from the local portfolio.sqlite3 to Turso
 * Run: npx tsx scripts/migrate-to-turso.ts
 *
 * Prerequisites:
 * 1. Schema must be pushed to Turso first (run: pnpm drizzle-kit push)
 * 2. Temporarily install better-sqlite3: pnpm add -D better-sqlite3 @types/better-sqlite3
 */

import { config } from "dotenv"
import { createClient } from "@libsql/client"
import Database from "better-sqlite3"
import path from "path"

// Load environment variables
config()

interface TableRow {
  [key: string]: any
}

async function migrateData() {
  console.log("🚀 Starting migration from SQLite to Turso...")

  // Check environment variables
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing Turso credentials in environment variables")
    process.exit(1)
  }

  // Connect to local SQLite database
  const dbPath = path.join(process.cwd(), "data", "portfolio.sqlite3")
  console.log(`📂 Reading from local database: ${dbPath}`)
  const localDb = new Database(dbPath, { readonly: true })

  // Connect to Turso
  console.log(`📡 Connecting to Turso: ${process.env.TURSO_DATABASE_URL}`)
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  console.log("✅ Connected to both databases\n")

  // Define migration order (respecting foreign key constraints)
  const tables = [
    "users",
    "asset_type",
    "user_portfolio",
    "user_transactions",
    "order_book",
    "asset_history",
    "asset_sector",
    "default_benchmarks",
    "relative_benchmarks",
    "asset_class_risk_level_mapping",
  ]

  try {
    for (const table of tables) {
      console.log(`📊 Migrating table: ${table}`)

      // Get all rows from local database
      const rows = localDb.prepare(`SELECT * FROM ${table}`).all() as TableRow[]
      console.log(`   Found ${rows.length} rows`)

      if (rows.length === 0) {
        console.log(`   ⏭️  Skipping (no data)\n`)
        continue
      }

      // Insert rows into Turso in batches
      const batchSize = 100
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)

        for (const row of batch) {
          const columns = Object.keys(row)
          const values = Object.values(row)
          const placeholders = columns.map(() => "?").join(", ")

          const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`

          try {
            await turso.execute({
              sql,
              args: values,
            })
          } catch (error: any) {
            // Skip if row already exists (unique constraint)
            if (!error.message?.includes("UNIQUE constraint")) {
              throw error
            }
          }
        }

        console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}`)
      }

      console.log(`   ✅ Completed ${table}\n`)
    }

    console.log("🎉 Migration completed successfully!")

    // Verify data
    console.log("\n📊 Verifying migration...")
    for (const table of tables) {
      const localCount = localDb.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }
      const tursoCount = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`)
      const tursoCountValue = (tursoCount.rows[0] as any).count

      const match = localCount.count === tursoCountValue
      const icon = match ? "✅" : "❌"
      console.log(`${icon} ${table}: Local=${localCount.count}, Turso=${tursoCountValue}`)
    }

    console.log("\n✅ Migration verification complete!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    localDb.close()
  }
}

migrateData().catch((error) => {
  console.error("❌ Error:", error)
  process.exit(1)
})
