import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Coins } from "lucide-react";

interface ValuationCardProps {
  data: any;
}

const cardData = (data: any) => {

  return {
    title: "Valuation",
    titleValue: data.valuationDesc ?? "...",
    icon: <Coins className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: data.targetPrice,
      },
      {
        label: "Rating",
        value: data.rating,
      },
      {
        label: "Provider",
        value: data.provider,
      },
    ],
  } as FinancialCardProps;
};

export const ValuationCard: React.FC<ValuationCardProps> = ({ data }) => {
  return <FinancialCard {...cardData(data)} />;
};
