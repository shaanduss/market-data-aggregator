import MarketDataFetcher from "@/components/marketDataFetcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex justify-items items-center px-20 mt-10">
      <div>
        <Tabs defaultValue="yfinance">
          <TabsList>
            <TabsTrigger value="yfinance" className="cursor-pointer">
              YFinance
            </TabsTrigger>
            <TabsTrigger value="bloomberg" className="cursor-pointer">
              Bloomberg
            </TabsTrigger>
          </TabsList>
          <TabsContent value="yfinance">
            <MarketDataFetcher />
          </TabsContent>
          <TabsContent value="bloomberg"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
