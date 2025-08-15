const WebSocket = require("ws");
const fetch = require("node-fetch");
require("dotenv").config();

// Supabase Related Variables
const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const wss = new WebSocket.Server({ port: 4000 });

// Valid Token Check
const VALID_CLIENT_TOKENS = process.env.VALID_CLIENT_TOKENS?.split(",") || [];
function isValidToken(token) {
  return VALID_CLIENT_TOKENS.includes(token);
}

// Retry Fetching Function incase of failure
async function retryFetch(url, options = {}, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HttpError: ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, backoff * 2 ** i));
    }
  }
}

// Save to Supabase DB
async function saveMarketData(symbol, data) {
  await supabase.from("market_ticks").insert([{ symbol, ...data }]);
}

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

async function fetchChartData(symbol, chartIn) {
  let chart = chartIn;
  if (!chart) {
    chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
  }
  const quotes = chart.chart.result[0].indicators.quote[0];
  const timestamps = chart.chart.result[0].timestamp;
  const latestIdx = quotes.close.length - 1;
  const price = quotes.close[latestIdx] ?? 0;
  const newPrice = Number(price.toFixed(2));

  const meta = chart.chart.result[0].meta;

  const tick = {
    price: newPrice,
    volume: quotes.volume[latestIdx],
    ts: new Date(timestamps[latestIdx] * 1000).toISOString(),
    meta: meta,
  };

  return tick;
}

// Yahoo Finance helpers
const YAHOO_CHART = (symbol) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=7d`;

const YAHOO_INSIGHTS = (symbol) =>
  `https://query1.finance.yahoo.com/ws/insights/v1/finance/insights?symbol=${symbol}`;

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  let lastPrice = -1;
  console.log("New Connection to ws://localhost:4000");

  // Close WebSocket if token is invalid
  const token = new URL(`ws://placeholder${req.url}`).searchParams.get("token");
  if (!isValidToken(token)) {
    ws.send(
      JSON.stringify({ type: "error", error: "Invalid or missing token." })
    );
    ws.close();
    return;
  }

  let symbol = "^BSESN";
  let platform = "";
  let interval = 5000;
  let timer;

  ws.on("message", async (message) => {
    try {
      const {
        type,
        symbol: userSymbol,
        platform: userPlatform,
        interval: userInterval,
      } = JSON.parse(message);
      if (type === "config") {
        if (userSymbol) symbol = userSymbol;
        if (userInterval) {
          interval = Math.max(1000, Math.min(60000, Number(userInterval)));
        }
        if (userPlatform) {
          platform = userPlatform;
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              data: "You must provide a platform to fetch data from",
            })
          );
        }

        let chart = {};
        try {
          chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
        } catch (err) {
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send history
        try {
          let historyData = {};
          if (platform == "yfinance") {
            historyData = await fetchYFinanceHistory(symbol, chart);
          } else {
            historyData = null;
          }
          ws.send(JSON.stringify({ type: "history", data: historyData }));
        } catch (err) {
          // ws.send(JSON.stringify({ type: "history", data: null }));
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send insights
        try {
          let insightsRes = {};
          if (platform == "yfinance") {
            insightsRes = await fetchYFinanceInsights(symbol);
          } else {
            insightsRes = null;
          }
          ws.send(JSON.stringify({ type: "insights", data: insightsRes }));
        } catch (err) {
          // ws.send(JSON.stringify({ type: "insights", data: null }));
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send Chart Data
        try {
          await fetchChartData(symbol, chart);
        } catch (err) {
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Start streaming live ticks
        clearTimeout(timer);
        streamLive();
      }
    } catch (err) {
      ws.send(
        JSON.stringify({
          type: "error",
          error: "Invalid configuration message.",
        })
      );
      console.error("Error parsing message:", err);
    }
  });

  ws.on("pong", () => (ws.isAlive = true));

  async function streamLive() {
    try {
      tick = await fetchChartData(symbol);
      if (tick.price != lastPrice) {
        await saveMarketData(symbol, tick);
        ws.send(JSON.stringify({ type: "live", data: tick }));
        lastPrice = tick.price;
      } else {
        ws.send(JSON.stringify({ type: "live", data: null }));
      }
      timer = setTimeout(streamLive, interval);
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", error: err.message }));
      timer = setTimeout(streamLive, Math.min(interval * 2, 30000));
    }
  }

  ws.on("close", () => clearTimeout(timer));
});

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
