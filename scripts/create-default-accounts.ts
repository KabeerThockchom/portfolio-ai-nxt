/**
 * Create Default Accounts for Existing Users
 *
 * This script creates default accounts for existing users and migrates
 * cash holdings from user_portfolio (Cash asset) to account balances.
 *
 * Run: npx tsx scripts/create-default-accounts.ts
 */

import { config } from "dotenv"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "../lib/db/schema"
import { eq, and } from "drizzle-orm"

// Load environment variables
config()

async function createDefaultAccounts() {
  console.log("🚀 Creating default accounts for existing users...")

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing Turso credentials in environment variables")
    process.exit(1)
  }

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  const db = drizzle(turso, { schema })

  try {
    // Get all users
    const users = await db.select().from(schema.users)
    console.log(`📊 Found ${users.length} user(s)`)

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name} (ID: ${user.userId})`)

      // Check if user already has accounts
      const existingAccounts = await db
        .select()
        .from(schema.userAccounts)
        .where(eq(schema.userAccounts.userId, user.userId))

      if (existingAccounts.length > 0) {
        console.log(`   ⏭️  User already has ${existingAccounts.length} account(s), skipping`)
        continue
      }

      // Get user's cash holdings from user_portfolio (Cash asset has assetId=1)
      const cashHolding = await db
        .select()
        .from(schema.userPortfolio)
        .innerJoin(schema.assetType, eq(schema.userPortfolio.assetId, schema.assetType.assetId))
        .where(
          and(
            eq(schema.userPortfolio.userId, user.userId),
            eq(schema.assetType.assetClass, "Cash")
          )
        )

      const cashBalance = cashHolding.length > 0 ? cashHolding[0].user_portfolio.assetTotalUnits : 0
      console.log(`   💰 Current cash balance: $${cashBalance.toLocaleString()}`)

      // Create default accounts
      const now = new Date().toISOString()

      // 1. Checking Account (default, with all existing cash)
      const checkingAccount = await db
        .insert(schema.userAccounts)
        .values({
          userId: user.userId,
          accountName: "Checking",
          accountType: "checking",
          cashBalance: cashBalance,
          isDefault: true,
          createdAt: now,
        })
        .returning()

      console.log(`   ✅ Created Checking account (ID: ${checkingAccount[0].accountId}) with $${cashBalance.toLocaleString()}`)

      // 2. Savings Account (empty)
      const savingsAccount = await db
        .insert(schema.userAccounts)
        .values({
          userId: user.userId,
          accountName: "Savings",
          accountType: "savings",
          cashBalance: 0,
          isDefault: false,
          createdAt: now,
        })
        .returning()

      console.log(`   ✅ Created Savings account (ID: ${savingsAccount[0].accountId})`)

      // 3. Brokerage Account (empty)
      const brokerageAccount = await db
        .insert(schema.userAccounts)
        .values({
          userId: user.userId,
          accountName: "Brokerage",
          accountType: "brokerage",
          cashBalance: 0,
          isDefault: false,
          createdAt: now,
        })
        .returning()

      console.log(`   ✅ Created Brokerage account (ID: ${brokerageAccount[0].accountId})`)

      // Create a DEPOSIT transaction record for the initial cash migration
      if (cashBalance > 0) {
        await db.insert(schema.userTransactions).values({
          userId: user.userId,
          accountId: checkingAccount[0].accountId,
          assetId: null, // No asset for deposits
          transType: "DEPOSIT",
          date: now,
          units: null,
          pricePerUnit: null,
          cost: cashBalance,
          description: "Initial cash migration from portfolio",
        })

        console.log(`   📝 Created deposit transaction record`)
      }

      console.log(`   🎉 Successfully created 3 accounts for ${user.name}`)
    }

    console.log("\n✅ Migration completed successfully!")
    console.log("\n📊 Summary:")

    // Show final account counts
    const allAccounts = await db.select().from(schema.userAccounts)
    console.log(`   Total accounts created: ${allAccounts.length}`)

    const totalCash = allAccounts.reduce((sum, acc) => sum + acc.cashBalance, 0)
    console.log(`   Total cash across all accounts: $${totalCash.toLocaleString()}`)

  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

createDefaultAccounts().catch((error) => {
  console.error("❌ Error:", error)
  process.exit(1)
})
