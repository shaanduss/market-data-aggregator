"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MarketDataFetcher() {
  const [symbol, setSymbol] = useState("AAPL");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketData?symbol=${symbol}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert("Error fetching data");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="border rounded p-2 mb-2"
        placeholder="Enter stock symbol (e.g. MSFT)"
      />
      <Button onClick={fetchData} disabled={loading}>
        {loading ? "Loading..." : "Fetch"}
      </Button>

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
          {/* Add more data fields as needed */}
        </div>
      )}
    </div>
  );
}
