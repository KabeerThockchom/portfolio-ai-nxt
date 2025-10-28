import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, BarChart3, Percent } from "lucide-react";
import { ApiCallDetails } from "@/components/api-call-details";
import { ApiCallMetadata } from "@/types";

interface StockStatisticsCardProps {
  statisticsData: any;
  symbol: string;
  apiCallDetails?: ApiCallMetadata;
}

export default function StockStatisticsCard({ statisticsData, symbol, apiCallDetails }: StockStatisticsCardProps) {
  if (!statisticsData || !statisticsData.defaultKeyStatistics) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No statistics data available for {symbol}</p>
        </CardContent>
      </Card>
    );
  }

  const stats = statisticsData.defaultKeyStatistics;
  const companySymbol = statisticsData.symbol || symbol;

  // Helper function to format large numbers
  const formatLargeNumber = (num: number | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Helper to format percentage
  const formatPercent = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return `${(num * 100).toFixed(2)}%`;
  };

  // Helper to format ratio
  const formatRatio = (num: number | undefined) => {
    if (!num) return "N/A";
    return num.toFixed(2);
  };

  const companyName = companySymbol;
  const marketCap = stats.enterpriseValue; // Using enterprise value as market cap proxy
  const pe = null; // Not available in defaultKeyStatistics
  const forwardPE = stats.forwardPE;
  const eps = stats.trailingEps;
  const beta = stats.beta;
  const bookValue = stats.bookValue;
  const priceToBook = stats.priceToBook;
  const dividendYield = null; // Calculate from lastDividendValue if needed
  const profitMargins = stats.profitMargins;
  const operatingMargins = null; // Not in defaultKeyStatistics
  const revenue = null; // Not directly in defaultKeyStatistics
  const revenuePerShare = null; // Not in defaultKeyStatistics
  const grossMargins = null; // Not in defaultKeyStatistics
  const ebitda = null; // Can calculate from enterpriseToEbitda if needed
  const debtToEquity = null; // Not in defaultKeyStatistics
  const returnOnEquity = null; // Not in defaultKeyStatistics
  const returnOnAssets = null; // Not in defaultKeyStatistics
  const earningsGrowth = stats.earningsQuarterlyGrowth;
  const sharesOutstanding = stats.sharesOutstanding;
  const enterpriseToRevenue = stats.enterpriseToRevenue;
  const enterpriseToEbitda = stats.enterpriseToEbitda;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{companyName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Key Statistics</p>
          </div>
          <ApiCallDetails apiCallDetails={apiCallDetails} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Valuation Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Valuation Metrics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard title="Enterprise Value" value={formatLargeNumber(marketCap)} />
            <StatCard title="Forward P/E" value={formatRatio(forwardPE)} />
            <StatCard title="Price/Book" value={formatRatio(priceToBook)} />
            <StatCard title="Book Value" value={bookValue ? `$${bookValue.toFixed(2)}` : "N/A"} />
            <StatCard title="EPS (TTM)" value={eps ? `$${eps.toFixed(2)}` : "N/A"} />
            <StatCard title="Forward EPS" value={stats.forwardEps ? `$${stats.forwardEps.toFixed(2)}` : "N/A"} />
          </div>
        </div>

        {/* Trading & Risk */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Trading & Risk</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard title="Beta" value={formatRatio(beta)} />
            <StatCard title="Shares Outstanding" value={sharesOutstanding ? `${(sharesOutstanding / 1e9).toFixed(2)}B` : "N/A"} />
            <StatCard title="Float Shares" value={stats.floatShares ? `${(stats.floatShares / 1e9).toFixed(2)}B` : "N/A"} />
            <StatCard title="Short Ratio" value={formatRatio(stats.shortRatio)} />
            <StatCard title="Insider Holdings" value={formatPercent(stats.heldPercentInsiders)} />
            <StatCard title="Institutional Holdings" value={formatPercent(stats.heldPercentInstitutions)} />
          </div>
        </div>

        {/* Financial Performance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard title="Profit Margin" value={formatPercent(profitMargins)} />
            <StatCard title="Earnings Growth (QoQ)" value={earningsGrowth ? `${(earningsGrowth * 100).toFixed(2)}%` : "N/A"} />
            <StatCard title="Enterprise/Revenue" value={formatRatio(enterpriseToRevenue)} />
            <StatCard title="Enterprise/EBITDA" value={formatRatio(enterpriseToEbitda)} />
            <StatCard title="52-Week Change" value={stats["52WeekChange"] ? `${(stats["52WeekChange"] * 100).toFixed(2)}%` : "N/A"} />
            <StatCard title="S&P 52-Week Change" value={stats["SandP52WeekChange"] ? `${(stats["SandP52WeekChange"] * 100).toFixed(2)}%` : "N/A"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="p-3 bg-muted rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
