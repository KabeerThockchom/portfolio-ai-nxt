# LLM Function Call Workflow: From API Request to UI Update

## Overview
This document describes the exact chain of events inside **`app/page.tsx`** (front-end) and the **`/app/api/stock/*`** routes (back-end) when the voice assistant decides to invoke a "tool" and the chart/info panel appears.

## The Complete Function Call Lifecycle

| Stage                                  | What the LLM sends or receives                                                                                                                                                                                                                                                                                                                           | What *our* code does                                                                                                                                                                                                                                                                                                                                                                                                  | Where this lives                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **①  GPT decides to call a tool**      | JSON on the data‑channel with<br>`{type:"response.function_call_arguments.done", name:"getStockChart", arguments:"{…}", call_id:"abc"}`                                                                                                                                                                                                                  | The `onmessage` handler in **`page.tsx`** immediately calls `handleFunctionCall(msg, dataChannel)`                                                                                                                                                                                                                                                                                                                    | `page.tsx` (data‑channel setup happens right after the WebRTC connection is opened)                                     |
| **②  Front‑end executes the tool**     | —                                                                                                                                                                                                                                                                                                                                                        | `handleFunctionCall`<br>```ts<br>switch (msg.name) {<br>  case "getStockChart":<br>    setIsLoading(true);           // shows spinner<br>    const res = await fetch(`/api/stock/chart?${qs}`);<br>    const out = await res.json();<br>```                                                                                                                                                                           | `handleFunctionCall` helper in `page.tsx`                                                                               |
| **③  Back‑end proxy to Yahoo Finance** | HTTP request from Next.js route to RapidAPI host `yahoo-finance-real-time1.p.rapidapi.com` with our API key                                                                                                                                                                                                                                              | Route handler in **`/app/api/stock/chart/route.ts`** builds the URL, attaches headers, awaits JSON, and returns `{success:true, chartData}` (or `{success:false, error}`)                                                                                                                                                                                                                                             | Each tool has its own route (`chart`, `profile`, `statistics`)                                                          |
| **④  React state update → UI appears** | —                                                                                                                                                                                                                                                                                                                                                        | On **success**:<br>```ts<br>setChartData(chartData);<br>setMainStock(args.symbol);<br>setComparisonStocks(args.comparisons ?? []);<br>setShowComponents(true);   // fades in <StockChart/> + <StockInfoPanel/><br>setIsLoading(false);<br>```<br>The two components subscribe to those pieces of state, so they instantly re‑render with the fresh data (ApexCharts draws the lines, the info panel formats the key numbers). | Still in `handleFunctionCall`<br>UI components live in `components/stock-chart.tsx` & `components/stock-info-panel.tsx` |
| **⑤  Result goes back to GPT**         | The front‑end *echoes* the result on the same data‑channel so the model can continue the conversation:<br>```json<br>{ "type":"conversation.item.create",<br>  "item":{ "type":"function_call_output",<br>           "call_id":"abc",<br>           "output":"{...stringified JSON...}" }}<br>{ "type":"response.create" }          // tells GPT "done"<br>``` | `handleFunctionCall` serialises the function's output, includes the original `call_id`, and sends both messages.                                                                                                                                                                                                                                                                                                      | `page.tsx`                                                                                                              |
| **⑥  GPT crafts the spoken reply**     | GPT reads the output, writes a normal assistant response ("Here's Apple's chart for the last month – it's up 4.7 % …"), and streams the audio back over the WebRTC media track.                                                                                                                                                                          | The `<audio>` element the page created when the session started is already hooked to the remote track, so the user hears the answer while the chart is already on screen.                                                                                                                                                                                                                                             | WebRTC `ontrack` handler in `page.tsx`                                                                                  |

## Why the UI Feels Instantaneous

* **Parallelism** – Steps ④ and ⑤ happen as soon as the HTTP fetch resolves; they do *not* wait for the LLM to finish speaking.
* **React state = single source‑of‑truth** – `<StockChart>`'s `useEffect` converts `chartData ➜ Apex series`, so merely calling `setChartData` is enough to redraw.
* **Graceful loading** – `setIsLoading(true)` toggles a small spinner overlay; `showComponents` gates a CSS fade‑in so the chart and info panel don't "pop" into view.
* **Error path** – If the fetch fails, `handleFunctionCall` sends GPT an error result *and* shows a toast (`toast.error(error)`). GPT can apologise verbally, while the UI stays unchanged.

## Key Code Sections

### 1. Function Call Handler in page.tsx
```ts
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
        // State updates trigger UI re-renders
        setChartData(newChartData);
        setMainStock(args.symbol);
        setSelectedStock(args.symbol);
        setComparisonStocks(args.comparisons ? args.comparisons.split(",").map((s: string) => s.trim()) : []);
        
        // Add to history and animate in components
        // ... state updates for history tracking ...
        setTimeout(() => setShowComponents(true), 100);
      } else if (apiResponse && !apiResponse.success) {
        toast({ title: "Error fetching chart", description: apiResponse.error, variant: "destructive" });
        setChartData(null);
      }
      setIsLoading(false)
    }
    // ... other functions (getStockProfile, getStockStatistics) ...

    // Send the result back to GPT
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
    // ... error handling ...
  }
}, [toast, fetchStockChart, fetchStockProfile, fetchStockStatistics]);
```

### 2. Stock Chart Component's useEffect
```ts
useEffect(() => {
  if (!chartData || !chartRef.current || !ApexChartsComponent || isLoadingChartLib) {
    // Skip if not ready
    return;
  }

  const processedData = processChartData(chartData, symbol, viewMode)
  if (!processedData) {
    return;
  }

  const { series, metadata } = processedData
  
  // Format chart options based on view mode
  // ... 

  const options = {
    series,
    chart: { /* chart configuration */ },
    // ... more configuration ...
  }

  // Update or create chart
  if (chartInstanceRef.current) {
    chartInstanceRef.current.updateOptions(options)
  } else {
    chartInstanceRef.current = new ApexChartsComponent(chartRef.current, options)
    chartInstanceRef.current.render()
  }

  // Add any annotations
  if (viewMode === "price") {
    addEventAnnotations(chartInstanceRef.current, chartData)
  }

  // Cleanup function
  return () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
      chartInstanceRef.current = null
    }
  }
}, [chartData, symbol, viewMode, theme, ApexChartsComponent, isLoadingChartLib])
```

### 3. Backend API Route
```ts
// app/api/stock/chart/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    // ... get other parameters ...

    if (!symbol) {
      return NextResponse.json({ success: false, error: "Symbol is required" }, { status: 400 })
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append("symbol", symbol)
    // ... add other parameters ...

    const url = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-chart?${params.toString()}`
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY || "",
        "x-rapidapi-host": "yahoo-finance-real-time1.p.rapidapi.com",
      },
    }

    const response = await fetch(url, options)
    // ... handle API response ...

    return NextResponse.json({
      success: true,
      chartData: result,
    })
  } catch (error: any) {
    // ... error handling ...
  }
}
```

### 4. WebRTC Data Channel Setup
```ts
dataChannel.addEventListener("message", async (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === "response.function_call_arguments.done") {
    handleFunctionCall(msg, dataChannel);
  }
});
```

## File Locations

| File                               | Key Contents                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`app/page.tsx`**                 | `setupDataChannel` (adds `onmessage`), `handleFunctionCall`, state setters (`setChartData`, `setShowComponents`) |
| **`components/stock-chart.tsx`**   | `useEffect` that maps `chartData` → ApexCharts series + options                                                  |
| **`app/api/stock/chart/route.ts`** | Builds query to Yahoo Finance, attaches `x-rapidapi-key`, returns JSON                                           |
| **`lib/webrtc-helpers.ts`**        | `createPeerConnection`, helper functions for WebRTC audio setup                                                  | 