const WebSocket = require("ws");
const yahooFinance = require("yahoo-finance2").default.suppressNotices(['yahooSurvey']);

async function getHistoricalPrices(symbol) {
  // Range for the last week
  const now = Math.floor(Date.now() / 1000);
  const lastWeek = now - 7 * 24 * 60 * 60;

  // Fetch Symbol's Historical Data
  const results = await yahooFinance.chart(symbol, {
    period1: lastWeek,
    period2: now,
    interval: "90m",
  });

  // Prepare array with { time, price } as ISO datetime + number
  return results.quotes
    .map((item) => ({
      time: new Date(item.date).toISOString(), // FULL ISO format, not just time
      price: item.close.toFixed(2),
    }))
    .filter((item) => item.price !== undefined && item.time !== undefined); // Filter out any null/undefined
}

async function getInsights(symbol) {
  const queryOptions = { lang: "en-US", reportsCount: 2, region: "US" };
  const result = await yahooFinance.insights(symbol, queryOptions);
  return result;
}

async function sendQuote(symbol, ws, lastPrice) {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (quote.regularMarketPrice != lastPrice) {
      lastPrice = quote.regularMarketPrice;
      ws.send(
        JSON.stringify({
          type: "live",
          data: {
            time: new Date().toISOString(), // Always ISO format!
            price: quote.regularMarketPrice,
            ...quote,
          },
        })
      );
    }
    return quote.regularMarketPrice;
  } catch (error) {
    ws.send(JSON.stringify({ type: "error", error: error.message }));
    return -1;
  }
}

// WebSocket Server
const wss = new WebSocket.Server({ port: 4000 }, () => {
  console.log("WebSocket server is running on ws://localhost:4000");
});

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    const { symbol } = JSON.parse(message);
    let lastPrice = -1;

    // Send live price updates every 5 seconds
    const price = await sendQuote(symbol, ws, lastPrice);
    if (price != -1 && price != lastPrice) {
      lastPrice = price;
    }
    const interval = setInterval(() => sendQuote(symbol, ws, lastPrice), 5000);

    // Send historical data
    try {
      const history = await getHistoricalPrices(symbol);
      ws.send(JSON.stringify({ type: "history", data: history }));
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", error: err.message }));
    }

    try {
      const insights = await getInsights(symbol);
      console.log(insights);
      ws.send(JSON.stringify({ type: "insights", data: insights }));
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", error: err.message }));
    }

    ws.on("close", () => clearInterval(interval));
  });
});
