import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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
          <TabsContent value="yfinance">yahoo</TabsContent>
          <TabsContent value="bloomberg">bbg lebron james</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
