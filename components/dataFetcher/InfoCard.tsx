import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { TrendingUpDown } from "lucide-react";

interface InfoCardProps {
  data: any;
}

function formatMarketCap(value: number): string {
  const units = ["", "K", "M", "B", "T", "P", "E"];
  let magnitude = 0;

  while (Math.abs(value) >= 1000 && magnitude < units.length - 1) {
    value /= 1000;
    magnitude++;
  }

  return `${value.toFixed(2)}${units[magnitude]}`;
}

const EquityData = (data: any) => {
  const marketCap = "$" + formatMarketCap(data.marketCap).toLocaleString()
  return {
    title: data.shortName,
    titleValue: data.price,
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Instrument Type",
        value: data.quoteType
      },
      {
        label: "Forward P/E",
        value: data.forwardPE.toFixed(3)
      },
      {
        label: "Market Capitalization",
        value: marketCap
      },
    ],
  } as FinancialCardProps;
};

const IndexData = (data: any) => {
  return {
    title: data.shortName,
    titleValue: data.price,
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Instrument Type",
        value: data.quoteType,
      },
      {
        label: "Market Open",
        value: Number(data.regularMarketOpen).toLocaleString(),
      },
      {
        label: "Market High",
        value: Number(data.regularMarketDayHigh).toLocaleString(),
      },
    ],
  } as FinancialCardProps;
};

const cardData = (data: any) => {
  switch (data.quoteType) {
    case "EQUITY":
      return EquityData(data);
    default:
      return IndexData(data);
  }
};

export const InfoCard: React.FC<InfoCardProps> = ({ data }) => {
  return (
    <div className="mt-4">
      <FinancialCard {...cardData(data)} />
    </div>
  );
};
