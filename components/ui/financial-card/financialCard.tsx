import type { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import React from "react";

// Define type for our array of blocks
type sideBlocks = {
  label: string,
  value: string
}

// Define all props
export interface FinancialCardProps {
  title?: string,
  icon?: React.ReactNode,
  titleValue?: string,
  titleColor?: string,
  sideBlocks: sideBlocks[]
}

export const FinancialCard: FC<FinancialCardProps> = ({
  title,
  icon,
  titleValue,
  titleColor = "text-violet-700",
  sideBlocks
}) => {
  // Used for sideBlocks if there is no title.
  const soleStyling = "flex flex-col gap-y-3 w-full px-3"
  const groupStyling = "flex flex-col gap-y-3 w-full"
  return(
    <div className="flex items-start justify-center">
      <Card className="w-full xl:w-[500px]">
        <CardContent className="flex justify-between py-3 px-5 gap-x-6">
          {/* Render Title and Title Value if they exist */}
          {
            (title && titleValue) && (
                <div className="flex flex-col gap-y-3 w-[170px] h-parent flex-shrink-0 justify-center pl-1">
                  <Label className={"text-sm font-semibold"}>{icon}{title}</Label>
                  <p className={"text-xl font-semibold " + titleColor}>{titleValue}</p>
                </div>
            )
          }

          {/* Render side blocks */}
          <div className={(title && titleValue) ? groupStyling : soleStyling}>
            {(sideBlocks.map((block, index) => (
              <React.Fragment key={`financial_card_${block.label}_${index}`}>
                <div className="flex justify-between">
                  <Label className="text-gray-500">{block.label}</Label>
                  <p className="font-semibold text-sm">{block.value}</p>
                </div>
                {(index != sideBlocks.length-1) && <Separator/>}
              </React.Fragment>
            )))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}