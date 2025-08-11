const WebSocket = require("ws");
const yahooFinance = require("yahoo-finance2").default;

// Create our WebSocket
const wss = new WebSocket.Server({ port: 4000 });

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    const { symbol } = JSON.parse(message);

    async function sendQuote() {
      try {
        const quote = await yahooFinance.quote(symbol);
        ws.send(JSON.stringify(quote));
      } catch (error) {
        ws.send(JSON.stringify({ error: error.message }));
      }
    }

    // send data every 5 seconds
    sendQuote();
    const interval = setInterval(sendQuote, 5000);

    ws.on("close", () => clearInterval(interval));
  });
});

console.log("WebSocket server listening on ws://localhost:4000");
