const WebSocket = require("ws");
const fetch = require("node-fetch");
require("dotenv").config();

// Supabase Related Variables
const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const wss = new WebSocket.Server({ port: 4000 });
let lastPrice = -1;

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

// Yahoo Finance helpers
const YAHOO_CHART = (symbol) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=7d`;

const YAHOO_INSIGHTS = (symbol) =>
  `https://query1.finance.yahoo.com/ws/insights/v1/finance/insights?symbol=${symbol}`;

const YAHOO_QUOTE = (symbol) =>
  `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
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
  let interval = 5000;
  let timer;

  ws.on("message", async (message) => {
    try {
      const {
        type,
        symbol: userSymbol,
        interval: userInterval,
      } = JSON.parse(message);
      if (type === "config") {
        if (userSymbol) symbol = userSymbol;
        if (userInterval) {
          interval = Math.max(1000, Math.min(60000, Number(userInterval)));
        }

        // Send history
        try {
          const chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
          const timestamps = chart.chart.result[0].timestamp;
          const closes = chart.chart.result[0].indicators.quote[0].close;

          // Create Object to send as message
          const historyData = timestamps.map((t, idx) => ({
            time: new Date(t * 1000).toISOString(),
            price: closes[idx],
          }));

          ws.send(JSON.stringify({ type: "history", data: historyData }));
        } catch {
          ws.send(JSON.stringify({ type: "history", data: null }));
        }

        // Send insights
        try {
          const insightsRes = await retryFetch(
            YAHOO_INSIGHTS(symbol),
            {},
            3,
            1000
          );
          ws.send(JSON.stringify({ type: "insights", data: insightsRes }));
        } catch {
          ws.send(JSON.stringify({ type: "insights", data: null }));
        }

        // Fetch and send meta data
        try {
          const metaRes = await retryFetch(YAHOO_QUOTE(symbol), {}, 3, 1000);
          const meta = metaRes.quoteResponse.result[0];
          ws.send(JSON.stringify({ type: "meta", data: meta }));
        } catch (err) {
          ws.send(JSON.stringify({ type: "meta", data: null, error: err.message }));
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
      const chart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
      const quotes = chart.chart.result[0].indicators.quote[0];
      const timestamps = chart.chart.result[0].timestamp;
      const latestIdx = quotes.close.length - 1;
      const newPrice = quotes.close[latestIdx];

      const tick = {
        price: newPrice,
        volume: quotes.volume[latestIdx],
        ts: new Date(timestamps[latestIdx] * 1000).toISOString(),
      };

      if (newPrice != lastPrice) {
        await saveMarketData(symbol, tick);
        ws.send(JSON.stringify({ type: "live", data: tick }));
        lastPrice = newPrice
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
