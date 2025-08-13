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
  const shortName = data.shortName ?? "N/A";
  const price = Number(data.regularMarketPrice).toLocaleString() ?? "N/A"
  const instrumentType = data.instrumentType ?? "N/A"
  const previousClose = Number(data.previousClose).toLocaleString() ?? "N/A"
  const volume = Number(data.regularMarketVolume).toLocaleString() ?? "N/A"

  return {
    title: shortName,
    titleValue: price,
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Instrument Type",
        value: instrumentType,
      },
      {
        label: "Prev. Close",
        value: previousClose,
      },
      {
        label: "Volume",
        value: volume,
      },
    ],
  } as FinancialCardProps;
};

const IndexData = (data: any) => {
  const shortName = data.shortName ?? "N/A";
  const price = Number(data.regularMarketPrice).toLocaleString() ?? "N/A"
  const instrumentType = data.instrumentType ?? "N/A"
  const previousClose = Number(data.previousClose).toLocaleString() ?? "N/A"
  const marketHigh = Number(data.regularMarketDayHigh).toLocaleString() ?? "N/A"

  return {
    title: shortName,
    titleValue: price,
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Instrument Type",
        value: instrumentType,
      },
      {
        label: "Prev. Close",
        value: previousClose,
      },
      {
        label: "Market High",
        value: marketHigh,
      },
    ],
  } as FinancialCardProps;
};

const cardData = (data: any) => {
  const instrumentType = data.instrumentType ?? "N/A"
  switch (instrumentType) {
    case "EQUITY":
      return EquityData(data);
    default:
      return IndexData(data);
  }
};

export const InfoCard: React.FC<InfoCardProps> = ({ data }) => {
  return <FinancialCard {...cardData(data)} />;
};
