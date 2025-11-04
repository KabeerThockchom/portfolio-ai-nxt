/**
 * Setup Turso Database Schema
 *
 * This script pushes the Drizzle schema to Turso database
 * Run: npx tsx scripts/setup-turso-schema.ts
 */

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "../lib/db/schema"

async function setupSchema() {
  console.log("🚀 Setting up Turso database schema...")

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing Turso credentials in environment variables")
    console.error("Please ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set")
    process.exit(1)
  }

  console.log(`📡 Connecting to: ${process.env.TURSO_DATABASE_URL}`)

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  const db = drizzle(turso, { schema })

  console.log("✅ Connected to Turso successfully")
  console.log("\n⚠️  Note: Please run 'pnpm drizzle-kit push' to push the schema to Turso")
  console.log("This will create all tables based on lib/db/schema.ts")
}

setupSchema().catch((error) => {
  console.error("❌ Error setting up schema:", error)
  process.exit(1)
})
