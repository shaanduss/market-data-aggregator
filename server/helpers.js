const fetch = require("node-fetch");
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

// Yahoo Finance helpers
const YAHOO_CHART = (symbol) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=7d`;

const YAHOO_INSIGHTS = (symbol) =>
  `https://query1.finance.yahoo.com/ws/insights/v1/finance/insights?symbol=${symbol}`;

module.exports = { retryFetch, YAHOO_CHART, YAHOO_INSIGHTS };
