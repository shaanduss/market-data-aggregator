# Market Data App

This project is a **Next.js financial dashboard** for live equity analytics and charting, built with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Live market prices and charting:** Uses Yahoo Finance’s unofficial API for reliable real-time prices and historical data.
- **Equity fundamentals:** Fetches PE ratio, EPS, dividend yield and more from Alpha Vantage, but only within strict limits.
- **Hybrid history:** Loads price history from YFinance. For previously searched symbols, retrieves cached history from Supabase for quick access.
- **Custom financial UI components:** Financial Cards visualize market/meta data for equities and indices.
- **Real-time updates:** WebSocket integration for price/tick streaming.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```


Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

You can edit the app by modifying `app/page.tsx`. Hot-reloading takes effect as you code.

The UI uses [Geist](https://vercel.com/font) via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for crisp text rendering.

## API Providers & Data Policy

### Yahoo Finance

- **Source of truth** for real-time market prices and historical chart data.
- No official rate limits, but endpoint throttling and outages can occur due to unofficial usage.

### Alpha Vantage

- **Free tier limited to 25 requests/day.**
- Useful for static fundamentals (PE ratio, EPS, dividend yield, etc).
- _Does not provide price history or live updates on free plans._
- **For all real-time and historical charting, we use Yahoo Finance.**

### Supabase

- Used for searching, caching, and serving history for previously fetched symbols.

## Code Highlights

- Built with Next.js App Router and React functional components.
- Data fetchers are pluggable for multiple providers: `yfinance.js`, `alpha-vantage.js`.
- Frontend cards (`InfoCard`, `ValuationCard`, `OutlookCard`) adapt to provider/platform/asset type.
- All sensitive API keys must be set in `.env` (not committed).
- Includes websocket support for pushing live prices to clients.

## Limitations

- **Alpha Vantage** is suitable only for reference/fundamental data; do not use for price history or streaming due to severe free tier limits.
- **Yahoo Finance** unofficial endpoints may be subject to API changes or throttling, but are currently the most robust free option.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Tutorial](https://nextjs.org/learn)
- [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) — recommended for deployment.

## Notes

> **Why not Alpha Vantage for history or live prices?**
> Free tier only allows 25 requests per day and does not support historical or live price data for US stocks. For all real-time features, we use Yahoo Finance’s unofficial endpoints as the backbone of market data.

---

**Feedback and contributions welcome!**

See [the Next.js GitHub repository](https://github.com/vercel/next.js) for more tips and best practices.
