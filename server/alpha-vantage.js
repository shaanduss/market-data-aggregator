const { retryFetch } = require("./helpers.js");
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper for time series endpoint
function ALPHAVANTAGE_TIME_SERIES(symbol) {
  return `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;
}

// Sample for company overview
function ALPHAVANTAGE_OVERVIEW(symbol) {
  return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
}

// Example: RSI indicator
function ALPHAVANTAGE_RSI(symbol) {
  return `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&apikey=${API_KEY}`;
}

async function fetchAlphaVantageHistory(symbol, seriesIn) {
  let series = seriesIn;
  if (!series) {
    series = await retryFetch(ALPHAVANTAGE_TIME_SERIES(symbol), {}, 3, 1000);
  }
  const tsData = series["Time Series (Daily)"] || {};
  const historyData = Object.entries(tsData)
    .map(([date, data]) => ({
      time: new Date(date).toISOString(),
      price: Number(parseFloat(data["4. close"]).toFixed(2)),
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));
  return historyData;
}

async function fetchAlphaVantageInsights(symbol) {
  // Fetch overview and indicator data
  const overview = await retryFetch(ALPHAVANTAGE_OVERVIEW(symbol), {}, 3, 1000);
  const rsiRes = await retryFetch(ALPHAVANTAGE_RSI(symbol), {}, 3, 1000);

  // Alpha Vantage doesn't provide direct recommendations
  const rating = "N/A";
  const targetPrice = overview["52WeekHigh"]
    ? Number(overview["52WeekHigh"])
    : "N/A";
  const sectorInfo = overview["Sector"] ?? "N/A";
  const valuationDesc = overview["Description"] ?? "N/A";
  const provider = "Alpha Vantage";
  const technicalEvents = rsiRes["Technical Analysis: RSI"] ?? null;

  // Get most recent RSI values for short/mid/long term (if available)
  const rsiDates = technicalEvents
    ? Object.keys(technicalEvents).sort().reverse()
    : [];
  let shortTerm = "N/A",
    midTerm = "N/A",
    longTerm = "N/A";
  if (rsiDates.length > 0) {
    shortTerm = String(technicalEvents[rsiDates[0]]["RSI"]);
    midTerm = rsiDates ? String(technicalEvents[rsiDates]["RSI"]) : shortTerm;
    longTerm = rsiDates ? String(technicalEvents[rsiDates]["RSI"]) : shortTerm;
  }

  return {
    targetPrice,
    rating,
    provider,
    valuationDesc,
    sectorInfo,
    shortTerm,
    midTerm,
    longTerm,
  };
}

async function fetchAlphaVantageMeta(symbol, seriesIn) {
  let series = seriesIn;
  if (!series) {
    series = await retryFetch(ALPHAVANTAGE_TIME_SERIES(symbol), {}, 3, 1000);
  }
  const overview = await retryFetch(ALPHAVANTAGE_OVERVIEW(symbol), {}, 3, 1000);
  const tsData = series["Time Series (Daily)"];
  const dates = tsData ? Object.keys(tsData).sort().reverse() : [];
  const latest = dates.length ? tsData[dates] : null;
  return {
    shortName: overview["Name"] ?? symbol,
    price: latest ? Number(parseFloat(latest["4. close"]).toFixed(2)) : "N/A",
    instrumentType: overview["AssetType"] ?? "N/A",
    previousClose: latest
      ? Number(parseFloat(latest["4. close"]).toFixed(2))
      : "N/A",
    marketHigh: overview["52WeekHigh"] ?? "N/A",
    volume: latest ? Number(latest["6. volume"]) : "N/A",
  };
}

async function fetchAlphaVantageChartData(symbol, seriesIn) {
  let series = seriesIn;
  if (!series) {
    series = await retryFetch(ALPHAVANTAGE_TIME_SERIES(symbol), {}, 3, 1000);
  }
  const tsData = series["Time Series (Daily)"];
  const dates = tsData ? Object.keys(tsData).sort().reverse() : [];
  const latest = dates.length ? tsData[dates[0]] : null;
  const tick = {
    price: latest ? Number(parseFloat(latest["4. close"]).toFixed(2)) : 0,
    volume: latest ? Number(latest["6. volume"]) : 0,
    ts: dates.length ? new Date(dates).toISOString() : null,
  };
  return tick;
}

module.exports = {
  fetchAlphaVantageHistory,
  fetchAlphaVantageInsights,
  fetchAlphaVantageMeta,
  fetchAlphaVantageChartData,
  ALPHAVANTAGE_TIME_SERIES,
};
