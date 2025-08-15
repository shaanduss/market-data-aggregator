const { retryFetch, YAHOO_CHART, YAHOO_INSIGHTS } = require("./helpers.js");

async function fetchYFinanceHistory(symbol, chartIn) {
  let chart = chartIn;
  if (!chart) {
    chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
  }
  const timestamps = chart.chart.result[0].timestamp;
  const closes = chart.chart.result[0].indicators.quote[0].close;

  // Since the market does not always have data
  // Ensure that we find the first non-null price
  let lastPrice = 0;
  timestamps.some((_, idx) => {
    if (closes[idx] != null) {
      lastPrice = closes[idx];
      return true; // stops the loop
    }
    return false;
  });

  const historyData = timestamps.map((t, idx) => {
    // If the value isn't null, save the current price
    // Return new data
    if (closes[idx] != null) {
      lastPrice = closes[idx];
      return {
        time: new Date(t * 1000).toISOString(),
        price: Number(closes[idx].toFixed(2)),
      };
    } else {
      // If the price is null
      // Use the last available price
      return {
        time: new Date(t * 1000).toISOString(),
        price: lastPrice,
      };
    }
  });

  return historyData;
}

async function fetchYFinanceInsights(symbol) {
  const insightsRes = await retryFetch(YAHOO_INSIGHTS(symbol), {}, 3, 1000);

  const result = insightsRes.finance.result;

  // Safely access nested properties
  const recommendation = result?.instrumentInfo?.recommendation ?? null;
  const valuation = result?.instrumentInfo?.valuation ?? null;
  const technicalEvents = result?.instrumentInfo?.technicalEvents ?? null;

  // ValuationCard Data
  const targetPrice = recommendation?.targetPrice ?? "N/A";
  const rating = recommendation?.rating ?? "N/A";
  const provider = recommendation?.provider ?? "N/A";
  const valuationDesc = valuation?.description ?? "N/A";

  // Outlook Card Data
  const sectorInfo = result?.companySnapshot?.sectorInfo ?? "N/A";
  const shortTerm = String(technicalEvents?.shortTerm ?? "N/A").toUpperCase();
  const midTerm = String(technicalEvents?.midTerm ?? "N/A").toUpperCase();
  const longTerm = String(technicalEvents?.longTerm ?? "N/A").toUpperCase();

  const res = {
    targetPrice,
    rating,
    provider,
    valuationDesc,
    sectorInfo,
    shortTerm,
    midTerm,
    longTerm,
  };

  return res;
}

async function fetchYFinanceMeta(symbol, chartIn) {
  let chart = chartIn;
  if (!chart) {
    chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
  }
  const meta = chart.chart.result[0].meta;
  // return meta

  return {
    shortName: meta.shortName ?? "N/A",
    price: meta.regularMarketPrice ?? "N/A",
    instrumentType: meta.instrumentType ?? "N/A",
    previousClose: meta.previousClose ?? "N/A",
    marketHigh: meta.regularMarketDayHigh ?? "N/A",
    volume: meta.regularMarketVolume ?? "N/A",
  };
}

async function fetchYFinanceChartData(symbol, chartIn) {
  let chart = chartIn;
  if (!chart) {
    chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
  }
  const quotes = chart.chart.result[0].indicators.quote[0];
  const timestamps = chart.chart.result[0].timestamp;
  const latestIdx = quotes.close.length - 1;
  const price = quotes.close[latestIdx] ?? 0;
  const newPrice = Number(price.toFixed(2));

  const tick = {
    price: newPrice,
    volume: quotes.volume[latestIdx],
    ts: new Date(timestamps[latestIdx] * 1000).toISOString(),
  };

  return tick;
}

module.exports = {
  fetchYFinanceHistory,
  fetchYFinanceInsights,
  fetchYFinanceMeta,
  fetchYFinanceChartData,
};
