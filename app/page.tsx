"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, BarChart4, Info } from "lucide-react"
import StockInfoPanel from "@/components/stock-info-panel"
import { useToast } from "@/hooks/use-toast"
import StockChart from "@/components/stock-chart"
import { ThemeToggle } from "@/components/theme-toggle"

// Define types for chartData
interface ChartMeta {
  dataGranularity?: string;
  range?: string;
  // Add other meta properties if known
}

interface ChartResultItem {
  meta: ChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
    adjclose?: Array<{
      adjclose?: Array<number | null>;
    }>;
  };
  // Add other result item properties if known
}

interface ChartData {
  chart?: {
    result?: ChartResultItem[];
    error?: any; // Or a more specific error type
  };
  success?: boolean;
  error?: string;
  // Add other chartData properties if known, e.g., from fetchStockChart response
}

// Type for the full API response from /api/stock/chart, which might contain chartData
interface ApiStockChartResponse {
  chartData?: ChartData; // The actual chart data is nested here
  success?: boolean;
  error?: string;
}

// Define the type for the dynamically imported module
type RtcHelpersModule = typeof import('@/lib/webrtc-helpers');

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [rapidApiKey, setRapidApiKey] = useState("")
  const [selectedStock, setSelectedStock] = useState("")
  const [comparisonStocks, setComparisonStocks] = useState<string[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rtcHelpers, setRtcHelpers] = useState<RtcHelpersModule | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [currentChartView, setCurrentChartView] = useState<"price" | "percent" | "relative">("price")
  const [mainStock, setMainStock] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeys()
    setMounted(true)

    import('@/lib/webrtc-helpers')
      .then(module => {
        setRtcHelpers(module);
      })
      .catch(err => {
        console.error("Failed to load WebRTC helpers:", err);
        toast({
          title: "Initialization Error",
          description: "Voice assistant features may not be available. Please refresh.",
          variant: "destructive",
        });
      });
  }, [toast])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys")
      const data = await response.json()
      setRapidApiKey(data.rapidApiKey)
    } catch (error) {
      console.error("Failed to load API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys. Some features may not work.",
        variant: "destructive",
      })
    }
  }

  const fetchStockChart = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region, comparisons, range, interval, events } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      if (comparisons) params.append("comparisons", comparisons)
      if (range) params.append("range", range || "1mo")
      if (interval) params.append("interval", interval || "1d")
      if (events) params.append("events", events || "div,split,earn")
      params.append("includeAdjustedClose", "true")

      const response = await fetch(`/api/stock/chart?${params.toString()}`)
      const result: ApiStockChartResponse = await response.json()

      if (!response.ok) { // Check response.ok for network errors
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch stock chart")
      }
      return result
    } catch (error) {
      console.error("Error fetching stock chart:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error fetching stock chart",
      }
    }
  }, []); // Removed toast from deps if not used directly here

  const fetchStockProfile = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/profile?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching stock profile:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock profile" }
    }
  }, []);

  const fetchStockStatistics = useCallback(async (args: any): Promise<ApiStockChartResponse | { success: false; error: string }> => {
    try {
      const { symbol, region } = args
      const params = new URLSearchParams()
      params.append("symbol", symbol)
      if (region) params.append("region", region)
      const response = await fetch(`/api/stock/statistics?${params.toString()}`)
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      return await response.json()
    } catch (error) {
      console.error("Error fetching stock statistics:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error fetching stock statistics" }
    }
  }, []);

  // DEFINE handleFunctionCall and configureDataChannel BEFORE startAssistant
  const handleFunctionCall = useCallback(async (msg: any, dataChannel: RTCDataChannel) => {
    try {
      const args = JSON.parse(msg.arguments)
      let apiResponse: ApiStockChartResponse | { success: false, error: string } | undefined;

      if (msg.name === "getStockChart") {
        setIsLoading(true)
        apiResponse = await fetchStockChart(args)
        if (apiResponse.success && apiResponse.chartData) {
          setChartData(apiResponse.chartData)
          setMainStock(args.symbol)
          setSelectedStock(args.symbol)
          if (args.comparisons) {
            setComparisonStocks(args.comparisons.split(",").map((s: string) => s.trim()))
          } else {
            setComparisonStocks([])
          }
        } else if (apiResponse && !apiResponse.success) { // Check apiResponse exists
          toast({ title: "Error fetching chart", description: apiResponse.error, variant: "destructive" });
        }
        setIsLoading(false)
      } else if (msg.name === "getStockProfile") {
        apiResponse = await fetchStockProfile(args)
        if (apiResponse && !apiResponse.success) toast({ title: "Error fetching profile", description: apiResponse.error, variant: "destructive" });
      } else if (msg.name === "getStockStatistics") {
        apiResponse = await fetchStockStatistics(args)
        if (apiResponse && !apiResponse.success) toast({ title: "Error fetching statistics", description: apiResponse.error, variant: "destructive" });
      } else {
        apiResponse = { success: false, error: "Function not implemented" }
      }

      const event = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: msg.call_id,
          output: JSON.stringify(apiResponse),
        },
      }
      if (dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(event))
        dataChannel.send(JSON.stringify({ type: "response.create" }))
      }
    } catch (error) {
      console.error("Error handling function call:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error in function call";
      const event = {
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: msg.call_id,
          output: JSON.stringify({ success: false, error: errorMessage }),
        },
      }
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') { // Use ref here
         dataChannelRef.current.send(JSON.stringify(event))
         dataChannelRef.current.send(JSON.stringify({ type: "response.create" }))
      }
    }
  }, [toast, fetchStockChart, fetchStockProfile, fetchStockStatistics]); // Added fetch functions as dependencies

  const configureDataChannel = useCallback((dataChannel: RTCDataChannel) => {
    const event = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        tools: [
          // Tools configuration as before
          {
            type: "function",
            name: "getStockChart",
            description: "Fetches chart data for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
                comparisons: { type: "string", description: "Comma-separated list of symbols for comparison" },
                range: {
                  type: "string",
                  description: "Time range (e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd)",
                },
                interval: {
                  type: "string",
                  description: "Time interval (e.g., 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)",
                },
                events: {
                  type: "string",
                  description: "Comma-separated list of events: capitalGain, div, split, earn, history",
                },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockProfile",
            description: "Fetches company profile information for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
          {
            type: "function",
            name: "getStockStatistics",
            description: "Fetches key statistics for a given stock symbol",
            parameters: {
              type: "object",
              properties: {
                symbol: { type: "string", description: "Stock symbol (e.g., GOOG, AAPL)" },
                region: { type: "string", description: "Region code (e.g., US)" },
              },
              required: ["symbol"],
            },
          },
        ],
      },
    }
    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(event))
    }
  }, []);

  const startAssistant = useCallback(async () => {
    if (!rtcHelpers) {
      toast({
        title: "Assistant Not Ready",
        description: "WebRTC helpers are not loaded yet. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    try {
      const peerConnection = rtcHelpers.createPeerConnection();
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;

      dataChannel.addEventListener("open", () => {
        console.log("Data channel opened");
        configureDataChannel(dataChannel); // Now defined above
      });

      dataChannel.addEventListener("message", async (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === "response.function_call_arguments.done") {
          handleFunctionCall(msg, dataChannel); // Now defined above
        }
      });

      const stream = await rtcHelpers.getUserAudioMedia();
      stream.getTracks().forEach((track) => peerConnection.addTransceiver(track, { direction: "sendrecv" }));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const tokenResponse = await fetch("/api/session");
      const sessionData = await tokenResponse.json();
      if (!sessionData.result || !sessionData.result.client_secret || !sessionData.result.client_secret.value) {
        throw new Error("Failed to retrieve session token from backend.");
      }
      const EPHEMERAL_KEY = sessionData.result.client_secret.value;

      const baseUrl = "https://eastus2.realtimeapi-preview.ai.azure.com/v1/realtimertc";
      const model = "gpt-4o-mini-realtime-preview";
      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure API request failed: ${response.status} ${errorText}`);
      }

      const answer = await response.text();
      await peerConnection.setRemoteDescription({
        sdp: answer,
        type: "answer",
      });

      toast({
        title: "Assistant Ready",
        description: "Voice assistant is now listening. Ask about stocks!",
      });
    } catch (error) {
      console.error("Error starting assistant:", error);
      setIsListening(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to start the voice assistant. Please try again.";
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }
    }
  }, [rtcHelpers, toast, configureDataChannel, handleFunctionCall]);

  const stopAssistant = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
    }
    setIsListening(false)
    toast({
      title: "Assistant Stopped",
      description: "Voice assistant has been disconnected.",
    })
  }, [toast]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Assistant</h1>
            <p className="text-muted-foreground">
              Voice-enabled AI assistant for financial insights and stock analysis
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6 border-secondary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Stock Visualization</h2>
                  <div className="flex items-center gap-2">
                    <select
                      id="chartView"
                      className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                      value={currentChartView}
                      onChange={(e) => setCurrentChartView(e.target.value as "price" | "percent" | "relative")}
                    >
                      <option value="price">Price</option>
                      <option value="percent">Percent Change</option>
                      <option value="relative">Relative Performance</option>
                    </select>
                  </div>
                </div>

                {chartData && chartData.chart && chartData.chart.result && chartData.chart.result.length > 0 && (
                  <div className="flex flex-wrap justify-between items-center mb-4 text-sm">
                    <div className="bg-muted px-3 py-1 rounded-md">
                      <span className="font-medium">Interval:</span>{" "}
                      {chartData.chart.result[0].meta.dataGranularity || "1d"}
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-md">
                      <span className="font-medium">Range:</span> {chartData.chart.result[0].meta.range || "1mo"}
                    </div>
                  </div>
                )}

                {mainStock && (
                  <div id="stockSelector" className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={selectedStock === mainStock ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStock(mainStock)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {mainStock}
                    </Button>
                    {comparisonStocks.map((symbol) => (
                      <Button
                        key={symbol}
                        variant={selectedStock === symbol ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStock(symbol)}
                        className={
                          selectedStock === symbol ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        }
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                )}

                <div id="chartContainer" className={`w-full h-[350px] ${chartData ? "visible" : "hidden"}`}>
                  {chartData && <StockChart chartData={chartData} symbol={selectedStock} viewMode={currentChartView} />}
                  <div className="legend-container flex flex-wrap gap-2 mt-2"></div>
                </div>

                {!chartData && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-[350px] border border-dashed rounded-lg border-secondary">
                    <BarChart4 className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Ask the assistant to show you a stock chart</p>
                  </div>
                )}

                {isLoading && (
                  <div id="loadingIndicator" className="flex flex-col items-center justify-center h-[350px]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-secondary">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Stock Information</h2>
                <div id="stockInfoPanel" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedStock ? (
                    <StockInfoPanel stock={selectedStock} chartData={chartData} />
                  ) : (
                    <div className="col-span-3 flex flex-col items-center justify-center h-[200px] border border-dashed rounded-lg border-secondary">
                      <Info className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Select a stock to view detailed information</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6 border-secondary">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Voice Assistant</h2>
                <div className="flex flex-col items-center">
                  <Button
                    size="lg"
                    className={`w-16 h-16 rounded-full mb-4 ${
                      isListening ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
                    }`}
                    onClick={mounted && rtcHelpers ? (isListening ? stopAssistant : startAssistant) : undefined}
                    disabled={!mounted || !rtcHelpers}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6 text-primary-foreground" />
                    ) : (
                      <Mic className="w-6 h-6 text-primary-foreground" />
                    )}
                  </Button>
                  <p className="text-center mb-4">
                    {isListening
                      ? "Assistant is listening. Click to stop."
                      : mounted && rtcHelpers 
                      ? "Click to start the voice assistant"
                      : "Voice assistant initializing..."}
                  </p>
                  <audio ref={audioElementRef} autoPlay className="hidden" />
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Try asking:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>"Show me Apple's stock chart for the last month"</li>
                    <li>"Compare Tesla with Ford and GM"</li>
                    <li>"What are the key statistics for Microsoft?"</li>
                    <li>"Show me the 6-month chart for Amazon"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
