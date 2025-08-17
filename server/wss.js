// Load .env
require("dotenv").config();
// Fetch Yahoo Finance Helpers
const {
  fetchYFinanceHistory,
  fetchYFinanceInsights,
  fetchYFinanceMeta,
  fetchYFinanceChartData,
} = require("./yfinance.js");

const {
  fetchAlphaVantageInsights,
  fetchAlphaVantageMeta,
  ALPHAVANTAGE_OVERVIEW,
} = require("./alpha-vantage.js");

const { retryFetch, YAHOO_CHART } = require("./helpers.js");

const WebSocket = require("ws");

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

// Save to Supabase DB
async function saveMarketData(symbol, data) {
  await supabase.from("market_ticks").insert([{ symbol, ...data }]);
}

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

  // Variables needed for WS to work
  let symbol = "";
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
        // Handle config on initial connection
        if (userSymbol && userPlatform) {
          symbol = userSymbol;
          platform = userPlatform;
        } else {
          ws.send(
            JSON.stringify({
              type: "error",
              data: "You must provide a platform and symbol to fetch data from/for",
            })
          );
        }

        if (userInterval) {
          interval = Math.max(1000, Math.min(60000, Number(userInterval)));
        }

        let yFinanceChart = {};
        let alphaVantageOverview = {};
        try {
          if (platform == "yfinance") {
            yFinanceChart = await retryFetch(YAHOO_CHART(symbol), {}, 3, 1000);
          } else if (platform == "alpha-vantage") {
            alphaVantageOverview = await retryFetch(
              ALPHAVANTAGE_OVERVIEW(symbol),
              {},
              3,
              1000
            );
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send history
        try {
          const historyData = await fetchYFinanceHistory(symbol);
          ws.send(JSON.stringify({ type: "history", data: historyData }));
        } catch (err) {
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send insights
        try {
          let insightsRes = {};
          if (platform == "yfinance") {
            insightsRes = await fetchYFinanceInsights(symbol);
          } else if (platform == "alpha-vantage") {
            insightsRes = await fetchAlphaVantageInsights(symbol, alphaVantageOverview);
          }
          ws.send(JSON.stringify({ type: "insights", data: insightsRes }));
        } catch (err) {
          ws.send(JSON.stringify({ type: "error", error: err.message }));
        }

        // Send Meta Data
        try {
          let metaRes = {};
          if (platform == "yfinance") {
            metaRes = await fetchYFinanceMeta(symbol, yFinanceChart);
          } else if (platform == "alpha-vantage") {
            metaRes = await fetchAlphaVantageMeta(symbol, alphaVantageOverview);
          }
          ws.send(JSON.stringify({ type: "meta", data: metaRes }));
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
      tick = await fetchYFinanceChartData(symbol);

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
