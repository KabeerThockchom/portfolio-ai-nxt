# Portfolio Assistant

Portfolio Assistant is a voice-enabled AI application designed to provide financial insights and stock analysis. It leverages real-time voice interaction to fetch and display stock data, company profiles, and key statistics, offering a hands-on approach to portfolio management and market research.

## Features

*   **Voice-Controlled Interface**: Interact with the application using voice commands to request stock information.
*   **Real-time Stock Data**: Fetch and display up-to-date stock charts, including price, percentage change, and relative performance.
*   **Stock Comparison**: Compare the performance of multiple stocks on the same chart.
*   **Detailed Stock Information**: Access comprehensive company profiles and key financial statistics.
*   **Data Visualization**: Clear and interactive charts for easy understanding of stock trends.
*   **Dark/Light Mode**: Switch between themes for comfortable viewing.
*   **Built with Modern Technologies**: Leverages Next.js, React, TypeScript, and Tailwind CSS for a responsive and efficient user experience.

## Tech Stack

*   **Frontend**:
    *   Next.js (v15+)
    *   React (v19+)
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn UI & Radix UI (for UI components)
    *   Lucide React (for icons)
    *   ApexCharts/Recharts (for stock visualizations - *inferred from package.json*)
    *   Sonner (for toast notifications)
    *   React Hook Form & Zod (for forms, though not explicitly seen on the main page)
*   **Backend (Next.js API Routes)**:
    *   Handles API key management.
    *   Manages sessions for the voice assistant.
    *   Proxies requests to external financial data APIs.
*   **Voice Assistant & AI**:
    *   WebRTC for real-time audio communication.
    *   Azure Real-time AI (or similar, via `/api/session`) for Speech-to-Text (STT) and Text-to-Speech (TTS) and AI function calling.
*   **Financial Data Source**:
    *   Uses Yahoo Finance API via RapidAPI (inferred from `rapidApiKey` and common stock API providers).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   pnpm (or npm/yarn, but `pnpm-lock.yaml` is present)
*   Access to a financial data API (e.g., Yahoo Finance via RapidAPI) and an API key.
*   Azure AI services (or equivalent) credentials for the voice assistant functionality.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd portfolio-assistant 
    ```

2.  **Install dependencies:**
    If you have pnpm:
    ```bash
    pnpm install
    ```
    Or using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project and add the necessary API keys. The application fetches a `rapidApiKey` via `/api/keys`, so you will need to configure how this API endpoint retrieves your key. Typically, this involves setting environment variables that the API route can access.

    Example `.env.local`:
    ```env
    RAPIDAPI_KEY=your_rapidapi_key_here
    AZURE_AI_SPEECH_KEY=your_azure_speech_service_key_here # Or other relevant keys for voice AI
    AZURE_AI_SPEECH_REGION=your_azure_speech_service_region_here # If applicable
    # Add any other keys required by your /api/keys and /api/session backend
    ```
    *Note: You will need to implement the logic in `app/api/keys/route.ts` and `app/api/session/route.ts` (and other API routes) to securely access these environment variables and provide them to the frontend or use them server-side. If you are adding new variables.*

### Running the Application

1.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    Or using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Scripts

In the `package.json` file, you can find the following scripts:

*   `dev`: Runs the app in development mode.
*   `build`: Builds the app for production.
*   `start`: Starts a production server.
*   `lint`: Runs the linter.

## Project Structure (Simplified)

```
/
├── app/                    # Next.js App Router: Pages and API routes
│   ├── api/                # Backend API routes
│   │   ├── keys/           # API for fetching client-side keys (e.g., RapidAPI key)
│   │   ├── session/        # API for voice assistant session management
│   │   └── stock/          # APIs for stock data (chart, profile, statistics)
│   ├── layout.tsx          # Main application layout
│   ├── page.tsx            # Main page component (Portfolio Assistant UI)
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── ui/                 # Shadcn UI components
│   ├── stock-chart.tsx     # Component for rendering stock charts
│   └── stock-info-panel.tsx # Component for displaying stock details
├── hooks/                  # Custom React hooks (e.g., use-toast)
├── lib/                    # Utility functions and libraries (e.g., webrtc-helpers.ts)
├── public/                 # Static assets
├── styles/                 # Styling files (if any beyond global/tailwind)
├── next.config.mjs         # Next.js configuration
├── package.json            # Project metadata and dependencies
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Voice Assistant Commands

The voice assistant understands various commands to fetch financial data. Try saying:

*   "Show me Apple's stock chart for the last month."
*   "Compare Tesla with Ford and GM."
*   "What are the key statistics for Microsoft?"
*   "Show me the 6-month chart for Amazon."
*   "Get profile for GOOG."

The assistant uses function calling for:
*   `getStockChart(symbol, region?, comparisons?, range?, interval?, events?)`
*   `getStockProfile(symbol, region?)`
*   `getStockStatistics(symbol, region?)`

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for bugs, feature requests, or improvements.

(Optional: Add sections like Deployment, License, Acknowledgements as needed) 


Portfolio Assistant (AI-NXT) – Architecture and Design
Overview and High-Level Architecture
Portfolio Assistant (code-named portfolio-ai-nxt) is a voice-enabled AI web application that provides real-time financial insights and stock analysis
github.com
. It combines a modern Next.js front-end with integrated back-end API routes, leveraging an AI-powered voice assistant to handle user queries. The application is essentially a single Next.js project (using the App Router structure) that serves both the client-side UI and server-side API endpoints.
Frontend: The front-end is built with Next.js (React framework) and React (TypeScript), styled by Tailwind CSS and UI components from Shadcn UI/Radix UI. It uses libraries like Lucide-React for icons and ApexCharts for interactive data visualizations
github.com
. The UI is responsive and supports dark/light themes (via a theme toggle). Key design goals are a responsive, intuitive interface with real-time updates (e.g. stock charts) and a seamless voice interaction experience.
Backend: There is no separate back-end server; instead, Next.js API routes serve as the back-end. These serverless functions handle tasks such as securely providing API keys, managing the voice assistant session, and proxying requests to external financial data APIs
github.com
. All server-side logic (e.g. fetching stock data or initiating AI sessions) resides in these API route handlers.
Architecture Design: The application follows a component-based design on the front-end and an API-driven design on the back-end:
The Next.js App Router organizes pages and APIs under the app/ directory. The UI renders a single-page interface (app/page.tsx) which hosts the main dashboard and voice controls, while app/api/* endpoints provide back-end functionality. This means the front-end and back-end are tightly integrated in one project, enabling seamless data flow between UI components and server functions.
Real-time Voice Assistant – A standout architectural feature – uses a combination of WebRTC and Azure’s real-time AI services. The browser captures audio and opens a WebRTC connection to Azure’s cognitive service for speech-to-text (STT), language understanding (via GPT-4), and text-to-speech (TTS). The AI agent is given tools (functions) to call for fetching data. This voice pipeline runs concurrently with the front-end, allowing users to interact naturally by voice. (Details in the AI section below.)
Overall, the design is full-stack but without a traditional distinct server: Next.js handles SSR and API needs. The architecture emphasizes real-time data and interactive voice UX. Modern web tech ensures the UI is fast and reactive, while cloud AI services handle the complex language and speech tasks. The diagram below outlines the core structure:
Client-side: Next.js React app (UI components, hooks, state)
API routes (Server-side): Next functions for keys, AI session, and stock data
External services: Azure AI (for voice assistant), RapidAPI (Yahoo Finance for stock data)
(We will explore each part in detail in the next sections.)
Key Components and Structure
The project’s structure and components can be outlined as follows (simplified file tree):
app/                 # Next.js App Router directory
├── api/             # API route handlers (backend)
│   ├── keys/        # Exposes API keys securely
│   ├── session/     # Manages voice assistant sessions
│   └── stock/       # Stock data endpoints (chart, profile, statistics)
├── layout.tsx       # Root layout (includes ThemeProvider, global styles)
├── page.tsx         # Main page component (UI for Portfolio Assistant)
└── globals.css      # Global CSS (Tailwind base styles)
components/          # Reusable UI components
├── ui/              # UI library components (cards, buttons, toasts, etc.)
├── stock-chart.tsx  # StockChart component for rendering charts
└── stock-info-panel.tsx  # Info panel for stock details and stats
hooks/               # Custom React hooks (e.g., use-toast notifications, use-mobile detection)
lib/                 # Utility modules (e.g., webrtc-helpers for audio streaming, utils for classnames)
public/              # Static assets (icons, etc.)
... (config files like next.config.mjs, tailwind.config.ts, tsconfig.json)
(Adapted from the repository’s structure documentation
github.com
github.com
.)
Frontend UI Components
On the front-end, React components are organized to create the dashboard interface:
Main Page (app/page.tsx) – This is the central React component that defines the UI layout and state logic. It includes the voice assistant controls, the chart display, and the stock information panel. It uses React hooks for state: e.g. useState to manage whether the assistant is listening, which stock is selected, chart data, loading status, etc.
github.com
github.com
. The main page composes various child components and orchestrates interactions (like starting/stopping the voice assistant, handling responses, etc.). Key UI elements on this page:
A Microphone/Audio Controller (rendered as an interactive sphere or button) that the user can tap to start or stop the voice assistant. This is handled by an AudioSphereVisualizer component, which provides a visual indicator when the assistant is listening and also serves as the toggle control
github.com
github.com
. The microphone control is tied to functions startAssistant() and stopAssistant() which manage the WebRTC connection (see AI section).
Theme Toggle – A button to switch between light and dark mode, implemented via ThemeToggle component (using next-themes context)
github.com
. This allows comfortable viewing in either mode.
Example Prompt Badges – A set of example queries (e.g. “How did AAPL do last 3 months?”) displayed as clickable badges. These are rendered by a TypewriterBadges component that animates the text of prompts one by one (a “typewriter” effect) and lets the user click to send that query to the assistant
github.com
. This provides guidance on what kinds of questions the assistant can answer.
Stock Chart Display – The main chart area where stock price data is visualized. This is handled by the StockChart component, which uses ApexCharts (a charting library) to plot data. The chart supports multiple viewing modes: “price” (absolute price), “percent” (percentage change), or “relative” (indexed performance) views. The component dynamically imports ApexCharts and processes the data to plot series for the main stock and any comparison stocks
github.com
github.com
github.com
. It also adds event annotations for dividends, stock splits, earnings, etc., on the chart timeline
github.com
github.com
github.com
. The chart is interactive (zoom, pan, tooltips) and auto-updates when new data arrives or when the user switches the view mode. For example, if the assistant is asked “Compare Tesla with Ford and GM,” the chart will plot TSLA vs F vs GM on the same graph, and the title and legend will reflect that
github.com
github.com
.
Stock Info Panel – A side panel showing key details for the selected stock. The StockInfoPanel component displays summary statistics such as current price, daily change, 52-week range, volume, etc. for the main stock, or for any comparison stock the user selects
github.com
github.com
. If multiple stocks are plotted, small toggle buttons (stock symbol badges) appear above the chart to let the user choose which stock’s details to view
github.com
github.com
. The info panel updates whenever selectedStock state changes. For the main stock, it calculates metrics like price change vs previous close and color-codes them (green/red)
github.com
github.com
. For comparison stocks, it shows their last price, change, and performance over the chart period relative to their start value
github.com
.
Toast Notifications – The UI employs toast notifications for user feedback (e.g., error messages if data fetch fails or connection issues). The project uses Sonner library for toasts
github.com
, and also includes a custom useToast hook (from Shadcn UI) with a <Toaster> component in the UI tree
github.com
github.com
. This provides non-intrusive alerts, for example, a “Connection Error” toast if the voice assistant fails to connect
github.com
 or a confirmation when the assistant is ready to listen
github.com
.
All these components are styled with Tailwind CSS utility classes (with a design system configured in tailwind.config.ts). The UI components make use of pre-built primitives from Shadcn/Radix (e.g., cards, buttons, dialogs) to ensure consistency in design. Overall, the front-end is a single-page application – once loaded, all interactions (voice or clicks) update the React state and DOM without full page reloads.
Back-End API Routes
Under the app/api/ directory, the project defines several API route handlers that implement the server-side logic. These are essentially Node.js functions (Next.js API routes) that run on the server (or serverless environment) when called by the front-end. Key API endpoints include:
API Key Endpoint (GET /api/keys) – Provides the client with any public-facing keys it needs. In this app, it returns the RapidAPI key for the stock data service. For example, the implementation simply reads an environment variable and responds with JSON containing rapidApiKey
github.com
. This allows the front-end to use the key if making client-side requests. (Note: In this design, stock data is actually fetched via server routes, so exposing the key may not be strictly necessary. It’s included for flexibility or other client uses.)
Stock Data Endpoints (/api/stock/*) – A set of routes to fetch stock market data (chart info, company profile, key stats) from an external API. These act as a proxy to the Yahoo Finance API (via RapidAPI). The app uses Yahoo Finance because it provides comprehensive financial data. The RapidAPI service and key are used to authenticate these requests. There are three routes:
GET /api/stock/chart – Fetches historical price data (and comparisons) for one main stock (and optional comparison symbols) over a specified range and interval. The server code constructs a request to Yahoo’s stock/get-chart endpoint with the query parameters provided by the client (symbol, comparisons list, range like 1mo or 6mo, interval like 1d, etc.). It adds the required RapidAPI host and key headers (using process.env.RAPID_API_KEY) and performs the fetch
github.com
. If successful, it returns a JSON with success: true and the chartData from Yahoo
github.com
. If there’s an error (missing symbol, API error), it returns an error message. This route essentially offloads the data retrieval to the server so the client doesn’t directly expose the API key.
GET /api/stock/profile – Fetches company profile information for a given stock symbol (e.g. company description, sector, CEO, etc.). It calls Yahoo’s stock/get-profile endpoint with the symbol and region, using the RapidAPI key similarly
github.com
github.com
. The response is returned as JSON (profileData).
GET /api/stock/statistics – Retrieves key financial statistics (valuation metrics, ratios, etc.) for a stock via Yahoo’s stock/get-statistics API
github.com
github.com
. Returns JSON (statisticsData).
These stock routes allow the application to query up-to-date market data on demand. For example, if the user asks for a chart of AAPL, the front-end will call /api/stock/chart?symbol=AAPL&range=..., which in turn calls Yahoo Finance and returns the chart data to be plotted. All three routes rely on the RapidAPI key configured in environment variables for authentication. (The Yahoo Finance API host is fixed in the code, e.g. "yahoo-finance-real-time1.p.rapidapi.com"
github.com
.)
Voice Session Endpoint (GET /api/session) – This route is responsible for initiating a new Azure AI voice session for the assistant. When the user starts the voice assistant, the front-end calls /api/session to get the necessary credentials or session token for the Azure service. The server implementation makes a request to Azure’s Cognitive Services API to create a session: it sends a POST to Azure’s realtimeapi/sessions endpoint with a JSON payload specifying the model and voice to use, along with initial system instructions for the assistant
github.com
github.com
. The Azure service being used is a preview GPT-4-based real-time assistant (the code requests model "gpt-4o-mini-realtime-preview" with a voice persona called "verse"
github.com
). Importantly, this Azure endpoint returns an ephemeral access token (client secret) and session details that the app will need to establish the WebRTC connection. The server route simply relays Azure’s response back to the client as JSON
github.com
. In short, the /api/session route acts as a secure broker to obtain a token from Azure using the server-side API key (it uses OPENAI_API_KEY env var, which in this context is an Azure OpenAI key)
github.com
. The client then uses the returned token to connect to Azure’s real-time service. If the Azure session creation fails for any reason, the route returns an error status
github.com
github.com
.
These API routes constitute the back-end logic of the app. They are deployed along with the Next.js application (for example, on Vercel or a Node server), and Next.js ensures they run in a Node environment. The separation of concerns is clear: the front-end never directly contacts third-party APIs or holds sensitive keys; it always goes through these server functions. This design improves security and allows adding any needed server-side processing (like data formatting) in one place. Additionally, under lib/ and hooks/, the project has some utility modules:
lib/webrtc-helpers.ts – Contains helper functions to set up the WebRTC connection in the browser
github.com
. For example, createPeerConnection() to instantiate an RTCPeerConnection object (for peer-to-peer media/data channels) and getUserAudioMedia() to get microphone audio via getUserMedia
github.com
. These are used by the front-end when starting the voice assistant.
Custom Hooks – e.g. useToast to interface with the toast system, useMobile (possibly to detect if the user is on a mobile device and adjust UI if needed), etc. These hooks encapsulate reusable logic that doesn’t belong in components directly.
AI and ML Functionality: Voice Assistant Pipeline
One of the most innovative aspects of this app is its AI-powered voice assistant. This component uses natural language processing (NLP) and speech recognition/synthesis to let users have a conversation about stocks. Here’s how it works: 1. Speech Capture (Browser & WebRTC): When the user activates the assistant (by clicking the microphone sphere), the app accesses the microphone and opens a WebRTC connection to Azure:
The front-end calls navigator.mediaDevices.getUserMedia({ audio: true }) to capture live audio from the user’s microphone
github.com
.
It creates a new RTCPeerConnection and adds the audio stream tracks to it as senders (with addTransceiver, direction sendrecv)
github.com
github.com
. This sets up a peer-to-peer media channel where the user’s audio will be sent out, and in return, the app can receive audio (for the assistant’s speech).
Simultaneously, a data channel (labeled "oai-events") is opened on the peer connection
github.com
. This data channel is used for exchanging JSON messages (events) with the AI service. The app sets up event handlers on this channel:
On open: send a configuration (session.update) message to Azure to register the available “tools” (functions) the assistant can use
github.com
github.com
. This message includes a list of function definitions (name, description, and parameter schema for each function) corresponding to stock data retrieval capabilities. In our case, the tools are:
getStockChart – Fetches chart data for a given symbol (with optional comparison symbols, date range, etc.)
github.com
github.com
.
getStockProfile – Fetches company profile info for a given symbol
github.com
.
getStockStatistics – Fetches key financial statistics for a given symbol
github.com
.
These definitions mirror the API routes we described (the assistant will effectively call these functions). By sending this on session start, we inform the AI model about what functions it can invoke and how
github.com
github.com
. (Azure’s real-time GPT uses this to enable function calling in the conversation.) The data channel modalities are set to ["text", "audio"], indicating the conversation will include both voice and textual data
github.com
.
On message: listen for specific events from the AI. The client expects the AI to request function calls via the data channel. In particular, it listens for a message with msg.type === "response.function_call_arguments.done"
github.com
. When such a message arrives, it means the AI has finished deciding on a function to call and provided arguments. The app then invokes a handler handleFunctionCall(msg, dataChannel) to execute the requested function on its side
github.com
github.com
.
The app generates a WebRTC offer (SDP) for the connection and sends it to Azure. It first obtains an Azure session token by calling our /api/session endpoint (which returned an ephemeral client_secret)
github.com
. Then it POSTs its SDP offer to Azure’s real-time endpoint (.../v1/realtimertc?model=gpt-4o-mini-realtime-preview) with an Authorization: Bearer header carrying the ephemeral token
github.com
. Azure responds with an SDP answer – the app sets that as the remote description to complete the WebRTC handshake
github.com
. At this point, a secure peer-to-peer connection is established between the browser and Azure’s AI service.
2. Speech-to-Text and LLM Processing (Azure): Once the WebRTC connection is live:
The user’s audio stream is sent to Azure. Azure’s speech-to-text (STT) engine transcribes the user’s query in real time. If the user clicked an example prompt instead of speaking, the app will send a data channel message of type "conversation.item.create" with the text (simulating a user text input)
github.com
github.com
 – the model handles it as if that was transcribed speech.
Azure’s GPT-4 model (the gpt-4o-mini-realtime-preview) receives the transcribed text along with the system instructions (set when creating the session) and knows about the available functions (from the session.update we sent). The system instructions define the assistant’s role: e.g. be a helpful portfolio assistant providing financial insights
github.com
.
The AI model processes the query. Thanks to the function calling feature, if the user’s request involves needing data (which it likely does for most stock questions), the model will formulate a function call rather than a direct answer. For example, user says: “Show me Apple’s stock chart for the last month.” The model might respond (internally) with a function call request like: getStockChart(symbol="AAPL", range="1mo"). This intent is transmitted back to our app via the data channel as a message containing the function name, arguments, and a call identifier.
3. Function Execution (App Server): The app receives the function call request on the data channel (response.function_call_arguments.done). The handleFunctionCall function (on the front-end) runs and does the following
github.com
github.com
:
It parses the message to get the function name and arguments.
It matches the function name to one of the supported calls. In our case, if msg.name === "getStockChart", it will execute the logic for fetching chart data. This typically means calling the corresponding Next.js API route rather than directly calling the external API from the browser (keeping keys secure and leveraging server capabilities):
For getStockChart, it sets a loading state (to show a spinner on the chart) and invokes fetchStockChart(args) which under the hood calls fetch('/api/stock/chart?...') with the appropriate query parameters
github.com
github.com
. The server route then fetches from Yahoo and returns the JSON.
Similarly, getStockProfile triggers a call to /api/stock/profile and getStockStatistics calls /api/stock/statistics
github.com
. These return profileData or statisticsData JSON.
The fetched data (or error) is stored in a local variable apiResponse. The handler then updates the UI state accordingly:
If it was a chart request and data came back successfully, it updates React state: chartData is set to the new data, mainStock to the requested symbol, comparisonStocks to any comparisons returned, etc.
github.com
github.com
. It also adds this entry to a chartHistory list for reference (and possibly allows the user to navigate back through past charts via small dot indicators)
github.com
github.com
. After a small delay, it sets showComponents=true to fade in the chart and info panel nicely
github.com
github.com
. If there was an error fetching the chart (e.g. invalid symbol), it will show a toast notification with the error message
github.com
github.com
 and keep chartData empty.
If it was a profile or statistics call, the handler doesn’t update the chart (those data are likely intended to be spoken). It will, however, show a toast error if the fetch failed
github.com
.
Once the data (or error message) is ready, the app must return the result to the AI model. It does so by sending a Function Call Result event back over the data channel. The code constructs an event of type "conversation.item.create" with an item of type "function_call_output" that contains the call_id (the ID provided by the AI for this function call) and the output which is the JSON result stringified
github.com
github.com
. This pairing of call_id ensures the model knows which function call this result corresponds to. The app sends this JSON through the data channel, and then also sends a {"type": "response.create"} message to signal that the function result is complete and the assistant can proceed
github.com
github.com
.
If an error occurred during our function execution (exception, etc.), the handler similarly sends back a function_call_output with a success false and error message, so the AI can handle it gracefully
github.com
github.com
.
4. AI Generates Response and Text-to-Speech: Now with the function result in hand, Azure’s GPT-4 model continues the conversation. It will incorporate the data from the function output into a helpful answer for the user. For instance, after getting chart data, the model might produce a response like, “Apple’s stock has risen 5% in the last month. Here’s the chart showing the trend.” This response text is then converted to speech by Azure’s text-to-speech (TTS) engine (using the chosen voice, e.g. "verse"). The Azure service streams the synthesized voice audio back to the client over the WebRTC connection as an audio track.
On the client side, the RTCPeerConnection receives this media. We set up an ontrack handler when starting the assistant: it attaches any incoming audio stream to an <audio> element in the page
github.com
. Specifically, when the remote track arrives, the code sets audioElement.srcObject = event.streams[0]
github.com
. This allows the browser to play the assistant’s voice through the user’s speakers. The audio element was created with autoPlay and is hidden in the DOM
github.com
, so the user hears the response immediately.
The UI can also reflect that the assistant has responded – for example, we might display a “Assistant is now listening...” toast when ready
github.com
 and could show the response text if desired. (In the current implementation, the spoken answer itself is not printed to the screen – the focus is on voice output, though this could be added.)
5. Continuous Interaction: The session remains open for follow-up questions. As long as the user keeps talking or asking, the cycle repeats: audio in -> STT -> LLM -> function calls -> data -> answer out. The user can stop the assistant by clicking the microphone again, which triggers stopAssistant() to close the peer connection and data channel
github.com
. The app cleans up resources and resets the state (isListening=false, etc.). If the user wants to ask a new question later, they can start a new session; the app will obtain a fresh token and connection. This pipeline effectively integrates AI/ML services into the app:
Speech Recognition & Synthesis: Handled by Azure Cognitive Services over WebRTC (no heavy processing on our side).
Natural Language Understanding: Handled by Azure OpenAI (GPT-4) which interprets queries and decides on actions (function calls).
Function Calling Mechanism: A powerful feature that turns our defined API capabilities into “tools” the AI can use. The model’s ability to generate a function call and wait for results makes the conversation more dynamic and factual (it can fetch exact data rather than using stale knowledge).
Data Analysis: The AI can also perform reasoning with the fetched data if needed (e.g., comparing two stocks’ performance and then describing the difference). The instructions given to the model encourage it to “explain significance of information, be clear and concise”
github.com
, guiding the tone of its responses.
Overall, the voice assistant is an example of an AI inference pipeline integrated with web technology: real-time audio streaming, live model inference with function calls, and responsive voice output. This setup provides a hands-free, interactive user experience — the user can ask: “Compare Tesla with Ford and GM,” and the assistant will speak back the answer while simultaneously updating the chart and info panel with the latest data for TSLA vs F vs GM. (Note: The AI model and services used (Azure’s GPT-4 real-time preview) are cutting-edge and require the appropriate Azure resource and API keys. In a local dev setup, one must configure those keys and endpoints as described in the repo.)
Data Flow: From User Input to Displayed Output
To illustrate how data moves through the app, consider an example scenario: “User asks via voice: ‘Show me Google’s key statistics.’” Here’s the step-by-step data flow:
User Input (Voice) – The user clicks the microphone and speaks the query. The browser captures the audio stream and starts sending it to the Azure AI service over the WebRTC connection established (using the session token from our backend)
github.com
github.com
. The app also sends the list of available functions (getStockChart, getStockProfile, getStockStatistics) to Azure over the data channel at session start
github.com
github.com
.
Speech Transcription and Intent – Azure’s service transcribes the audio to text (“Show me Google’s key statistics”). The GPT-4 model interprets this and recognizes that it likely needs to use a function to fulfill it (specifically, getStockStatistics for symbol "GOOGL"). The model formulates a function call request: e.g. {name: "getStockStatistics", arguments: "{ \"symbol\": \"GOOGL\", \"region\": \"US\" }"} and sends this back to our app via the data channel as a JSON message.
Function Call to Back-end – The front-end receives the function call message and triggers handleFunctionCall. In this case, it identifies the getStockStatistics function
github.com
. The app calls its back-end API route: GET /api/stock/statistics?symbol=GOOGL&region=US
github.com
github.com
. This request goes to our serverless function, which in turn sends a request to Yahoo Finance via RapidAPI to fetch Google’s latest statistics (market cap, P/E ratio, etc.). The RapidAPI response comes back with a JSON containing these stats. Our API route then responds to the front-end with {"success": true, "statisticsData": {...}}
github.com
github.com
.
Data Return to AI – The front-end receives the JSON result. It packages the content into a function output message and sends it over the data channel back to Azure
github.com
github.com
. (For example, it might send: {type: "conversation.item.create", item: {type: "function_call_output", call_id: <ID>, output: "{\"success\":true, \"statisticsData\":{...}}"} } followed by a response.create marker
github.com
github.com
.) This informs GPT-4 that the data (Google’s stats) is available to use in its response.
AI Generates Response – With the stats data, GPT-4 composes a natural language answer. It might say: “Google’s market capitalization is X, and its P/E ratio is Y. Its revenue last quarter was Z... etc.” The Azure service then produces an audio stream of this answer using the chosen voice.
Output to User (Voice & UI) – Azure sends the spoken audio back over the WebRTC connection. The app’s ontrack handler attaches this audio to the hidden <audio> element, causing the user to hear the assistant’s voice giving the answer
github.com
. Meanwhile, the front-end may update the UI if relevant. In this example, since the request was for “key statistics,” the app might not have a dedicated UI update (unless we choose to display the stats in the info panel or a modal). Currently, the app primarily relies on voice for such answers and uses the chart and info panel UI for chart and price queries. However, the architecture allows updating the UI with any data the assistant fetched. For instance, after a getStockStatistics call, the app could populate the StockInfoPanel or show a summary. (This could be an extension of the current implementation.)
Continued Interaction – The user can follow up with another query (the session remains open for some time). Data flow for subsequent queries is similar: user input -> STT -> possible function call -> data fetch -> AI answer -> TTS output. If the user says “What about Apple?” as a follow-up, the context might carry over and the assistant might compare or fetch new data accordingly, using the same pipelines.
Throughout this flow, data is moving through several layers:
Browser ↔️ Next.js API (internal): The front-end triggers API calls to its own back-end (e.g., /api/stock/...), passing parameters and receiving JSON. This is a local network call on the same server/domain (often fast, and avoids CORS issues).
Next.js API ↔️ External APIs: The server functions call out to external services:
RapidAPI (Yahoo Finance) for financial data – using HTTP GET with the provided API key
github.com
.
Azure Cognitive Services for AI – using WebRTC (for the streaming session) and a REST call (to initiate the session token)
github.com
github.com
. The heavy AI processing happens on Azure’s side.
Azure ↔️ Browser (WebRTC): The audio and data channels allow a low-latency, bidirectional communication for the conversation. Audio goes up, and audio (plus control messages) comes down.
Crucially, the client-side state is updated with any new data. For example, after a chart query, chartData state is set and triggers a re-render of the StockChart and StockInfoPanel with the new information
github.com
github.com
. The UI thus reflects the latest data fetched by the AI’s function call. In effect, the AI’s decisions drive changes in the app’s front-end state. This architecture ensures that at any given time, the data presented (charts, stats, etc.) are the actual real-time data fetched on demand, rather than pre-loaded or stale data. The flow is demand-driven by user queries, making the app very interactive and data-efficient (it doesn’t pull data until asked).
Deployment and Environment Setup
Deployment Model: As a Next.js application, Portfolio Assistant can be deployed on any Node.js hosting or serverless platform that supports Next.js 13+ (App Router). Common choices would be Vercel (given Next.js origin), or Azure App Services if aligning with the Azure AI usage. The project includes standard scripts for building and starting in production:
Development: pnpm dev (or npm run dev) to start a local dev server at localhost:3000
github.com
. This uses Next.js’s development mode with fast refresh.
Production Build: pnpm build to compile the Next.js app for production, and pnpm start to run the optimized production server
github.com
. These scripts facilitate CI/CD pipelines – for instance, a CI workflow could run the build and then deploy the .next output.
Linting: pnpm lint is available to run ESLint checks
github.com
 (the config allows build to ignore lint/type errors for flexibility
github.com
).
Environment Configuration: The app relies on several API keys and service endpoints, which must be configured via environment variables:
RapidAPI Key for Yahoo Finance – stored in an env var (e.g. RAPIDAPI_KEY). This is used by the stock API routes to authenticate requests
github.com
. In the code it’s referenced as process.env.RAPID_API_KEY (note the underscore; the README suggests RAPIDAPI_KEY without underscore
github.com
, so the exact naming should match the code expectation).
Azure AI Credentials – an Azure OpenAI API key is needed (the code uses OPENAI_API_KEY env var in the session route
github.com
) along with the Azure endpoint URL (hardcoded in code as part of the fetch URL, which includes the resource name and region eastus2
github.com
). The README references possibly an AZURE_AI_SPEECH_KEY and region as well
github.com
. In the current implementation, it appears the Azure OpenAI key doubles for the real-time endpoint. Depending on Azure’s setup, one might have separate keys for speech and OpenAI. These should be supplied in a .env.local file in development, or as environment variables in production deployment.
Other Keys – If using any other AI service or map service etc., those would go in env. The README explicitly notes to include any keys required by /api/keys or /api/session routes
github.com
.
The repository includes a sample .env.local snippet for guidance
github.com
. During deployment, one must ensure these env vars are set (e.g., in Vercel’s dashboard or in the hosting environment). No secret keys should be committed to the repo; they are all kept outside in environment config. Hosting Considerations:
If deployed on Vercel, the Next.js API routes would run as serverless functions. The voice assistant’s WebRTC traffic (to Azure) would go directly from the user’s browser to Azure, not through Vercel, so that’s efficient. The stock data routes would execute on Vercel’s serverless environment and need internet access to RapidAPI – which is allowed.
The app should also be deployable to a custom Node server (by running the built app). In that case, one might use a process manager (like PM2 or Docker container) to run npm start. Node 18+ is recommended (since WebRTC and some APIs might require newer Node for polyfills, and the codebase uses modern JS/TS)
github.com
.
CI/CD: While the repo doesn’t explicitly include CI config, a typical CI pipeline would install dependencies (pnpm install), run tests/lints (if any), then build the app (pnpm build). Upon success, it would deploy the output or push to a platform. Because the app depends on external services (Azure, RapidAPI), automated tests would likely need mocks or to run against dummy data, unless API keys are provided securely in CI.
In summary, deploying Portfolio Assistant involves setting the required environment secrets and hosting the Next.js application. The integration with third-party services (Azure, RapidAPI) means those services must also be set up:
An Azure Cognitive Services resource with the OpenAI real-time model and Speech service enabled (in the region the code expects, or adjusting the endpoint accordingly).
A RapidAPI subscription to the Yahoo Finance API.
Once those are in place and keys configured, the app can be started and should be fully functional. The fact that it’s a single Next.js project simplifies deployment – there isn’t a separate backend service to manage besides the Next.js server itself.
Technologies Used
This project leverages a modern web and AI tech stack to achieve its functionality. Below is a summary of key technologies and libraries used and their roles in the system:
Next.js 13+ (App Router) – Primary web framework (React-based) used for both the front-end UI and back-end API routes. Next.js provides server-side rendering and file-based routing for the APIs. The “App Router” structure is used, which organizes pages and APIs under the app/ directory
github.com
. This yields a clean separation where app/page.tsx is the main page and app/api/** are server functions. Next.js also helps with asset bundling and environment variable injection at build time.
React 18 (with TypeScript) – Used for building the user interface in a component-driven way. The entire client-side is a React application, written in TypeScript for type safety. Hooks (like useState, useEffect, useCallback) manage state and side effects (e.g., managing the WebRTC connection in the voice assistant logic
github.com
github.com
). React enables the dynamic updates of charts and panels in response to data or user interaction.
Tailwind CSS – A utility-first CSS framework for styling. Tailwind is configured with custom theme values (colors, dark mode classes, etc.) to match the app’s design
github.com
github.com
. It allows rapid styling of components with utility classes directly in JSX, ensuring a consistent design. The presence of globals.css and Tailwind config indicates it’s been set up for use throughout the app. The dark mode is handled via Tailwind’s class strategy (darkMode: "class" with a <ThemeProvider> toggling a .dark class on <html>
github.com
).
Shadcn UI and Radix UI – Shadcn UI is a collection of pre-built components using Radix UI primitives and Tailwind styling. The app uses Shadcn’s components for things like Card, Button, Toast, etc.
github.com
github.com
. These come with accessibility and theming out-of-the-box. Radix UI provides low-level accessible primitives (like modals, popovers, etc.) that Shadcn’s components build upon. Using these libraries accelerates UI development and keeps design consistent.
Lucide-React – Icon library (a React version of Lucide icons). The app uses icons such as the microphone (Mic/MicOff), chart icon (BarChart4), info icon, sun/moon for theme toggle
github.com
github.com
. Lucide provides a wide range of clean SVG icons as React components, which are easily styled (e.g., via Tailwind classes).
ApexCharts (and potentially Recharts) – A robust charting library for data visualization. The code dynamically imports ApexCharts to render the stock charts
github.com
. ApexCharts is used to draw interactive line/area charts with zoomable time axes, annotations, and multiple series. The configuration in StockChart includes custom theming (matching dark/light mode), formatting of tooltips and axes, and series updates based on selected view
github.com
github.com
github.com
. The chart supports exporting (download), and interactive legend. The README also mentioned Recharts, but the code is clearly using ApexCharts – possibly Recharts was considered or inferred but not used in final implementation
github.com
. ApexCharts’ flexibility likely made it suitable for the multiple data series and real-time updates needed.
Sonner (Toast Notifications) – A lightweight library for toast alerts. The project uses Sonner’s <Toaster> to show notifications, integrated with theme support
github.com
github.com
. Sonner was chosen for its simplicity and theming (the code sets the toast theme to match the app’s current theme)
github.com
github.com
. It displays transient messages like errors (“Error fetching data”, “Connection error”) or success info (“Assistant Ready – now listening”).
React Hook Form & Zod – These are mentioned as part of the tech stack (for form handling and schema validation)
github.com
, though in the current app UI, there aren’t traditional forms to submit. Possibly they were planned for any form inputs or have minor use. Zod could be used to validate API responses or function call args, but primary usage isn’t evident in the main flow. Nonetheless, their inclusion suggests the app is set up to handle form inputs robustly if needed (e.g., if a future feature allowed typing a query or logging in, etc.).
WebRTC (Browser API) – Used for peer-to-peer communication of audio and data with the AI service
github.com
. The app creates an RTCPeerConnection and uses WebRTC’s capabilities to send microphone audio stream and receive audio + events. This is a core enabling technology for the real-time assistant, as it provides low latency streaming. The webrtc-helpers.ts and connection setup code deal directly with WebRTC APIs (transceivers, SDP offers/answers, data channels).
Azure Cognitive Services – OpenAI & Speech – On the AI side, the app relies on Azure’s implementation of OpenAI GPT-4 (with function calling) and possibly Azure Speech for STT/TTS. The integration is through Azure’s Real-time AI endpoint (currently a preview API). The model gpt-4o-mini-realtime-preview is an Azure-provided model that supports continuous conversation and function calling. Azure handles the heavy ML tasks in the cloud. Our app communicates with it via REST (to initiate sessions) and WebRTC (for the live session). This choice abstracts away direct use of OpenAI’s API; it leverages Azure’s managed service which bundles speech and language together. The benefit is real-time streaming and possibly lower latency for voice interactions. (It does require an Azure account and appropriate resource setup, as noted in the README
github.com
.)
Yahoo Finance API (via RapidAPI) – The source of financial data. Yahoo Finance provides comprehensive stock data (historical prices, profile, stats, etc.). By using the RapidAPI marketplace (the host yahoo-finance-real-time1.p.rapidapi.com), the app obtains an API key and a simple REST interface to Yahoo’s endpoints
github.com
. This is a pragmatic choice because it avoids dealing with scraping or undocumented APIs – RapidAPI standardizes the calls. The data returned includes everything needed to render charts and info (timestamps, price series, events, profile info like CEO name, stats like P/E, etc.). The app ensures to handle possible errors from this API (e.g., invalid symbols or rate limits) and surface them to the user via toasts
github.com
.
Next Themes – A small library (next-themes) for managing dark/light mode state. The app wraps its content in a <ThemeProvider> that enables system theme detection and class toggling
github.com
. This makes it easy to implement the dark mode toggle (which simply calls setTheme('light' or 'dark') on user click
github.com
, and the UI updates accordingly via Tailwind’s dark classes). It’s a non-critical but nice UX technology.
TypeScript & ESLint – The project is written in TypeScript throughout (with tsconfig.json present for configuration). This provides type safety for components and API responses, reducing runtime errors. ESLint is configured (with some rules relaxed for expedience
github.com
) to maintain code quality. During development, these help catch mistakes early.
Combining these technologies, Portfolio Assistant delivers a cutting-edge experience: a React/Next web app with rich, data-driven visuals and an AI voice assistant that feels interactive and intelligent. The choice of tech reflects the need for real-time responsiveness (WebRTC, ApexCharts updates), a strong UI/UX (Tailwind, Radix components), and integration with AI services that provide capabilities far beyond what a traditional app could do (natural language understanding and speech dialogue). The result is a modern, AI-powered web application that exemplifies how front-end, back-end, and cloud AI can come together.
Project Structure and Conventions
The codebase follows typical conventions for a Next.js TypeScript project, enhanced with some structure to support its features:
Modular Code Organization: Logic is divided into self-contained modules: UI in components/, utilities in lib/, hooks in hooks/, etc. For instance, all stock-related visual components are in components/stock-*.tsx, keeping the main page component cleaner. The app/page.tsx imports these and mainly handles orchestration (state and event handling)
github.com
github.com
.
File/Folder Naming: The project uses descriptive file and folder names (e.g., stock-info-panel.tsx for the info panel). Next.js App Router requires specific naming for page and route files (page.tsx for pages, route.ts for API routes). Inside app/api, subfolders like stock/chart/route.ts clearly separate different endpoints. This structure is reflected in the URL scheme of the running app (e.g., /api/stock/chart corresponds to that folder/file structure).
Styling Conventions: With Tailwind, there is minimal use of separate CSS files. Global styles (like importing Tailwind base and perhaps custom global rules) are in globals.css
github.com
. Otherwise, the convention is to use Tailwind classes directly in JSX. The design tokens (colors, spacing, etc.) are configured via CSS custom properties (as seen in tailwind.config and used in class names like bg-card text-card-foreground from Shadcn components
github.com
).
Environment Variables: The app expects environment configs for anything that differs by deployment (API keys, etc.). By convention, Next.js loads .env.local for local dev. The code references process.env.XYZ for those values (never hard-coding secrets). For example, process.env.RAPID_API_KEY is used in the API routes
github.com
. The convention of providing a sample in README and using Next’s built-in env support is followed.
Coding Conventions: The code uses modern ES2025+ features (arrow functions, async/await, etc.). It leverages TypeScript interfaces for structured data (e.g., defining ChartData and response types in the main page for clarity
github.com
github.com
). The project likely follows common ESLint rules (with some lenience as configured), ensuring consistent formatting and catch of potential errors.
UI/UX Patterns: The application uses optimistic UI updates and spinners for loading states. For instance, when a chart fetch is in progress, it sets isLoading=true to show a spinner overlay on the chart area
github.com
. When data arrives, it smoothly transitions in the chart and info panel (showComponents triggers a CSS transition class)
github.com
github.com
. This attention to state and transitions is part of the app’s user-friendly convention.
Reusable Components: By abstracting pieces like <AudioSphereVisualizer> (for the mic control + visuals) and <TypewriterBadges> (for example prompts animation), the code remains DRY and easier to maintain. These components are placed in logical locations (likely under components/ui/ for generic UI elements).
Comments and Documentation: The repository’s README is quite detailed, providing an overview of features and structure. In-code comments are also present to explain complex sections (for example, comments in page.tsx around the function call handling, indicating TODOs or assumptions). This indicates a convention of self-documenting code, helpful for future contributors.
In conclusion, the Portfolio Assistant repository showcases a comprehensive integration of front-end, back-end, and AI components. Its architecture is high-level (voice + data + UI) yet implemented with clear separation of concerns and modern frameworks. The main design pattern is event-driven: user events (voice or click) → AI or API events → state updates → UI re-render. The technologies and structure used are state-of-the-art, making the app both a demonstration of AI capabilities and solid software engineering practices. Sources:
