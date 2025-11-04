# Conversational Order Flow - Implementation Complete

**Date:** 2025-11-03
**Status:** ✅ Complete and Ready for Testing

---

## Overview

Successfully implemented a **conversational, multi-step order placement flow** where the AI assistant guides users through the process naturally, asking for information step-by-step instead of requiring everything upfront.

---

## What Was Fixed

### Problem Identified
When user said "I wanna place an order for Apple":
1. ❌ AI responded but **didn't call any APIs**
2. ❌ System prompt had NO instructions for order management tools
3. ❌ AI didn't know getCashBalance, placeOrder, depositFunds existed
4. ❌ Missing handlers for account management tools

### Solution Implemented
Added comprehensive order management system with conversational flow guidance.

---

## Files Modified

### 1. `/app/api/session/route.ts` - System Prompt
**Lines Added: ~160 lines (198-360)**

Added three major sections:

#### A. Portfolio Viewing Tools (lines 200-244)
- getPortfolioHoldings
- getPortfolioAggregation
- getPortfolioRisk
- getPortfolioBenchmark
- getReturnsAttribution
- getRelativePerformance
- getPriceTrend

#### B. Order Management Tools - CONVERSATIONAL FLOW (lines 246-334)
**Critical: Multi-Step Order Placement Pattern:**

```
STEP 1: Acknowledge Intent
"I can help you place an order for [company/symbol]."

STEP 2: Gather Missing Information
If quantity NOT given: "How many shares would you like to buy?"
If order type NOT given: "Would you like a Market Open order or a Limit order?"

STEP 3: Check Cash Balance AUTOMATICALLY
Call getCashBalance(userId=1) before placing buy orders
"You have $[amount] available in cash."

STEP 4: Handle Insufficient Funds
If insufficient: "You need about $[estimate] but only have $[balance]. Would you like to deposit funds first?"

STEP 5: Place Order When Ready
Call placeOrder → "I've placed your order... It's pending confirmation."

STEP 6: Guide to Confirmation
"Say 'confirm order [id]' when you're ready to execute it."
```

**Tools Documented:**
- getCashBalance - Check available funds
- getAccountList - View accounts
- placeOrder - Place pending order
- confirmOrder - Execute trade
- updateOrder - Modify pending order
- rejectOrder - Cancel order
- getOrderHistory - View order history

#### C. Account Management Tools (lines 336-354)
- depositFunds - Add money to account
- withdrawFunds - Withdraw funds
- getTransactionHistory - View transactions

#### D. Multi-Step Conversation Rules (lines 368-375)
- Break complex processes into conversational steps
- Check cash balance automatically before buy orders
- Offer solutions proactively (deposits if insufficient)
- Guide users through confirmation process
- Remember order IDs

---

### 2. `/app/page.tsx` - Function Handlers

#### Fixed placeOrder Handler (line 1491)
**Before:**
```typescript
apiResponse = await portfolioApi.placeOrder({
  userId,
  symbol: args.symbol,
  // ❌ Missing accountId - API would fail!
```

**After:**
```typescript
const accountId = args.accountId || 1 // Default to account 1
apiResponse = await portfolioApi.placeOrder({
  userId,
  accountId, // ✅ Now includes accountId
  symbol: args.symbol,
```

#### Added Missing Handlers (lines 1599-1670)

**1. getAccountList** (lines 1599-1609)
```typescript
const userId = args.userId || 1
apiResponse = await portfolioApi.fetchAccountList(userId)
toast({ title: "Accounts Retrieved", description: `Found ${accounts.length} account(s)` })
```

**2. depositFunds** (lines 1610-1632)
```typescript
const accountId = args.accountId || 1
apiResponse = await portfolioApi.depositFunds({ accountId, amount, description })
toast({ title: "Deposit Successful", description: "Deposited $X,XXX" })
```

**3. withdrawFunds** (lines 1633-1655)
```typescript
const accountId = args.accountId || 1
apiResponse = await portfolioApi.withdrawFunds({ accountId, amount, description })
toast({ title: "Withdrawal Successful", description: "Withdrew $X,XXX" })
```

**4. getTransactionHistory** (lines 1656-1670)
```typescript
const userId = args.userId || 1
apiResponse = await portfolioApi.fetchTransactionHistory(userId, accountId, type)
toast({ title: "Transaction History", description: `Found ${count} transaction(s)` })
```

---

### 3. `/lib/voice-tools-config.ts` - Tool Definition

#### Updated placeOrder Tool (lines 335-350)
**Before:**
```typescript
required: ["accountId", "symbol", "buySell", "orderType", "qty"]
// ❌ AI must provide accountId every time
```

**After:**
```typescript
accountId: { type: "number", description: "Account ID to trade from (default: 1 if user has only one account)" }
required: ["symbol", "buySell", "orderType", "qty"]
// ✅ accountId is optional, defaults to 1
```

---

## Expected Behavior After Fix

### Scenario 1: Simple Buy Order

```
User: "I wanna place an order for Apple"

AI: "Sure! How many shares of Apple would you like to buy? Market or Limit order?"

User: "10 shares, market order"

AI: [calls getCashBalance automatically]
    "Checking your cash balance."
    "You have $5,000 available. 10 shares at the current price will cost approximately $1,500."
    [calls placeOrder]
    "I've placed your order for 10 shares of AAPL at Market Open."
    "This is order #5 and it's pending confirmation."
    "Say 'confirm order 5' when you're ready to execute it."

User: "Confirm order 5"

AI: [calls confirmOrder]
    "Confirming your order."
    "Order confirmed! You now own 10 shares of AAPL. Your cash balance is $3,500."
```

### Scenario 2: Insufficient Funds

```
User: "Buy 100 shares of Tesla"

AI: "How many shares? Market or Limit?"

User: "100 shares, market"

AI: [calls getCashBalance]
    "Checking your cash balance."
    "You have $5,000 available but 100 shares of Tesla would cost about $25,000."
    "You need approximately $25,000 but only have $5,000 available."
    "Would you like to deposit funds first?"

User: "Yes, deposit $20,000"

AI: [calls depositFunds]
    "Depositing funds to your account."
    "Deposited $20,000. Your new balance is $25,000."
    "Now let me place that order for Tesla."
    [calls placeOrder]
    "I've placed your order for 100 shares of TSLA..."
```

### Scenario 3: Update Before Confirming

```
User: "Place an order for 50 shares of Microsoft, market order"

AI: [calls getCashBalance, then placeOrder]
    "Your cash balance is $20,000."
    "I've placed order #7 for 50 shares of MSFT at $400 per share, total $20,000."
    "Say 'confirm order 7' to execute."

User: "Wait, change it to 25 shares"

AI: [calls updateOrder]
    "Updating your order."
    "Order 7 updated to 25 shares. New total is $10,000."
    "Say 'confirm order 7' when ready."

User: "Confirm order 7"

AI: [calls confirmOrder]
    "Order confirmed! You now own 25 shares of MSFT."
```

---

## Tools Now Available to AI

### Portfolio Tools
- ✅ getPortfolioHoldings - View holdings
- ✅ getPortfolioAggregation - Asset allocation
- ✅ getPortfolioRisk - Risk analysis
- ✅ getPortfolioBenchmark - Compare to market
- ✅ getReturnsAttribution - Returns breakdown
- ✅ getRelativePerformance - Holdings vs benchmarks
- ✅ getPriceTrend - Price trends over time

### Order Tools
- ✅ getCashBalance - Check available funds (AUTO before buys)
- ✅ placeOrder - Place pending order
- ✅ confirmOrder - Execute trade
- ✅ updateOrder - Modify pending order
- ✅ rejectOrder - Cancel order
- ✅ getOrderHistory - View order history
- ✅ cancelOrder - Cancel open orders

### Account Tools
- ✅ getAccountList - View accounts (NEW HANDLER)
- ✅ depositFunds - Add money (NEW HANDLER)
- ✅ withdrawFunds - Take money out (NEW HANDLER)
- ✅ getTransactionHistory - View transactions (NEW HANDLER)

---

## Key AI Behaviors Programmed

### Automatic Actions
1. **Always check cash balance before buy orders** (no need to ask)
2. **Calculate estimated cost automatically** (shares × price)
3. **Offer deposits proactively** if insufficient funds
4. **Guide to confirmation** after placing orders
5. **Remember order IDs** for easy reference

### Conversational Flow
1. **Ask for missing info naturally** ("How many shares?")
2. **Break into steps** (gather info → check funds → place → confirm)
3. **Provide context** ("You have $5,000 available")
4. **Explain consequences** ("This will cost approximately $1,500")
5. **Offer solutions** ("Would you like to deposit funds first?")

### Error Handling
1. **Insufficient funds** → Suggest deposit
2. **Missing symbol** → Ask which stock
3. **Missing quantity** → Ask how many shares
4. **Missing order type** → Ask Market or Limit

---

## Testing Checklist

### Basic Order Flow
- [ ] Say "I want to buy Apple stock"
- [ ] AI asks for quantity and order type
- [ ] Provide "10 shares, market order"
- [ ] AI checks cash balance automatically
- [ ] AI shows balance and estimated cost
- [ ] AI places order and provides order ID
- [ ] Say "confirm order [id]"
- [ ] AI executes trade and confirms

### Insufficient Funds Flow
- [ ] Say "Buy 1000 shares of Tesla"
- [ ] AI checks balance automatically
- [ ] AI detects insufficient funds
- [ ] AI suggests depositing money
- [ ] Say "Yes, deposit $50,000"
- [ ] AI deposits funds
- [ ] AI places order
- [ ] Confirm order executes

### Order Modification Flow
- [ ] Place an order
- [ ] Say "Change order [id] to [X] shares"
- [ ] AI updates order
- [ ] Confirm updated order
- [ ] Verify holdings updated correctly

### Account Management
- [ ] Say "Show my accounts"
- [ ] AI calls getAccountList
- [ ] Say "What's my transaction history?"
- [ ] AI shows all transactions
- [ ] Say "Withdraw $5,000"
- [ ] AI processes withdrawal

---

## Architecture Notes

### Conversational Pattern
The AI now follows a **gather → validate → execute → confirm** pattern:

1. **Gather**: Ask for missing information conversationally
2. **Validate**: Check cash balance, holdings, etc. automatically
3. **Execute**: Place order as pending (not immediate)
4. **Confirm**: Wait for user confirmation to execute trade

### Safety Features
- **Two-step confirmation**: placeOrder → pending → confirmOrder → executed
- **Cash validation**: Always checks balance before buys
- **Holdings validation**: Checks shares owned before sells
- **Transparent pricing**: Shows estimated costs upfront
- **Cancellation option**: Users can reject/update before confirming

### Default Values
- **userId**: Defaults to 1
- **accountId**: Defaults to 1 (single account assumption)
- All optional parameters have sensible defaults

---

## Summary

✅ **System prompt updated** with 160 lines of order management guidance
✅ **4 new handlers added** for account management
✅ **1 handler fixed** (placeOrder now includes accountId)
✅ **1 tool updated** (accountId made optional with default)
✅ **Conversational flow documented** for AI to follow

**The voice assistant can now:**
- Guide users through order placement step-by-step
- Check cash balance automatically
- Offer deposits when funds insufficient
- Place orders conversationally
- Handle confirmations and updates
- Manage accounts and transactions

**Try it now!** Restart the dev server and say:
> "I want to buy some Apple stock"

The AI will guide you through the entire process! 🎉

---

## Developer Notes

### If AI Still Doesn't Call Tools
1. Check WebRTC connection is established
2. Verify authentication completed successfully
3. Check browser console for function call logs
4. Restart voice session (disconnect and reconnect)

### If accountId Issues
- Database should have accountId=1 for user
- Default fallback is hardcoded to 1
- Check `/api/accounts/list?userId=1` returns accounts

### If Cash Balance Not Checked
- System prompt explicitly says "ALWAYS call getCashBalance"
- Verify handler exists for getCashBalance
- Check API route `/api/user/cash-balance` works
