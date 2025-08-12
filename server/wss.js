const WebSocket = require("ws");
const yahooFinance = require("yahoo-finance2").default;

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

// WebSocket Server
const wss = new WebSocket.Server({ port: 4000 }, () => {
  console.log("WebSocket server is running on ws://localhost:4000");
});

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    const { symbol } = JSON.parse(message);
    let lastPrice = -1;

    // Send historical data
    try {
      const history = await getHistoricalPrices(symbol);
      ws.send(JSON.stringify({ type: "history", data: history }));
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", error: err.message }));
    }

    // Send live price updates every 5 seconds
    async function sendQuote() {
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
      } catch (error) {
        ws.send(JSON.stringify({ type: "error", error: error.message }));
      }
    }
    sendQuote();
    const interval = setInterval(sendQuote, 5000);
    ws.on("close", () => clearInterval(interval));
  });
});
