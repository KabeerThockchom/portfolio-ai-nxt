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
    *   Likely uses a service like Yahoo Finance API via RapidAPI (inferred from `rapidApiKey` and common stock API providers).

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
    *Note: You will need to implement the logic in `app/api/keys/route.ts` and `app/api/session/route.ts` (and other API routes) to securely access these environment variables and provide them to the frontend or use them server-side.*

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