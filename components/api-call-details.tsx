import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ApiCallMetadata } from "@/types";

interface ApiCallDetailsProps {
  apiCallDetails?: ApiCallMetadata;
}

export function ApiCallDetails({ apiCallDetails }: ApiCallDetailsProps) {
  if (!apiCallDetails) {
    return null;
  }

  // Format timestamp to relative time
  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // Format parameters for display
  const formatParameters = (params: Record<string, any>) => {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
  };

  const formattedParams = formatParameters(apiCallDetails.parameters);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="View API call details"
        >
          <Info className="h-3.5 w-3.5" />
          <span className="text-xs">API Details</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h4 className="font-semibold text-sm mb-1">API Call Details</h4>
            <p className="text-xs text-muted-foreground">How this data was retrieved</p>
          </div>

          {/* Endpoint */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {apiCallDetails.method}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {apiCallDetails.endpoint}
              </span>
            </div>
          </div>

          {/* Parameters */}
          {formattedParams.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Parameters</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {formattedParams.map(({ key, value }) => (
                  <div key={key} className="flex justify-between gap-2 text-xs bg-muted/50 p-2 rounded border border-border">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="font-mono text-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Retrieved</span>
              <span className="font-medium">{getRelativeTime(apiCallDetails.timestamp)}</span>
            </div>

            {apiCallDetails.duration && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Response Time</span>
                <span className="font-medium">{apiCallDetails.duration}ms</span>
              </div>
            )}

            {apiCallDetails.region && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{apiCallDetails.region}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
