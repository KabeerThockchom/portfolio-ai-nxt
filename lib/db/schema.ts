import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

// Users table
export const users = sqliteTable("users", {
  userId: integer("user_id").primaryKey(),
  name: text("name", { length: 150 }).notNull(),
  username: text("username", { length: 150 }).notNull().unique(),
  email: text("email", { length: 150 }).notNull().unique(),
  password: text("password", { length: 200 }).notNull(),
  dob: text("dob").notNull(), // DATE stored as text in SQLite
  phoneNumber: text("phone_number", { length: 11 }).notNull().unique(),
})

// Asset Type table - Core asset information
export const assetType = sqliteTable("asset_type", {
  assetId: integer("asset_id").primaryKey(),
  assetTicker: text("asset_ticker", { length: 10 }).notNull().unique(),
  assetName: text("asset_name", { length: 200 }).notNull(),
  assetClass: text("asset_class", { length: 100 }).notNull(), // Stock, Cash, Bond, ETF, etc.
  netExpenseRatio: real("net_expense_ratio"),
  morningstarRating: real("morningstar_rating"),
  maturityDate: text("maturity_date"), // DATE stored as text in SQLite
  oneYrVolatility: real("one_yr_volatility"),
  similarAsset: text("similar_asset"),
  category: text("category", { length: 200 }),
  assetManager: text("asset_manager", { length: 200 }),
  portfolioComposition: text("portfolio_composition", { mode: "json" }),
  bondRating: real("bond_rating"),
  concentration: text("concentration"),
})

// User Portfolio table - Holdings
export const userPortfolio = sqliteTable("user_portfolio", {
  userPortId: integer("user_port_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  assetTotalUnits: real("asset_total_units").notNull(),
  avgCostPerUnit: real("avg_cost_per_unit").notNull(),
  investmentAmount: real("investment_amount").notNull(),
})

// User Transactions table - Transaction history
export const userTransactions = sqliteTable("user_transactions", {
  transId: integer("trans_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  transType: text("trans_type", { length: 5 }).notNull(), // Buy/Sell
  date: text("date").notNull(), // DATE stored as text in SQLite
  units: real("units").notNull(),
  pricePerUnit: real("price_per_unit").notNull(),
  cost: real("cost").notNull(),
})

// Order Book table - Order management
export const orderBook = sqliteTable("order_book", {
  orderId: integer("order_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  orderType: text("order_type", { length: 15 }).notNull(), // Market Open, Limit, etc.
  symbol: text("symbol", { length: 10 }).notNull(),
  description: text("description", { length: 200 }),
  buySell: text("buy_sell", { length: 4 }).notNull(), // Buy/Sell
  unitPrice: real("unit_price").notNull(),
  limitPrice: real("limit_price"),
  qty: real("qty").notNull(),
  amount: real("amount").notNull(),
  settlementDate: text("settlement_date").notNull(), // DATE stored as text in SQLite
  orderStatus: text("order_status", { length: 20 }).notNull(), // Placed, Under Review, Cancelled
  orderDate: text("order_date").notNull(), // TIMESTAMP stored as text in SQLite
})

// Asset History table - Historical prices
export const assetHistory = sqliteTable("asset_history", {
  assetHistId: integer("asset_hist_id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  date: text("date").notNull(), // DATE stored as text in SQLite
  closePrice: real("close_price").notNull(),
})

// Asset Sector table - Sector breakdown
export const assetSector = sqliteTable("asset_sector", {
  assetSecId: integer("asset_sec_id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  sectorSymbol: text("sector_symbol", { length: 200 }).notNull(),
  sectorName: text("sector_name", { length: 200 }).notNull(),
  sectorWeightage: real("sector_weightage").notNull(),
})

// Default Benchmarks table
export const defaultBenchmarks = sqliteTable("default_benchmarks", {
  benchmarkId: integer("benchmark_id").primaryKey(),
  benchmarkAssetId: integer("benchamark_asset_id")
    .notNull()
    .references(() => assetType.assetId, { onDelete: "cascade" }),
  benchmarkForAssetClass: text("benchmark_for_asset_class", { length: 100 }).notNull(),
})

// Relative Benchmarks table
export const relativeBenchmarks = sqliteTable("relative_benchmarks", {
  id: integer("id").primaryKey(),
  assetTicker: text("asset_ticker", { length: 10 }).notNull().unique(),
  assetName: text("asset_name", { length: 200 }).notNull(),
  relativeBenchmark: text("relative_benchmark", { length: 10 }).notNull(),
})

// Asset Class Risk Level Mapping table
export const assetClassRiskLevelMapping = sqliteTable("asset_class_risk_level_mapping", {
  assetRiskId: integer("asset_risk_id").primaryKey(),
  assetType: text("asset_type", { length: 100 }).notNull(),
  volatilityRangeStart: real("volatility_range_start").notNull(),
  volatilityRangeEnd: real("volatility_range_end").notNull(),
  riskScore: real("risk_score").notNull(),
  concentration: text("concentration"),
  score1: real("score1"),
  addon1: real("addon1"),
  addon2: real("addon2"),
})

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolio: many(userPortfolio),
  transactions: many(userTransactions),
  orders: many(orderBook),
}))

export const assetTypeRelations = relations(assetType, ({ many }) => ({
  portfolioHoldings: many(userPortfolio),
  transactions: many(userTransactions),
  orders: many(orderBook),
  history: many(assetHistory),
  sectors: many(assetSector),
  defaultBenchmarks: many(defaultBenchmarks),
}))

export const userPortfolioRelations = relations(userPortfolio, ({ one }) => ({
  user: one(users, {
    fields: [userPortfolio.userId],
    references: [users.userId],
  }),
  asset: one(assetType, {
    fields: [userPortfolio.assetId],
    references: [assetType.assetId],
  }),
}))

export const userTransactionsRelations = relations(userTransactions, ({ one }) => ({
  user: one(users, {
    fields: [userTransactions.userId],
    references: [users.userId],
  }),
  asset: one(assetType, {
    fields: [userTransactions.assetId],
    references: [assetType.assetId],
  }),
}))

export const orderBookRelations = relations(orderBook, ({ one }) => ({
  user: one(users, {
    fields: [orderBook.userId],
    references: [users.userId],
  }),
  asset: one(assetType, {
    fields: [orderBook.assetId],
    references: [assetType.assetId],
  }),
}))

export const assetHistoryRelations = relations(assetHistory, ({ one }) => ({
  asset: one(assetType, {
    fields: [assetHistory.assetId],
    references: [assetType.assetId],
  }),
}))

export const assetSectorRelations = relations(assetSector, ({ one }) => ({
  asset: one(assetType, {
    fields: [assetSector.assetId],
    references: [assetType.assetId],
  }),
}))

export const defaultBenchmarksRelations = relations(defaultBenchmarks, ({ one }) => ({
  asset: one(assetType, {
    fields: [defaultBenchmarks.benchmarkAssetId],
    references: [assetType.assetId],
  }),
}))
