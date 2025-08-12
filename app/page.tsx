import MarketDataFetcher from "@/components/dataFetcher/marketDataFetcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex justify-items items-center px-20 mt-10">
      <div>
        <Tabs defaultValue="yfinance">
          <TabsList>
            <TabsTrigger value="yfinance" className="cursor-pointer">
              Yahoo Finance
            </TabsTrigger>
            <TabsTrigger value="polygon" className="cursor-pointer">
              Polygon.IO
            </TabsTrigger>
          </TabsList>
          <TabsContent value="yfinance">
            <MarketDataFetcher />
          </TabsContent>
          <TabsContent value="polygon"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
