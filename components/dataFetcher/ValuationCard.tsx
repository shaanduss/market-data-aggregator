import { platforms } from "@/app/types";
import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Coins } from "lucide-react";

interface ValuationCardProps {
  data: any;
  platform: (typeof platforms)[number];
}

const yFinanceCardData = (data: any) => {
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

const alphaVantageCardData = (data: any) => {
  return {
    title: "PE Ratio",
    titleValue: data.PERatio ?? "...",
    icon: <Coins className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: "$" + data.targetPrice,
      },
      {
        label: "EPS",
        value: "$" + data.eps,
      },
      {
        label: "Dividend Yield",
        value: data.dividendYield,
      },
    ],
  } as FinancialCardProps;
};

const cardData = (data: any, platform: (typeof platforms)[number]) => {
  if (platform === "alpha-vantage") {
    return alphaVantageCardData(data);
  } else {
    return yFinanceCardData(data);
  }
};

export const ValuationCard: React.FC<ValuationCardProps> = ({
  data,
  platform,
}) => {
  return <FinancialCard {...cardData(data, platform)} />;
};
