import { platforms } from "@/app/types";
import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { Calculator, Coins } from "lucide-react";

interface ValuationCardProps {
  data: any;
  platform: (typeof platforms)[number];
}

function formatMarketCap(value: number): string {
  if (!value) {
    return "N/A";
  }
  const units = ["", "K", "M", "B", "T", "P", "E"];
  let magnitude = 0;

  while (Math.abs(value) >= 1000 && magnitude < units.length - 1) {
    value /= 1000;
    magnitude++;
  }

  return `${value.toFixed(2)}${units[magnitude]}`;
}

const yFinanceCardData = (data: any) => {
  return {
    title: "Valuation",
    titleValue: data?.valuationDesc ?? "...",
    icon: <Coins className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: data?.targetPrice,
      },
      {
        label: "Rating",
        value: data?.rating,
      },
      {
        label: "Provider",
        value: data?.provider,
      },
    ],
  } as FinancialCardProps;
};

const alphaVantageCardData = (data: any) => {
  return {
    title: "PE Ratio",
    titleValue: data?.PERatio ?? "...",
    icon: <Calculator className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Target Price",
        value: "$" + data?.targetPrice,
      },
      {
        label: "EPS",
        value: "$" + data?.eps,
      },
      {
        label: "Dividend Yield",
        value: data?.dividendYield,
      },
    ],
  } as FinancialCardProps;
};

const finnhubCardData = (data: any) => {
  const logo = data?.logo ?? "";

  return {
    title: "Market Cap.",
    titleValue: formatMarketCap(data?.market_cap) ?? "...",
    icon: <Calculator className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Currency",
        value: data?.currency,
      },
      {
        label: "Outstanding Shares",
        value: data?.shareOutstanding?.toLocaleString(),
      },
      {
        label: "Logo",
        value: logo ? (
          <img src={logo} alt="Company logo" style={{ height: "24px" }} />
        ) : (
          "N/A"
        ),
      },
    ],
  } as FinancialCardProps;
};

const cardData = (data: any, platform: (typeof platforms)[number]) => {
  if (platform === "alpha-vantage") {
    return alphaVantageCardData(data);
  } else if (platform === "finnhub") {
    return finnhubCardData(data);
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
