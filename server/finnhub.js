const { retryFetch } = require("./helpers.js");
const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY;

// Free API endpoints
function FINNHUB_QUOTE(symbol) {
  return `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_TOKEN}`;
}
function FINNHUB_PROFILE(symbol) {
  return `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_TOKEN}`;
}

// Only provides latest price; no history/candle
async function fetchFinnhubMeta(symbol) {
  const profile = await retryFetch(FINNHUB_PROFILE(symbol), {}, 3, 1000);
  const quote = await retryFetch(FINNHUB_QUOTE(symbol), {}, 3, 1000);

  console.log({
    shortName: profile?.name ?? symbol,
    price: quote?.c ?? "N/A", // current price
    instrumentType: profile?.type ?? "N/A", // eg Common Stock
    previousClose: quote?.pc ?? "N/A",
    marketHigh: quote.h ?? "N/A",
    volume: quote?.v ?? "N/A",
    exchange: profile?.exchange ?? "N/A",
  });
  return {
    shortName: profile?.name ?? symbol,
    price: quote?.c ?? "N/A", // current price
    instrumentType: profile?.type ?? "N/A", // eg Common Stock
    previousClose: quote?.pc ?? "N/A",
    marketHigh: quote.h ?? "N/A",
    volume: quote?.v ?? "N/A",
    exchange: profile?.exchange ?? "N/A",
  };
}

// Insights: limited to company context info (no fundamentals/analyst data)
async function fetchFinnhubInsights(symbol) {
  const profile = await retryFetch(FINNHUB_PROFILE(symbol), {}, 3, 1000);

  console.log({
    sectorInfo: profile.finnhubIndustry ?? "N/A", // closest Finnhub offers to sector
    exchange: profile.exchange ?? "N/A",
    country: profile.country ?? "N/A",
    ipo: profile.ipo ?? "N/A",
  });

  return {
    sectorInfo: profile.finnhubIndustry ?? "N/A", // closest Finnhub offers to sector
    exchange: profile.exchange ?? "N/A",
    country: profile.country ?? "N/A",
    ipo: profile.ipo ?? "N/A",
  };
}

// ChartData: just latest price/volume (no candles)
async function fetchFinnhubChartData(symbol) {
  const quote = await retryFetch(FINNHUB_QUOTE(symbol), {}, 3, 1000);
  console.log({
    price: quote.c ?? 0,
    volume: quote.v ?? 0,
    ts: new Date().toISOString(),
  });
  return {
    price: quote.c ?? 0,
    volume: quote.v ?? 0,
    ts: new Date().toISOString(),
  };
}

module.exports = {
  fetchFinnhubMeta,
  fetchFinnhubInsights,
  fetchFinnhubChartData,
  FINNHUB_QUOTE,
};
