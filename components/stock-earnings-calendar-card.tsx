import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { ApiCallDetails } from "@/components/api-call-details";
import { ApiCallMetadata } from "@/types";

interface StockEarningsCalendarCardProps {
  earningsCalendarData: any;
  dateRange?: { period1?: string; period2?: string };
  apiCallDetails?: ApiCallMetadata;
}

export default function StockEarningsCalendarCard({
  earningsCalendarData,
  dateRange,
  apiCallDetails
}: StockEarningsCalendarCardProps) {
  if (!earningsCalendarData || !earningsCalendarData.finance || !earningsCalendarData.finance.result) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No earnings calendar data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const result = earningsCalendarData.finance.result[0];
  const documents = result?.documents || [];

  if (documents.length === 0 || !documents[0].rows || documents[0].rows.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No earnings events found for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns = documents[0].columns || [];
  const rows = documents[0].rows || [];
  const total = result.total || rows.length;

  // Map column names to indices
  const columnMap: Record<string, number> = {};
  columns.forEach((col: any, index: number) => {
    columnMap[col.id] = index;
  });

  // Group events by date
  const eventsByDate: Record<string, any[]> = {};

  rows.forEach((row: any[]) => {
    const startdatetime = row[columnMap.startdatetime];
    if (!startdatetime) return;

    const date = new Date(startdatetime);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }

    eventsByDate[dateKey].push({
      companyName: row[columnMap.companyshortname] || row[columnMap.ticker] || "Unknown",
      ticker: row[columnMap.ticker] || "N/A",
      eventName: row[columnMap.eventname] || "Earnings Event",
      startDateTime: startdatetime,
      startDateTimeType: row[columnMap.startdatetimetype], // BMO, AMC, TAS, TNS
      epsEstimate: columnMap.epsestimate !== undefined ? row[columnMap.epsestimate] : null,
      epsActual: columnMap.epsactual !== undefined ? row[columnMap.epsactual] : null,
      epsSurprise: columnMap.epssurprisepct !== undefined ? row[columnMap.epssurprisepct] : null,
      timeZone: row[columnMap.timeZoneShortName] || "UTC",
    });
  });

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Earnings Calendar</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {total} {total === 1 ? 'event' : 'events'}
              {dateRange?.period1 && dateRange?.period2 &&
                ` • ${new Date(dateRange.period1).toLocaleDateString()} - ${new Date(dateRange.period2).toLocaleDateString()}`
              }
            </p>
          </div>
          <ApiCallDetails apiCallDetails={apiCallDetails} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {sortedDates.map((dateKey) => {
          const events = eventsByDate[dateKey];
          const date = new Date(dateKey + 'T00:00:00');
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {dayOfWeek}, {formattedDate}
                </h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map((event: any, index: number) => (
                  <EarningsEventCard key={`${dateKey}-${index}`} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Event Card Component
function EarningsEventCard({ event }: { event: any }) {
  const hasActual = event.epsActual !== null && event.epsActual !== undefined;
  const hasEstimate = event.epsEstimate !== null && event.epsEstimate !== undefined;
  const hasSurprise = event.epsSurprise !== null && event.epsSurprise !== undefined;

  // Determine card status color
  let statusColor = "border-border";
  let surpriseText = null;
  let surpriseIcon = null;

  if (hasSurprise && hasActual) {
    if (event.epsSurprise > 0) {
      statusColor = "border-success/50 bg-success/5";
      surpriseText = <span className="text-success font-medium">+{event.epsSurprise.toFixed(2)}%</span>;
      surpriseIcon = <TrendingUp className="h-3 w-3 text-success" />;
    } else if (event.epsSurprise < 0) {
      statusColor = "border-destructive/50 bg-destructive/5";
      surpriseText = <span className="text-destructive font-medium">{event.epsSurprise.toFixed(2)}%</span>;
      surpriseIcon = <TrendingDown className="h-3 w-3 text-destructive" />;
    }
  }

  // Get time badge info
  const getTimeBadge = () => {
    const type = event.startDateTimeType;
    const badges: Record<string, { label: string; color: string }> = {
      'BMO': { label: 'Before Market', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
      'AMC': { label: 'After Market', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
      'TAS': { label: 'Time TBD', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
      'TNS': { label: 'Time Not Set', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
    };

    return badges[type] || { label: type || 'Unknown', color: 'bg-muted text-muted-foreground' };
  };

  const timeBadge = getTimeBadge();

  return (
    <div className={`p-3 rounded-lg border ${statusColor} hover:shadow-md transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{event.ticker || 'N/A'}</span>
            {surpriseIcon}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {event.companyName || 'Unknown Company'}
          </p>
        </div>
        <div className={`text-[10px] px-1.5 py-0.5 rounded border ${timeBadge.color} whitespace-nowrap`}>
          {timeBadge.label}
        </div>
      </div>

      {/* Event Name */}
      {event.eventName && (
        <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">
          {event.eventName}
        </p>
      )}

      {/* EPS Data */}
      <div className="space-y-1">
        {hasEstimate && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">EPS Est:</span>
            <span className="font-medium">${event.epsEstimate.toFixed(2)}</span>
          </div>
        )}
        {hasActual && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">EPS Actual:</span>
            <span className="font-semibold">${event.epsActual.toFixed(2)}</span>
          </div>
        )}
        {surpriseText && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Surprise:</span>
            {surpriseText}
          </div>
        )}
      </div>

      {/* No EPS data yet */}
      {!hasEstimate && !hasActual && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Awaiting EPS data</span>
        </div>
      )}
    </div>
  );
}
