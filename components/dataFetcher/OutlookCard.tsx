import { platforms } from "@/app/types";
import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Factory } from "lucide-react";

interface OutlookCardProps {
  data: any;
  platform: (typeof platforms)[number];
}

const yFinanceCardData = (data: any) => {
  return {
    title: "Sector",
    titleValue: data.sectorInfo,
    icon: <Factory className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Short-Term Events",
        value: data.shortTerm,
      },
      {
        label: "Mid-Term Events",
        value: data.midTerm,
      },
      {
        label: "Long-Term Score",
        value: data.longTerm,
      },
    ],
  } as FinancialCardProps;
};


const cardData = (data: any, platform: typeof platforms[number]) => {
  return yFinanceCardData(data)
}

export const OutlookCard: React.FC<OutlookCardProps> = ({ data, platform }) => {
  return <FinancialCard {...cardData(data, platform)} />;
};
