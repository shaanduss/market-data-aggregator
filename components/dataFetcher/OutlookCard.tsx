import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Factory } from "lucide-react";

interface OutlookCardProps {
  data: any;
}

const cardData = (data: any) => {
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

export const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  return <FinancialCard {...cardData(data)} />;
};
