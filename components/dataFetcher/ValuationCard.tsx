import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { TrendingUpDown } from "lucide-react";

interface ValuationCardProps {
  data: any;
}

const cardData = (data: any) => {
  const targetPrice = data.recommendation.targetPrice
  const targetPriceStr = targetPrice ? ("$" + targetPrice) : "N/A"
  return {
    title: "Valuation",
    titleValue: data.instrumentInfo.valuation.description ?? "...",
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: targetPriceStr,
      },
      {
        label: "Rating",
        value: data.recommendation.rating ?? "N/A",
      },
      {
        label: "Provider",
        value: data.recommendation.provider ?? "N/A",
      },
    ],
  } as FinancialCardProps;
};

export const ValuationCard: React.FC<ValuationCardProps> = ({ data }) => {
  return (
    <FinancialCard {...cardData(data)} />
  );
};
