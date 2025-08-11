import { TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

export function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    // label is whatever you set in XAxis dataKey ("time" here)
    const dateObj = new Date(label);
    // If label is already combined date+time, you can skip this parse
    const formattedDate = dateObj.toLocaleDateString();
    const formattedTime = dateObj.toLocaleTimeString();

    return (
      <div className="rounded-md border bg-background p-2 shadow-sm">
        <p className="font-semibold">{formattedDate}</p>
        <p className="text-xs text-muted-foreground mb-2">{formattedTime}</p>
        {/* Add spacing between data items */}
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex justify-between items-center gap-4" // <-- spacing between name and value
          >
            <span className="font-medium">{entry.name}</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
