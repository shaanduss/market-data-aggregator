import { MarketDataFetcher } from "@/components/dataFetcher/marketDataFetcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex justify-items items-center px-20 mt-10 w-full">
      <Tabs defaultValue="yfinance" className="w-full">
        <TabsList>
          <TabsTrigger value="yfinance" className="cursor-pointer">
            Yahoo Finance
          </TabsTrigger>
          <TabsTrigger value="alpha-vantage" className="cursor-pointer">
            Alpha Vantage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="yfinance">
          <MarketDataFetcher platform="yfinance" />
        </TabsContent>
        <TabsContent value="alpha-vantage">
          <MarketDataFetcher platform="alpha-vantage" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
