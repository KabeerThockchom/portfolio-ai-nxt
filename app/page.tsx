"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, BarChart4, Info } from "lucide-react"
import StockInfoPanel from "@/components/stock-info-panel"
import { useToast } from "@/hooks/use-toast"
import StockChart from "@/components/stock-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import TypewriterBadges from "@/components/ui/typewriter-badges"
import AudioSphereVisualizer from "@/components/ui/audio-sphere-visualizer"

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

// Interface for chart history item
interface ChartHistoryItem {
  chartData: ChartData;
  mainStock: string;
  selectedStock: string;
  comparisonStocks: string[];
  viewMode: "price" | "percent" | "relative";
}

const examplePrompts = [
  "How did AAPL do the last 3 months?",
  "Compare Tesla to Ford and GM",
  "Key stats for Microsoft?",
  "Amazon's stock price last 5 years",
];

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [rapidApiKey, setRapidApiKey] = useState("")
  const [selectedStock, setSelectedStock] = useState("")
  const [comparisonStocks, setComparisonStocks] = useState<string[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rtcHelpers, setRtcHelpers] = useState<RtcHelpersModule | null>(null);
  const [showComponents, setShowComponents] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [currentChartView, setCurrentChartView] = useState<"price" | "percent" | "relative">("price")
  const [mainStock, setMainStock] = useState("")

  // State for chart history carousel
  const [chartHistory, setChartHistory] = useState<ChartHistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

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
        setShowComponents(false);
        apiResponse = await fetchStockChart(args)
        if (apiResponse.success && apiResponse.chartData) {
          const newChartData = apiResponse.chartData;
          const newMainStock = args.symbol;
          const newSelectedStock = args.symbol;
          const newComparisonStocks = args.comparisons ? args.comparisons.split(",").map((s: string) => s.trim()) : [];
          // Assuming currentChartView is already updated or use a default/arg

          setChartData(newChartData);
          setMainStock(newMainStock);
          setSelectedStock(newSelectedStock);
          setComparisonStocks(newComparisonStocks);

          // Add to history
          setChartHistory(prevHistory => {
            const newEntry: ChartHistoryItem = {
              chartData: newChartData,
              mainStock: newMainStock,
              selectedStock: newSelectedStock,
              comparisonStocks: newComparisonStocks,
              viewMode: currentChartView, // Capture current view mode
            };
            // Simple history: add to end, could be improved (e.g., limit size)
            const updatedHistory = [...prevHistory, newEntry];
            setCurrentHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
          });

          setTimeout(() => setShowComponents(true), 100);
        } else if (apiResponse && !apiResponse.success) {
          toast({ title: "Error fetching chart", description: apiResponse.error, variant: "destructive" });
          setChartData(null);
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
  }, []);

  const handlePromptClick = (prompt: string) => {
    if (!isListening) {
      startAssistant().then(() => {
        // TODO: Find a reliable way to send the prompt after assistant is fully ready
        // This might require a more complex state management or event system
        // For now, we can try sending after a short delay, but it's not guaranteed
        setTimeout(() => {
          if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            const event = {
              type: "conversation.item.create",
              item: { type: "text_input", text: prompt },
            };
            dataChannelRef.current.send(JSON.stringify(event));
            dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
            toast({ title: "Prompt Sent", description: `Sent: "${prompt}"` });
          } else {
            toast({ title: "Assistant Not Ready", description: "Could not send prompt. Please try again.", variant: "destructive"});
          }
        }, 1500); // Delay to allow assistant to initialize
      });
    } else if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const event = {
        type: "conversation.item.create",
        item: { type: "text_input", text: prompt },
      };
      dataChannelRef.current.send(JSON.stringify(event));
      dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
      toast({ title: "Prompt Sent", description: `Sent: "${prompt}"` });
    } else {
        toast({ title: "Assistant Not Ready", description: "Could not send prompt. Please try again.", variant: "destructive"});
    }
  };

  // Function to navigate chart history
  const navigateToHistory = (index: number) => {
    if (index >= 0 && index < chartHistory.length) {
      setShowComponents(false); // Hide components to re-trigger animation
      const historyItem = chartHistory[index];
      
      // Delay state updates slightly to allow UI to register showComponents = false
      setTimeout(() => {
        setChartData(historyItem.chartData);
        setMainStock(historyItem.mainStock);
        setSelectedStock(historyItem.selectedStock);
        setComparisonStocks(historyItem.comparisonStocks);
        setCurrentChartView(historyItem.viewMode);
        setCurrentHistoryIndex(index);
        setShowComponents(true); // Show components to trigger animation
      }, 50); // Small delay, adjust if needed
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="container mx-auto px-4 py-4 flex-grow">
        <header className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">EY Portfolio AI</h1>
            <p className="text-muted-foreground">
              Voice-enabled AI assistant for financial insights and stock analysis
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="space-y-6">
          <div>
            <div
              className={`transition-all duration-700 ease-out ${
                showComponents && chartData ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1/2"
              }`}
            >
              <Card className="border-secondary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
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

                  <div id="chartContainer" className={`w-full min-h-[260px] ${chartData && !isLoading ? "visible" : "hidden"}`}>
                    {chartData && !isLoading && <StockChart chartData={chartData} symbol={selectedStock} viewMode={currentChartView} />}
                    <div className="legend-container flex flex-wrap gap-2 mt-2"></div>
                  </div>

                  {!chartData && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-[260px] border border-dashed rounded-lg border-secondary">
                      <BarChart4 className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Ask the assistant to show you a stock chart</p>
                    </div>
                  )}

                  {isLoading && (
                    <div id="loadingIndicator" className="flex flex-col items-center justify-center h-[260px]">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading chart data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div
              className={`transition-all duration-700 ease-out delay-200 ${
                showComponents && chartData ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1/2"
              }`}
            >
              <Card className="border-secondary">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-3">Stock Information</h2>
                  {chartData && chartData.chart && chartData.chart.result && chartData.chart.result.length > 0 && selectedStock ? (
                    <div className="grid grid-cols-1 gap-4">
                      <StockInfoPanel stock={selectedStock} chartData={chartData} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[260px] border border-dashed rounded-lg border-secondary">
                      <Info className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-center text-sm">
                        Select a stock or ask the assistant for details.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-6 py-3 flex flex-col items-center">
          {chartHistory.length > 1 && (
            <div className="flex justify-center space-x-2 mb-2">
              {chartHistory.map((_, index) => (
                <button 
                  key={`dot-${index}`} 
                  onClick={() => navigateToHistory(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-yellow-500/70 ${
                    currentHistoryIndex === index ? 'bg-yellow-400 scale-110' : 'bg-muted hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`View chart ${index + 1}`}
                />
              ))}
            </div>
          )}
          <div className="flex flex-col items-center justify-center mb-2 min-h-[4.5rem] md:min-h-[5.5rem]">
            <AudioSphereVisualizer 
              isAssistantListening={isListening}
              llmAudioElementRef={audioElementRef}
              onStartAssistant={startAssistant}
              onStopAssistant={stopAssistant}
              canvasClassName="w-16 h-16 md:w-20 md:h-20 cursor-pointer" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isListening
                ? "Tap me to mute"
                : mounted && rtcHelpers
                ? "Tap me to speak"
                : "Initializing..."}
            </p>
          </div>
          <audio ref={audioElementRef} autoPlay className="hidden" />
          <TypewriterBadges 
            prompts={examplePrompts} 
            onBadgeClick={handlePromptClick} 
            containerClassName="w-full flex flex-col items-center mt-3" 
            badgeClassName="bg-muted/70 hover:bg-muted text-muted-foreground cursor-pointer transition-colors text-xs py-1 px-2.5"
          />
        </div>
      </div>
    </main>
  )
}
