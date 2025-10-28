import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { ApiCallDetails } from "@/components/api-call-details";
import { ApiCallMetadata } from "@/types";

interface StockInsiderTransactionsCardProps {
  insiderTransactionsData: any;
  symbol: string;
  apiCallDetails?: ApiCallMetadata;
}

export default function StockInsiderTransactionsCard({
  insiderTransactionsData,
  symbol,
  apiCallDetails
}: StockInsiderTransactionsCardProps) {
  const [filterType, setFilterType] = useState<"all" | "purchase" | "sale" | "grant">("all");

  if (!insiderTransactionsData) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No insider transactions data available for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  const transactions = insiderTransactionsData.insiderTransactions?.transactions || [];
  const netActivity = insiderTransactionsData.netSharePurchaseActivity || {};
  const companyName = symbol;

  // Filter transactions based on type
  const getTransactionType = (transactionText: string): "purchase" | "sale" | "grant" | "other" => {
    const text = transactionText.toLowerCase();
    if (text.includes("purchase") || text.includes("acquisition")) return "purchase";
    if (text.includes("sale") || text.includes("sold")) return "sale";
    if (text.includes("grant") || text.includes("award")) return "grant";
    return "other";
  };

  const filteredTransactions = filterType === "all"
    ? transactions
    : transactions.filter((t: any) => getTransactionType(t.transactionText || "") === filterType);

  // Summary stats
  const totalInsiderShares = netActivity.totalInsiderShares || 0;
  const netSharesPurchased = netActivity.netInfoShares || 0;
  const netPurchaseCount = netActivity.netInfoCount || 0;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{companyName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Insider Transactions</p>
          </div>
          <ApiCallDetails apiCallDetails={apiCallDetails} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Summary (Last 6 Months)</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard
              title="Net Transactions"
              value={netPurchaseCount.toString()}
              subtitle={netSharesPurchased >= 0 ? "Net Buying" : "Net Selling"}
              isPositive={netSharesPurchased >= 0}
            />
            <SummaryCard
              title="Net Shares"
              value={formatNumber(Math.abs(netSharesPurchased))}
              subtitle="6 Month Period"
            />
            <SummaryCard
              title="Total Insider Shares"
              value={formatNumber(totalInsiderShares)}
              subtitle="Current Holdings"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterBadge
              label="All"
              count={transactions.length}
              isActive={filterType === "all"}
              onClick={() => setFilterType("all")}
            />
            <FilterBadge
              label="Purchases"
              count={transactions.filter((t: any) => getTransactionType(t.transactionText || "") === "purchase").length}
              isActive={filterType === "purchase"}
              onClick={() => setFilterType("purchase")}
              variant="success"
            />
            <FilterBadge
              label="Sales"
              count={transactions.filter((t: any) => getTransactionType(t.transactionText || "") === "sale").length}
              isActive={filterType === "sale"}
              onClick={() => setFilterType("sale")}
              variant="destructive"
            />
            <FilterBadge
              label="Grants"
              count={transactions.filter((t: any) => getTransactionType(t.transactionText || "") === "grant").length}
              isActive={filterType === "grant"}
              onClick={() => setFilterType("grant")}
              variant="info"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Recent Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No transactions found for the selected filter
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTransactions.map((transaction: any, index: number) => (
                <TransactionItem key={index} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper Components

function SummaryCard({
  title,
  value,
  subtitle,
  isPositive
}: {
  title: string;
  value: string;
  subtitle?: string;
  isPositive?: boolean;
}) {
  return (
    <div className="p-3 bg-muted rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <p className={`text-lg font-bold ${
        isPositive !== undefined
          ? isPositive
            ? 'text-success'
            : 'text-destructive'
          : 'text-foreground'
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function FilterBadge({
  label,
  count,
  isActive,
  onClick,
  variant
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant?: "success" | "destructive" | "info";
}) {
  const variantClasses = {
    success: isActive ? "bg-success/20 border-success text-success" : "hover:bg-success/10 hover:border-success/50",
    destructive: isActive ? "bg-destructive/20 border-destructive text-destructive" : "hover:bg-destructive/10 hover:border-destructive/50",
    info: isActive ? "bg-primary/20 border-primary text-primary" : "hover:bg-primary/10 hover:border-primary/50",
  };

  const baseClasses = isActive
    ? "bg-primary/20 border-primary text-primary"
    : "bg-muted border-border text-muted-foreground hover:bg-muted/80";

  const classes = variant ? variantClasses[variant] : baseClasses;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${classes}`}
    >
      {label} ({count})
    </button>
  );
}

function TransactionItem({ transaction }: { transaction: any }) {
  const date = transaction.startDate?.fmt || "N/A";
  const filerName = transaction.filerName || "Unknown";
  const filerRelation = transaction.filerRelation || "N/A";
  const shares = transaction.shares?.fmt || transaction.shares?.raw?.toString() || "N/A";
  const value = transaction.value?.fmt || (transaction.value?.raw > 0 ? `$${transaction.value.raw.toLocaleString()}` : "N/A");
  const transactionText = transaction.transactionText || "N/A";
  const ownership = transaction.ownership === "D" ? "Direct" : transaction.ownership === "I" ? "Indirect" : "";

  // Determine transaction type for styling
  const getTransactionType = (text: string): "purchase" | "sale" | "grant" | "other" => {
    const lower = text.toLowerCase();
    if (lower.includes("purchase") || lower.includes("acquisition")) return "purchase";
    if (lower.includes("sale") || lower.includes("sold")) return "sale";
    if (lower.includes("grant") || lower.includes("award")) return "grant";
    return "other";
  };

  const transactionType = getTransactionType(transactionText);

  const borderColor =
    transactionType === "purchase" ? "border-l-success" :
    transactionType === "sale" ? "border-l-destructive" :
    transactionType === "grant" ? "border-l-primary" :
    "border-l-muted-foreground";

  const icon =
    transactionType === "purchase" ? <ArrowUpRight className="h-4 w-4 text-success" /> :
    transactionType === "sale" ? <ArrowDownRight className="h-4 w-4 text-destructive" /> :
    transactionType === "grant" ? <Award className="h-4 w-4 text-primary" /> :
    null;

  return (
    <div className={`p-3 bg-muted rounded-lg border border-border border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-sm font-semibold text-foreground truncate">{filerName}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{filerRelation}</p>
          <p className="text-xs text-foreground mb-2">{transactionText}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              <span className="font-medium">Shares:</span> {shares}
            </span>
            {value !== "N/A" && (
              <span className="text-muted-foreground">
                <span className="font-medium">Value:</span> {value}
              </span>
            )}
            {ownership && (
              <span className="text-muted-foreground">
                <span className="font-medium">Ownership:</span> {ownership}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  }
  return num.toString();
}
