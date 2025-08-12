"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CustomTooltip } from "@/components/customTooltip";
import { InfoCard } from "@/components/dataFetcher/InfoCard";

export default function MarketDataFetcher() {
  const [symbol, setSymbol] = useState("^BSESN");
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<{ time: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const startWebSocket = () => {
    setLoading(true);
    if (wsRef.current) wsRef.current.close();
    const ws = new window.WebSocket("ws://localhost:4000");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ symbol }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "history") {
        setHistory(msg.data);
        setLoading(false);
      } else if (msg.type === "live") {
        setData(msg.data);

        setHistory((h) => [
          ...h,
          {
            time: new Date().toISOString(),
            price: msg.data.price,
          },
        ]);
      } else if (msg.type === "error") {
        setLoading(false);
      }
    };

    ws.onerror = () => {
      alert("WebSocket error");
      setLoading(false);
    };
  };

  useEffect(() => () => wsRef.current?.close(), []);

  const chartConfig: ChartConfig = {
    price: {
      label: "Market Price",
    },
  };

  const chartData = history.slice(-200);

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">STOCK SEARCH</h1>
      <div className="flex gap-x-7 mt-2">
        <Input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border rounded p-2 mb-2"
          placeholder="Enter stock symbol (e.g. MSFT)"
        />
        <Button
          onClick={startWebSocket}
          disabled={loading}
          className="cursor-pointer"
        >
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {/* Title Section */}
      {data && <InfoCard data={data} />}

      {/* Chart Section */}
      {chartData.length > 1 && (
        <div className="mt-8">
          <ChartContainer
            config={chartConfig}
            className="min-h-[240px] max-h-[400px] w-full"
          >
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => {
                  const dateObj = new Date(value);
                  return dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
              />
              <YAxis domain={["auto", "auto"]} />
              <ChartTooltip content={<CustomTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
