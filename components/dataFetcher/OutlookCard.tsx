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
    titleValue:
      data.companySnapshot.sectorInfo ?? "N/A",
    icon: <Factory className="h-4 w-4" />,
    sideBlocks: [
      {
        label: "Short-Term Events",
        value:
          data.instrumentInfo.technicalEvents.shortTerm.toUpperCase() ?? "N/A",
      },
      {
        label: "Mid-Term Events",
        value:
          data.instrumentInfo.technicalEvents.midTerm.toUpperCase() ??
          "N/A",
      },
      {
        label: "Long-Term Score",
        value:
          data.instrumentInfo.technicalEvents.midTerm.toUpperCase() ?? "N/A",
      },
    ],
  } as FinancialCardProps;
};

export const OutlookCard: React.FC<OutlookCardProps> = ({ data }) => {
  return <FinancialCard {...cardData(data)} />;
};
