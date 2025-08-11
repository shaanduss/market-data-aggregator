"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MarketDataFetcher() {
  const [symbol, setSymbol] = useState("^BSESN");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Subscribe to WS on Click
  const startWebSocket = () => {
    setLoading(true);
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new window.WebSocket("ws://localhost:4000");
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ symbol }));
    };
    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
      setLoading(false);
    };
    ws.onerror = () => {
      alert("WebSocket error");
      setLoading(false);
    };
  };

  // Component Unmount handling
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-x-7">
        <Input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border rounded p-2 mb-2"
          placeholder="Enter stock symbol (e.g. MSFT)"
        />
        <Button onClick={startWebSocket} disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      {data && (
        <div className="mt-4">
          <h3>
            {data.shortName} ({data.symbol})
          </h3>
          <p>Price: {data.regularMarketPrice}</p>
          <p>
            Change: {data.regularMarketChange} (
            {data.regularMarketChangePercent}%)
          </p>
        </div>
      )}
    </div>
  );
}
