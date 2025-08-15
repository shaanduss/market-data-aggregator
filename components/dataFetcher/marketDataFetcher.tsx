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
import { OutlookCard } from "@/components/dataFetcher/OutlookCard";
import { ValuationCard } from "@/components/dataFetcher/ValuationCard";
import { toast } from "sonner";

interface MarketDataFetcherProps {
  platform: string;
}

export const MarketDataFetcher: React.FC<MarketDataFetcherProps> = ({
  platform,
}) => {
  const [symbol, setSymbol] = useState("^BSESN");
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [history, setHistory] = useState<{ time: string; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const startWebSocket = () => {
    setLoading(true);

    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket("ws://localhost:4000?token=shaantest");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: "config", symbol, platform, interval: 5000 })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "error") {
        setLoading(false);
        toast.error(msg.error || "Unknown error");
        ws.close(); // Close connection if token is invalid
        return;
      }

      if (msg.type === "history") {
        setHistory(msg.data);
        console.log("history: ", msg.data);
      } else if (msg.type === "live") {
        // When there are no price changes
        // WebSocket sends null data
        if (msg.data != null) {
          setData(msg.data);
          setHistory((h) => [
            ...h,
            { time: msg.data.ts, price: msg.data.price },
          ]);
        }
        console.log("data: ", msg.data);
        // Last WebSocket message is always of "live" type
        setLoading(false);
      } else if (msg.type === "insights") {
        setInsights(msg.data);
        console.log("insights: ", msg.data);
      }
    };

    ws.onerror = () => {
      toast.error("WebSocket error");
      setLoading(false);
    };
  };

  useEffect(() => () => wsRef.current?.close(), []);

  const chartConfig: ChartConfig = {
    price: {
      label: "Market Price",
    },
  };

  const chartData = history ? history.slice(-200) : history;

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
      {data && history && insights && (
        <div className="flex gap-x-3">
          {/* <InfoCard data={data.meta} /> */}
          {data.meta.instrumentType === "EQUITY" && insights && (
            <>
              <ValuationCard data={insights} />
              <OutlookCard data={insights} />
            </>
          )}
        </div>
      )}

      {/* Chart Section */}
      {chartData && chartData.length > 1 && (
        <div className="mt-10">
          <ChartContainer
            config={chartConfig}
            className="min-h-[240px] max-h-[700px] w-full px-5"
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
};
