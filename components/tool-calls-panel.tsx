import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface FunctionCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  timestamp: number;
  status: 'success' | 'error';
  result?: any;
}

interface ToolCallsPanelProps {
  functionCalls: FunctionCall[];
}

export default function ToolCallsPanel({ functionCalls }: ToolCallsPanelProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedCalls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatParameterValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (functionCalls.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Tool Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No tool calls yet. The AI will call tools as needed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Tool Calls
          <Badge variant="secondary" className="ml-auto">
            {functionCalls.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {functionCalls.map((call) => {
          const isExpanded = expandedCalls.has(call.id);
          return (
            <div
              key={call.id}
              className="border border-border rounded-lg bg-muted/30 overflow-hidden"
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpanded(call.id)}
              >
                <div className="flex-shrink-0">
                  {call.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {call.name}
                    </span>
                    <Badge
                      variant={call.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {call.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(call.timestamp)}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-background space-y-3">
                  {/* Parameters Section */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Parameters
                    </h4>
                    {Object.keys(call.parameters).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(call.parameters).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-muted/50 rounded-md p-2 border border-border"
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-mono text-xs font-medium text-primary">
                                {key}:
                              </span>
                              <span className="font-mono text-xs text-foreground break-all">
                                {formatParameterValue(value)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No parameters
                      </p>
                    )}
                  </div>

                  {/* Result Section (if error) */}
                  {call.status === 'error' && call.result && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Error Details
                      </h4>
                      <div className="bg-red-50 dark:bg-red-950/20 rounded-md p-3 border border-red-200 dark:border-red-800">
                        <pre className="text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                          {typeof call.result === 'string'
                            ? call.result
                            : JSON.stringify(call.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
