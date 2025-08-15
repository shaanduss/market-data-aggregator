const { retryFetch } = require("./helpers.js");
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Company Overview Endpoint
function ALPHAVANTAGE_OVERVIEW(symbol) {
  return `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
}

async function fetchAlphaVantageInsights(symbol, overviewIn) {
  // Fetch overview data from Alpha Vantage
  let overview = overviewIn
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

  return {
    PERatio,
    targetPrice,
    eps,
    dividendYield,
  };
}

async function fetchAlphaVantageMeta(symbol, overviewIn) {
  let overview = overviewIn
  if (!overview) {
    overview = await retryFetch(ALPHAVANTAGE_OVERVIEW(symbol), {}, 3, 1000);
  }
  const tsData = series["Time Series (Daily)"];
  const dates = tsData ? Object.keys(tsData).sort().reverse() : [];
  const latest = dates.length ? tsData[dates] : null;
  const instrumentType = (overview["AssetType"] == "Common Stock") ? "Equity" : overview["AssetType"];
  return {
    shortName: overview["Name"] ?? symbol,
    price: latest ? Number(parseFloat(latest["4. close"]).toFixed(2)) : "N/A",
    instrumentType: instrumentType ?? "N/A",
    previousClose: latest
      ? Number(parseFloat(latest["4. close"]).toFixed(2))
      : "N/A",
    marketHigh: overview["52WeekHigh"] ?? "N/A",
    volume: latest ? Number(latest["6. volume"]) : "N/A",
  };
}

module.exports = {
  fetchAlphaVantageInsights,
  fetchAlphaVantageMeta,
  ALPHAVANTAGE_OVERVIEW
};
