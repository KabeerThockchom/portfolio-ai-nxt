import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Award } from "lucide-react";

interface StockAnalysisCardProps {
  analysisData: any;
  symbol: string;
}

export default function StockAnalysisCard({ analysisData, symbol }: StockAnalysisCardProps) {
  if (!analysisData) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No analysis data available for {symbol}</p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = analysisData.recommendationTrend?.trend || [];
  const earningsHistory = analysisData.earningsHistory?.history || [];
  const earningsTrend = analysisData.earningsTrend?.trend || [];
  const upgradeDowngrade = analysisData.upgradeDowngradeHistory?.history || [];
  const financialData = analysisData.financialData || {};
  const companyName = symbol;

  // Get latest recommendation
  const latestRec = recommendations[0] || {};
  const totalAnalysts = (latestRec.strongBuy || 0) + (latestRec.buy || 0) + (latestRec.hold || 0) + (latestRec.sell || 0) + (latestRec.strongSell || 0);

  // Calculate consensus
  const getConsensus = () => {
    if (!totalAnalysts) return "N/A";
    const buySignals = (latestRec.strongBuy || 0) + (latestRec.buy || 0);
    const sellSignals = (latestRec.sell || 0) + (latestRec.strongSell || 0);
    const holdSignals = latestRec.hold || 0;

    if (buySignals > sellSignals && buySignals > holdSignals) return "Buy";
    if (sellSignals > buySignals && sellSignals > holdSignals) return "Sell";
    return "Hold";
  };

  const consensus = getConsensus();

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{companyName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Stock Analysis</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Analyst Recommendations */}
        {totalAnalysts > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Analyst Recommendations</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Consensus: <span className={`font-semibold ${consensus === 'Buy' ? 'text-success' : consensus === 'Sell' ? 'text-destructive' : 'text-muted-foreground'}`}>{consensus}</span></span>
                <span className="text-xs text-muted-foreground">{totalAnalysts} Analysts</span>
              </div>

              {/* Recommendation Bar Chart */}
              <div className="space-y-2">
                <RecommendationBar label="Strong Buy" count={latestRec.strongBuy || 0} total={totalAnalysts} color="bg-success" />
                <RecommendationBar label="Buy" count={latestRec.buy || 0} total={totalAnalysts} color="bg-success/70" />
                <RecommendationBar label="Hold" count={latestRec.hold || 0} total={totalAnalysts} color="bg-muted-foreground" />
                <RecommendationBar label="Sell" count={latestRec.sell || 0} total={totalAnalysts} color="bg-destructive/70" />
                <RecommendationBar label="Strong Sell" count={latestRec.strongSell || 0} total={totalAnalysts} color="bg-destructive" />
              </div>
            </div>
          </div>
        )}

        {/* Target Price & Key Metrics */}
        {financialData.targetMeanPrice && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Price Targets & Financials</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard
                title="Current Price"
                value={financialData.currentPrice ? `$${financialData.currentPrice.toFixed(2)}` : "N/A"}
              />
              <MetricCard
                title="Target Mean"
                value={financialData.targetMeanPrice ? `$${financialData.targetMeanPrice.toFixed(2)}` : "N/A"}
              />
              <MetricCard
                title="Target Range"
                value={financialData.targetLowPrice && financialData.targetHighPrice ?
                  `$${financialData.targetLowPrice.toFixed(2)} - $${financialData.targetHighPrice.toFixed(2)}` : "N/A"}
              />
              <MetricCard
                title="Revenue"
                value={financialData.totalRevenue ? `$${(financialData.totalRevenue / 1e9).toFixed(2)}B` : "N/A"}
              />
              <MetricCard
                title="Profit Margin"
                value={financialData.profitMargins ? `${(financialData.profitMargins * 100).toFixed(2)}%` : "N/A"}
              />
              <MetricCard
                title="Debt/Equity"
                value={financialData.debtToEquity ? financialData.debtToEquity.toFixed(2) : "N/A"}
              />
            </div>

            {/* Target Price Visual */}
            {financialData.currentPrice && financialData.targetMeanPrice && (
              <div className="mt-4">
                <TargetPriceBar
                  current={financialData.currentPrice}
                  low={financialData.targetLowPrice}
                  mean={financialData.targetMeanPrice}
                  high={financialData.targetHighPrice}
                />
              </div>
            )}
          </div>
        )}

        {/* Earnings Estimates */}
        {earningsTrend.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Earnings Estimates</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Period</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">EPS Est.</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Revenue Est.</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsTrend.slice(0, 4).map((trend: any, index: number) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 px-2 font-medium">{getPeriodLabel(trend.period)}</td>
                      <td className="text-right py-2 px-2">
                        {trend.earningsEstimate?.avg?.fmt || "N/A"}
                      </td>
                      <td className="text-right py-2 px-2">
                        {trend.revenueEstimate?.avg?.fmt || "N/A"}
                      </td>
                      <td className={`text-right py-2 px-2 font-medium ${
                        trend.growth?.raw > 0 ? 'text-success' : trend.growth?.raw < 0 ? 'text-destructive' : ''
                      }`}>
                        {trend.growth?.fmt || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Earnings History */}
        {earningsHistory.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Earnings History</h3>
            </div>

            <div className="space-y-2">
              {earningsHistory.map((earning: any, index: number) => (
                <EarningsHistoryItem key={index} earning={earning} />
              ))}
            </div>
          </div>
        )}

        {/* Upgrade/Downgrade History */}
        {upgradeDowngrade.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Recent Analyst Actions</h3>
            </div>

            <div className="space-y-2">
              {upgradeDowngrade.slice(0, 10).map((action: any, index: number) => (
                <AnalystActionItem key={index} action={action} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Components

function RecommendationBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-24 text-muted-foreground">{label}</span>
      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-3 bg-muted rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TargetPriceBar({ current, low, mean, high }: { current: number; low: number; mean: number; high: number }) {
  const range = high - low;
  const currentPercent = range > 0 ? ((current - low) / range) * 100 : 50;
  const meanPercent = range > 0 ? ((mean - low) / range) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low: ${low.toFixed(2)}</span>
        <span>Mean: ${mean.toFixed(2)}</span>
        <span>High: ${high.toFixed(2)}</span>
      </div>
      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-muted-foreground/30 to-success/30" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-foreground"
          style={{ left: `${currentPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-primary"
          style={{ left: `${meanPercent}%` }}
        />
      </div>
      <div className="text-xs text-center text-muted-foreground">
        <span className="font-medium text-foreground">Current: ${current.toFixed(2)}</span>
        {current > mean && <span className="text-success ml-2">↑ Above Mean</span>}
        {current < mean && <span className="text-destructive ml-2">↓ Below Mean</span>}
      </div>
    </div>
  );
}

function EarningsHistoryItem({ earning }: { earning: any }) {
  const surprise = earning.surprisePercent?.raw || 0;
  const isPositive = surprise >= 0;
  const date = earning.quarter?.fmt || "N/A";
  const actual = earning.epsActual?.fmt || "N/A";
  const estimate = earning.epsEstimate?.fmt || "N/A";

  return (
    <div className="p-3 bg-muted rounded-lg border border-border">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-muted-foreground">{date}</span>
        <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{surprise.toFixed(0)}% surprise
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Actual: <span className="font-semibold">{actual}</span></span>
        <span>Est: <span className="font-medium text-muted-foreground">{estimate}</span></span>
      </div>
    </div>
  );
}

function AnalystActionItem({ action }: { action: any }) {
  const isUpgrade = action.action === "up";
  const isDowngrade = action.action === "down";
  const date = new Date(action.epochGradeDate * 1000).toLocaleDateString();

  return (
    <div className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{action.firm}</span>
          {isUpgrade && <TrendingUp className="h-4 w-4 text-success" />}
          {isDowngrade && <TrendingDown className="h-4 w-4 text-destructive" />}
        </div>
        <div className="text-xs text-muted-foreground">
          {action.fromGrade && <span>{action.fromGrade} → </span>}
          <span className={`font-medium ${isUpgrade ? 'text-success' : isDowngrade ? 'text-destructive' : 'text-foreground'}`}>
            {action.toGrade}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{date}</span>
    </div>
  );
}

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    "0q": "Current Q",
    "+1q": "Next Q",
    "0y": "Current Y",
    "+1y": "Next Y",
    "+5y": "5Y Avg",
    "-5y": "Past 5Y"
  };
  return labels[period] || period;
}
