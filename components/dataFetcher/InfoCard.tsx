import { Label } from "@/components/ui/label";

interface InfoCardProps {
  data: any;
}

export const InfoCard: React.FC<InfoCardProps> = ({ data }) => {
  return (
    <div className="mt-4">
      <div className="flex gap-x-3">
      <h3>
        {data.shortName}
      </h3>
      <p>|</p>
      <p>{data.instrumentType}</p>
      </div>

      <div className="flex gap-x-2">
        <Label>Price:</Label>
        <Label>{data.price}</Label>
      </div>
    </div>
  );
};
