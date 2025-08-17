const { retryFetch } = require("./helpers.js");
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Company Overview Endpoint
function ALPHAVANTAGE_OVERVIEW(symbol) {
  return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
}

async function fetchAlphaVantageInsights(symbol, overviewIn) {
  // Fetch overview data from Alpha Vantage
  let overview = overviewIn;
  if (!overview) {
    overview = await retryFetch(ALPHAVANTAGE_OVERVIEW(symbol), {}, 3, 1000);
  }

  // Extract the desired fields
  const PERatio = overview["PERatio"] ?? "N/A";
  const targetPrice =
    overview["AnalystTargetPrice"] ??
    (overview["52WeekHigh"] ? Number(overview["52WeekHigh"]) : "N/A");
  const eps = overview["EPS"] ?? "N/A";
  const dividendYield = overview["DividendYield"]
    ? `${(Number(overview["DividendYield"]) * 100).toFixed(2)}%`
    : "N/A";

  const sectorInfo = overview["Sector"] ?? "N/A";
  const industry = overview["Industry"] ?? "N/A";
  const exchange = overview["Exchange"] ?? "N/A";
  const country = overview["Country"] ?? "N/A";

  return {
    PERatio,
    targetPrice,
    eps,
    dividendYield,
    sectorInfo,
    industry,
    exchange,
    country,
  };
}

async function fetchAlphaVantageMeta(symbol, overviewIn) {
  let overview = overviewIn;
  if (!overview) {
    overview = await retryFetch(ALPHAVANTAGE_OVERVIEW(symbol), {}, 3, 1000);
  }

  // Only use fields available in the OVERVIEW response
  // All price/time series data is not available via free Alpha Vantage
  const instrumentType =
    overview["AssetType"] === "Common Stock" ? "EQUITY" : overview["AssetType"];

  return {
    shortName: overview["Name"] ?? symbol,
    price: "N/A", // Not available for free
    instrumentType: instrumentType ?? "N/A",
    previousClose: "N/A", // Not available for free
    marketHigh: overview["52WeekHigh"] ?? "N/A",
    volume: "N/A", // Not available for free
  };
}

module.exports = {
  fetchAlphaVantageInsights,
  fetchAlphaVantageMeta,
  ALPHAVANTAGE_OVERVIEW,
};
