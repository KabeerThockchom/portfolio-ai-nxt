import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface StockRecommendationTrendCardProps {
  recommendationTrendData: any;
  symbol: string;
}

export default function StockRecommendationTrendCard({
  recommendationTrendData,
  symbol
}: StockRecommendationTrendCardProps) {
  if (!recommendationTrendData || !recommendationTrendData.recommendationTrend) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No recommendation trend data available for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  const trends = recommendationTrendData.recommendationTrend.trend || [];

  if (trends.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No recommendation trend data available for {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process data for visualization
  const processedData = trends.map((trend: any) => {
    const buy = (trend.strongBuy || 0) + (trend.buy || 0);
    const hold = trend.hold || 0;
    const sell = (trend.sell || 0) + (trend.strongSell || 0);
    const total = buy + hold + sell;

    return {
      period: trend.period,
      buy,
      hold,
      sell,
      total,
      strongBuy: trend.strongBuy || 0,
      buyOnly: trend.buy || 0,
      sellOnly: trend.sell || 0,
      strongSell: trend.strongSell || 0,
    };
  });

  // Get latest (first item is current, 0m)
  const latest = processedData[0];
  const getConsensus = () => {
    if (latest.total === 0) return "N/A";
    if (latest.buy > latest.sell && latest.buy > latest.hold) return "Buy";
    if (latest.sell > latest.buy && latest.sell > latest.hold) return "Sell";
    return "Hold";
  };
  const consensus = getConsensus();

  // Get period label
  const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      "0m": "Current",
      "-1m": "1M Ago",
      "-2m": "2M Ago",
      "-3m": "3M Ago",
    };
    return labels[period] || period;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Analyst Recommendation Trend
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Consensus */}
        {latest.total > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Current Consensus
              </h3>
            </div>
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Recommendation:{" "}
                  <span
                    className={`font-semibold text-lg ${
                      consensus === "Buy"
                        ? "text-success"
                        : consensus === "Sell"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {consensus}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {latest.total} Analysts
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground mb-1">Buy</p>
                  <p className="text-lg font-semibold text-success">
                    {latest.buy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.total > 0
                      ? ((latest.buy / latest.total) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground mb-1">Hold</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {latest.hold}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.total > 0
                      ? ((latest.hold / latest.total) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground mb-1">Sell</p>
                  <p className="text-lg font-semibold text-destructive">
                    {latest.sell}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latest.total > 0
                      ? ((latest.sell / latest.total) * 100).toFixed(0)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend Chart */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Trend Over Time
            </h3>
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <TrendLineChart data={processedData} getPeriodLabel={getPeriodLabel} />
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Historical Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    S. Buy
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    Buy
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    Hold
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    Sell
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    S. Sell
                  </th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((data: any, index: number) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-2 px-2 font-medium">
                      {getPeriodLabel(data.period)}
                    </td>
                    <td className="text-right py-2 px-2 text-success">
                      {data.strongBuy}
                    </td>
                    <td className="text-right py-2 px-2 text-success/70">
                      {data.buyOnly}
                    </td>
                    <td className="text-right py-2 px-2">{data.hold}</td>
                    <td className="text-right py-2 px-2 text-destructive/70">
                      {data.sellOnly}
                    </td>
                    <td className="text-right py-2 px-2 text-destructive">
                      {data.strongSell}
                    </td>
                    <td className="text-right py-2 px-2 font-semibold">
                      {data.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trend Line Chart Component
function TrendLineChart({ data, getPeriodLabel }: { data: any[]; getPeriodLabel: (period: string) => string }) {
  if (data.length === 0) return null;

  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find max value for y-axis
  const maxValue = Math.max(
    ...data.flatMap(d => [d.buy, d.hold, d.sell])
  );
  const yMax = Math.ceil(maxValue * 1.1); // Add 10% padding

  // Create points for each line
  const createPoints = (values: number[]) => {
    return values
      .map((value, index) => {
        const x = padding.left + (index * innerWidth) / (data.length - 1);
        const y = padding.top + innerHeight - (value / yMax) * innerHeight;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const buyPoints = createPoints(data.map(d => d.buy));
  const holdPoints = createPoints(data.map(d => d.hold));
  const sellPoints = createPoints(data.map(d => d.sell));

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round((yMax / (yTicks - 1)) * i)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ minWidth: "400px" }}
      >
        {/* Y-axis grid lines and labels */}
        {yTickValues.map((value, index) => {
          const y = padding.top + innerHeight - (value / yMax) * innerHeight;
          return (
            <g key={`y-${index}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[10px] fill-muted-foreground"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, index) => {
          const x = padding.left + (index * innerWidth) / (data.length - 1);
          return (
            <text
              key={`x-${index}`}
              x={x}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {getPeriodLabel(d.period)}
            </text>
          );
        })}

        {/* Buy line */}
        <polyline
          points={buyPoints}
          fill="none"
          stroke="rgb(16, 185, 129)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hold line */}
        <polyline
          points={holdPoints}
          fill="none"
          stroke="rgb(107, 114, 128)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sell line */}
        <polyline
          points={sellPoints}
          fill="none"
          stroke="rgb(239, 68, 68)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, index) => {
          const x = padding.left + (index * innerWidth) / (data.length - 1);
          const buyY = padding.top + innerHeight - (d.buy / yMax) * innerHeight;
          const holdY = padding.top + innerHeight - (d.hold / yMax) * innerHeight;
          const sellY = padding.top + innerHeight - (d.sell / yMax) * innerHeight;

          return (
            <g key={`points-${index}`}>
              <circle cx={x} cy={buyY} r="4" fill="rgb(16, 185, 129)" />
              <circle cx={x} cy={holdY} r="4" fill="rgb(107, 114, 128)" />
              <circle cx={x} cy={sellY} r="4" fill="rgb(239, 68, 68)" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-success"></div>
          <span className="text-xs text-muted-foreground">Buy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-muted-foreground"></div>
          <span className="text-xs text-muted-foreground">Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-destructive"></div>
          <span className="text-xs text-muted-foreground">Sell</span>
        </div>
      </div>
    </div>
  );
}
