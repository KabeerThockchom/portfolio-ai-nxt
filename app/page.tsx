"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, BarChart4, Info, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
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

// Custom AutoAwesome icon component that mimics Material UI's AutoAwesome
const AutoAwesomeIcon = ({ className = "" }: { className?: string }) => {
  return (
    <span className={`${className} animate-pulse-glow`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffe600" width="24" height="24">
        <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
      </svg>
    </span>
  );
};

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [currentChartView, setCurrentChartView] = useState<"price" | "percent" | "relative">("price")
  const [mainStock, setMainStock] = useState("")

  // State for chart history carousel
  const [chartHistory, setChartHistory] = useState<ChartHistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [llmResponseHistory, setLlmResponseHistory] = useState<string[]>([]);
  const [currentLlmMessage, setCurrentLlmMessage] = useState<string>("");
  
  // Animation direction state
  const [slideDirection, setSlideDirection] = useState<'none' | 'left' | 'right'>('none');
  
  // Touch handling for swipe gestures
  const touchStartXRef = useRef<number | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Add a ref to track the last message content for deduplication
  const lastMessageRef = useRef<string>("");

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
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Fetch API keys
      const keysResponse = await fetch("/api/keys");
      const keysData = await keysResponse.json();
      setRapidApiKey(keysData.rapidApiKey);
      
      // Initialize session with user's timezone
      await fetch(`/api/session?timezone=${encodeURIComponent(userTimezone)}`);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Some features may not work.",
        variant: "destructive",
      });
    }
  };

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

  // Define stopAssistant before it's used in handleFunctionCall
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
      } else if (msg.name === "muteAssistant") {
        // Allow the assistant to end the conversation
        stopAssistant();
        toast({
          title: "Assistant Disconnected",
          description: args.message || "The assistant has ended the conversation.",
        });
        apiResponse = { success: true };
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
  }, [toast, fetchStockChart, fetchStockProfile, fetchStockStatistics, stopAssistant]);

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
          {
            type: "function",
            name: "muteAssistant",
            description: "Allows the assistant to end the current conversation",
            parameters: {
              type: "object",
              properties: {
                message: { type: "string", description: "Optional message explaining why the conversation is ending" },
              },
              required: [],
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
          handleFunctionCall(msg, dataChannel);
        } else if (msg.type === "response.text.delta" || msg.type === "response.audio_transcript.delta") {
          if (msg.delta) {
            // Only update current message - don't add to history yet
            setCurrentLlmMessage(prevText => prevText + msg.delta);
          }
        } else if (msg.type === "response.text.done" || msg.type === "response.audio_transcript.done") {
          // Complete the current message
          setCurrentLlmMessage(current => {
            const finalMessage = current + (msg.delta || "");
            
            // Store this in our ref for deduplication
            lastMessageRef.current = finalMessage;
            
            // Only add to history if it's not empty
            if (finalMessage.trim()) {
              // Add to history using the functional update to avoid race conditions
              setLlmResponseHistory(prevHistory => {
                // Check if this message is already in history to prevent duplicates
                if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1] === finalMessage) {
                  // Message already exists, don't add again
                  return prevHistory;
                }
                return [...prevHistory, finalMessage];
              });
            }
            
            // Clear the current message since it's now in history
            return "";
          });
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

  const handlePromptClick = (prompt: string) => {
    if (!isListening) {
      startAssistant().then(() => {
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
        }, 1500);
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
      // Determine slide direction based on index change
      if (index > currentHistoryIndex) {
        setSlideDirection('left'); // Newer chart, slide from right to left
      } else if (index < currentHistoryIndex) {
        setSlideDirection('right'); // Older chart, slide from left to right
      } else {
        setSlideDirection('none'); // Same chart, no slide
      }
  
      setShowComponents(false); // Hide components to re-trigger animation
      const historyItem = chartHistory[index];
      
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

  // Handle navigation to previous chart
  const navigateToPrevious = useCallback(() => {
    if (currentHistoryIndex > 0) {
      navigateToHistory(currentHistoryIndex - 1);
    }
  }, [currentHistoryIndex]);

  // Handle navigation to next chart
  const navigateToNext = useCallback(() => {
    if (currentHistoryIndex < chartHistory.length - 1) {
      navigateToHistory(currentHistoryIndex + 1);
    }
  }, [currentHistoryIndex, chartHistory.length]);

  // Touch event handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null || chartHistory.length <= 1) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;
    
    // Minimum swipe distance threshold (adjust as needed)
    const minSwipeDistance = 50;
    
    if (diffX > minSwipeDistance) {
      // Swipe right -> Previous chart
      navigateToPrevious();
    } else if (diffX < -minSwipeDistance) {
      // Swipe left -> Next chart
      navigateToNext();
    }
    
    touchStartXRef.current = null;
  }, [navigateToPrevious, navigateToNext, chartHistory.length]);

  // Add this to the main function to include the CSS animation
  useEffect(() => {
    // Add the animation CSS to the document
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-glow {
        0% { filter: drop-shadow(0 0 2px #ffe600); }
        50% { filter: drop-shadow(0 0 4px #ffe600); }
        100% { filter: drop-shadow(0 0 2px #ffe600); }
      }
      .animate-pulse-glow {
        animation: pulse-glow 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border py-3 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          Portfolio A<span className="relative">I
          <AutoAwesomeIcon className="absolute -top-2 -right-4 h-2 w-2" />
          </span>
        </h1>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`border-r border-border transition-all duration-300 bg-card ${isSidebarCollapsed ? 'w-12' : 'w-80'} flex flex-col`}>
          <div className="flex justify-end p-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Sidebar content */}
          <div className={`flex-1 flex flex-col p-4 ${isSidebarCollapsed ? 'hidden' : ''}`}>
            {/* Audio Visualizer */}
            <div className="flex flex-col items-center justify-center mb-6">
              <AudioSphereVisualizer 
                isAssistantListening={isListening}
                llmAudioElementRef={audioElementRef}
                onStartAssistant={startAssistant}
                onStopAssistant={stopAssistant}
                canvasClassName="w-36 h-36 md:w-40 md:h-40 cursor-pointer" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {isListening
                  ? "Tap to mute"
                  : mounted && rtcHelpers
                  ? "Tap to speak"
                  : "Initializing..."}
              </p>
              <audio ref={audioElementRef} autoPlay className="hidden" />
            </div>
            
            {/* Chat Transcript */}
            <div className="flex flex-col mb-6 h-[40vh]">
              <div className="relative flex items-center mb-2 h-6">
                <p className="text-sm font-medium">
                  Transcript
                </p>
              </div>
              <div className="overflow-y-auto flex-1 space-y-2 border border-border rounded-lg p-3">
                {llmResponseHistory.map((text, index) => (
                  <div key={index} className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                    {text}
                  </div>
                ))}
                {currentLlmMessage && (
                  <div className="text-sm text-foreground p-2 bg-primary/10 rounded-md animate-pulse">
                    {currentLlmMessage}
                  </div>
                )}
                {(llmResponseHistory.length === 0 && !currentLlmMessage) && (
                  <p className="text-xs text-muted-foreground text-center">Assistant responses will appear here.</p>
                )}
              </div>
            </div>
            
            {/* Example Prompts */}
            <div className="mt-auto">
              <div className="relative flex items-center mb-2 h-6">
                <p className="text-sm font-medium">
                  Example Prompts
                </p>
              </div>
              <TypewriterBadges 
                prompts={examplePrompts} 
                onBadgeClick={handlePromptClick} 
                containerClassName="flex flex-col gap-2" 
                badgeClassName="bg-muted/70 hover:bg-muted text-muted-foreground cursor-pointer transition-colors text-sm py-1.5 px-3 w-full text-left"
              />
            </div>
          </div>
          
          {/* Collapsed state only shows icons */}
          <div className={`flex-1 flex flex-col items-center py-4 ${!isSidebarCollapsed ? 'hidden' : ''}`}>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(false)} className="mb-4">
              <Mic className={`h-5 w-5 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div 
          className="flex-1 overflow-y-auto p-6" 
          ref={mainContentRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Chart History Navigation */}
            {chartHistory.length > 1 && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={navigateToPrevious}
                  disabled={currentHistoryIndex <= 0}
                  aria-label="Previous chart"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex space-x-2">
                  {chartHistory.map((_, index) => (
                    <button 
                      key={`dot-${index}`} 
                      onClick={() => navigateToHistory(index)}
                      className={`h-3 w-3 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-yellow-500/70 ${
                        currentHistoryIndex === index ? 'bg-yellow-400 scale-110' : 'bg-muted hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`View chart ${index + 1}`}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={navigateToNext}
                  disabled={currentHistoryIndex >= chartHistory.length - 1}
                  aria-label="Next chart"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Stock Visualization Card */}
            <div
              className={`transition-all duration-700 ease-out ${
                showComponents && chartData 
                  ? "opacity-100 " + 
                    (slideDirection === 'left' 
                      ? 'animate-slide-in-from-right' 
                      : slideDirection === 'right' 
                        ? 'animate-slide-in-from-left' 
                        : 'translate-y-0')
                  : "opacity-0 " + 
                    (slideDirection === 'left' 
                      ? 'translate-x-full' 
                      : slideDirection === 'right' 
                        ? '-translate-x-full' 
                        : 'translate-y-8')
              }`}
            >
              <Card className="border-secondary">
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

                  <div id="chartContainer" className={`w-full min-h-[300px] ${chartData && !isLoading ? "visible" : "hidden"}`}>
                    {chartData && !isLoading && <StockChart chartData={chartData} symbol={selectedStock} viewMode={currentChartView} />}
                    <div className="legend-container flex flex-wrap gap-2 mt-2"></div>
                  </div>

                  {!chartData && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-[300px] border border-dashed rounded-lg border-secondary">
                      <BarChart4 className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Ask the assistant to show you a stock chart</p>
                    </div>
                  )}

                  {isLoading && (
                    <div id="loadingIndicator" className="flex flex-col items-center justify-center h-[300px]">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-muted-foreground text-sm">Loading chart data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Stock Information Card */}
            <div
              className={`transition-all duration-700 ease-out delay-10 ${
                showComponents && chartData 
                  ? "opacity-100 " + 
                    (slideDirection === 'left' 
                      ? 'animate-slide-in-from-right' 
                      : slideDirection === 'right' 
                        ? 'animate-slide-in-from-left' 
                        : 'translate-y-0')
                  : "opacity-0 " + 
                    (slideDirection === 'left' 
                      ? 'translate-x-full' 
                      : slideDirection === 'right' 
                        ? '-translate-x-full' 
                        : 'translate-y-8')
              }`}
            >
              <Card className="border-secondary">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Stock Information</h2>
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
      </div>
    </main>
  )
}
