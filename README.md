# Market Data App

A comprehensive **Next.js dashboard** for real-time US equities analytics, fundamental and sector metrics, using multiple free market data APIs. Built to deliver robust, user-friendly stock insights even in the face of real-world data provider limitations and rate-limiting.

---

## Features

- **Live prices and basic chart data:**  
  Streams real-time prices and recent chart history for US stocks using Yahoo Finance’s unofficial API (most reliable free source).

- **Financial snapshot cards:**  
  - _Meta Card:_ Displays ticker name, price, instrument type, previous close, high, volume (via Yahoo Finance, Finnhub, or Alpha Vantage).
  - _Valuation Card:_ Shows PE ratio, EPS, dividend yield, and target price where available (Alpha Vantage for US stocks, fallback to Finnhub’s free fields like market cap/currency/shares).
  - _Outlook Card:_ Renders sector/industry, exchange, country, IPO date (via Alpha Vantage, Finnhub, and Yahoo—cards auto-adapt to the platform).

- **Multi-provider support and smart fallback:**  
  - **Yahoo Finance:** Real-time and historical prices, sector, and technical fields.
  - **Alpha Vantage:** Company fundamentals (very strict: 25 req/day, only static fields, no history, no live updates).
  - **Finnhub:** Free access to company profile info, current price, sector, industry, exchange, IPO, currency, share outstanding, logo, but no historical candles/fundamentals.

- **Hybrid History with Supabase:**  
  Caches and reuses previously searched ticker history, reducing external API calls and improving user performance.

- **Realtime front-end updates:**  
  WebSocket server streams live price ticks and other market events to all connected users.

- **Rich modular UI:**  
  Reusable, platform-aware React financial cards with customized Lucide.dev icons. Design adapts automatically for equity, index, or provider.

---

## Data Sources

| Provider        | Used for                                    | Free Limits                     |
|-----------------|---------------------------------------------|---------------------------------|
| Yahoo Finance   | Real-time & historical price, sector, volume| No official limit (unofficial)  |
| Alpha Vantage   | Fundamentals (PE, EPS, dividend, sector)    | 25 req/day (no history)         |
| Finnhub         | Price, company profile, meta/sector, logo   | No history/fundamentals for US, generous for context/meta |

- **Note:** Only fields that are free and reliably available are used from each provider.  
- **API keys** for Alpha Vantage and Finnhub are required (set in `.env`).

---

## Getting Started

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

---

## Code Architecture

- **Backend (Node.js + WebSocket):**
  - Fetches/sanitizes market data from the 3 APIs.
  - Defensively handles API rate limiting, outages, and field absences.
  - Streams market data as typed JSON to multiple frontend clients.
  - Caches history and symbols in **Supabase** for fast reloads & historical display.

- **Frontend (Next.js + React):**
  - Modular financial cards (`InfoCard`, `ValuationCard`, `OutlookCard`) with provider/data-type awareness.
  - Displays context/currency/market structure for meta cards and sector/industry context for outlook cards.
  - Chart consistently auto-updates from live ticks.
  - Uses [Geist font](https://vercel.com/font) via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for sharp UI.

- **Provider logic:**
  - All fetchers (`fetchYFinanceMeta`, `fetchAlphaVantageMeta`, `fetchFinnhubMeta`, etc.) are modular and call only those endpoints and fields guaranteed to be free and reliable.
  - Data normalization code ensures cards always show something meaningful, or "N/A" if not available.

---

## Limitations

- **Alpha Vantage:** Strictly 25 requests/day per API key. No real-time or historical price, limited to static "company overview" fields.
- **Finnhub:** No history or in-depth fundamentals for US tickers on free plans; only live price and company meta/profile available.
- **Yahoo Finance:** Unofficial; best source for history and live prices, but can change or rate-limit at any time.
- **Reliability:** The system is designed to degrade gracefully, but free API providers can go down or change API fields arbitrarily.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Yahoo Finance API (unofficial)](https://query1.finance.yahoo.com)
- [Alpha Vantage API](https://www.alphavantage.co/documentation/)
- [Finnhub API](https://finnhub.io/docs/api)

---

## Adding Your API Keys

Create a `.env` file in the root directory:

