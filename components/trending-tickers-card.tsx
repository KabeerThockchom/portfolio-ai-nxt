import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import { ApiCallDetails } from "@/components/api-call-details";
import { ApiCallMetadata } from "@/types";

interface TrendingTickersCardProps {
  trendingTickersData: any;
  region: string;
  onTickerClick?: (symbol: string) => void;
  apiCallDetails?: ApiCallMetadata;
}

export default function TrendingTickersCard({
  trendingTickersData,
  region,
  onTickerClick,
  apiCallDetails
}: TrendingTickersCardProps) {
  if (!trendingTickersData || !trendingTickersData.finance || !trendingTickersData.finance.result) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No trending tickers data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const result = trendingTickersData.finance.result[0];
  const tickers = result?.quotes || [];

  if (tickers.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No trending tickers found for {region}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Trending Tickers</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {region} • {tickers.length} {tickers.length === 1 ? 'stock' : 'stocks'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <ApiCallDetails apiCallDetails={apiCallDetails} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tickers.map((ticker: any, index: number) => (
            <TickerCard
              key={ticker.symbol || index}
              ticker={ticker}
              onTickerClick={onTickerClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Ticker Card Component
function TickerCard({ ticker, onTickerClick }: { ticker: any; onTickerClick?: (symbol: string) => void }) {
  const symbol = ticker.symbol || "N/A";
  const shortName = ticker.shortName || ticker.longName || "Unknown Company";
  const price = ticker.regularMarketPrice;
  const change = ticker.regularMarketChange;
  const changePercent = ticker.regularMarketChangePercent;
  const marketState = ticker.marketState;
  const exchange = ticker.fullExchangeName || ticker.exchange || "N/A";

  // Determine if price is up or down
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  // Card border and background color
  let statusColor = "border-border hover:border-border/80";
  if (isPositive) {
    statusColor = "border-success/30 bg-success/5 hover:border-success/50";
  } else if (isNegative) {
    statusColor = "border-destructive/30 bg-destructive/5 hover:border-destructive/50";
  }

  // Market state badge
  const getMarketStateBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      'REGULAR': { label: 'Open', color: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' },
      'CLOSED': { label: 'Closed', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
      'PRE': { label: 'Pre-Market', color: 'bg-primary/10 text-primary border-primary/20' },
      'POST': { label: 'After Hours', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
    };
    return badges[marketState] || { label: marketState || 'Unknown', color: 'bg-muted text-muted-foreground' };
  };

  const marketBadge = getMarketStateBadge();

  const handleClick = () => {
    if (onTickerClick && symbol !== "N/A") {
      onTickerClick(symbol);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border ${statusColor} transition-all duration-200 cursor-pointer hover:shadow-md`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{symbol}</span>
            {isPositive && <TrendingUp className="h-3 w-3 text-success" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {shortName}
          </p>
        </div>
        <div className={`text-[10px] px-1.5 py-0.5 rounded border ${marketBadge.color} whitespace-nowrap`}>
          {marketBadge.label}
        </div>
      </div>

      {/* Exchange */}
      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
        {exchange}
      </p>

      {/* Price Data */}
      <div className="space-y-1">
        {price !== null && price !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">${price.toFixed(2)}</span>
          </div>
        )}
        {change !== null && change !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Change:</span>
            <span className={`font-medium ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : ''}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
          </div>
        )}
        {changePercent !== null && changePercent !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Change %:</span>
            <span className={`font-bold ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : ''}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Click to view hint */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          Click to view details
        </p>
      </div>
    </div>
  );
}
