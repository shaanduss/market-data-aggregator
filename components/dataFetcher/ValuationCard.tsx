import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Coins } from "lucide-react";

interface ValuationCardProps {
  data: any;
}

const cardData = (data: any) => {
  const recommendation = data.instrumentInfo.recommendation ?? null;
  const targetPrice = recommendation ? recommendation.targetPrice : null;
  const targetPriceStr = targetPrice ? "$" + targetPrice : "N/A";
  const rating = recommendation ? recommendation.rating : null;
  const provider = recommendation ? recommendation.provider : null;
  const valuation = data.instrumentInfo.valuation ?? null;
  const valuationDesc = valuation ? valuation.description : null;

  return {
    title: "Valuation",
    titleValue: valuationDesc ?? "...",
    icon: <Coins className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: targetPriceStr,
      },
      {
        label: "Rating",
        value: rating ?? "N/A",
      },
      {
        label: "Provider",
        value: provider ?? "N/A",
      },
    ],
  } as FinancialCardProps;
};

export const ValuationCard: React.FC<ValuationCardProps> = ({ data }) => {
  return <FinancialCard {...cardData(data)} />;
};
