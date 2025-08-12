import {
  FinancialCard,
  FinancialCardProps,
} from "@/components/ui/financial-card/financialCard";
import { TrendingUpDown } from "lucide-react";

interface OutlookCardProps {
  data: any;
}

const cardData = (data: any) => {
  return {
    title: "Short Term Outlook",
    titleValue: data.instrumentInfo.technicalEvents.shortTermOutlook.direction ?? "...",
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Short Term Score",
        value: data.instrumentInfo.technicalEvents.shortTermOutlook.score ?? "...",
      },
      {
        label: "Long Term Outlook",
        value: data.instrumentInfo.technicalEvents.longTermOutlook.direction ?? "...",
      },
      {
        label: "Long Term Score",
        value: data.instrumentInfo.technicalEvents.longTermOutlook.score ?? "...",
      },
    ],
  } as FinancialCardProps;
};

export const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  return (
    <FinancialCard {...cardData(data)} />
  );
};
