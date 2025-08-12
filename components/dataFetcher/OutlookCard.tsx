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
    titleValue: data.instrumentInfo.technicalEvents.shortTermOutlook.direction ?? "N/A",
    icon: <TrendingUpDown className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Short Term Score",
        value: data.instrumentInfo.technicalEvents.shortTermOutlook.score ?? "N/A",
      },
      {
        label: "Long Term Outlook",
        value: data.instrumentInfo.technicalEvents.longTermOutlook.direction ?? "N/A",
      },
      {
        label: "Long Term Score",
        value: data.instrumentInfo.technicalEvents.longTermOutlook.score ?? "N/A",
      },
    ],
  } as FinancialCardProps;
};

export const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  return (
    <FinancialCard {...cardData(data)} />
  );
};
