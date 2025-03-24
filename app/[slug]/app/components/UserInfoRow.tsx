import { GoPencil } from "react-icons/go";

interface InfoRowProps {
  label: string;
  value: string;
  canEdit?: boolean;
  onEdit?: () => void;
  isClickable?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  canEdit = false,
  onEdit,
  isClickable = false,
}) => {
  return (
    <div
      onClick={isClickable ? onEdit : undefined}
      className={`px-4 flex justify-between border-b py-3 ${
        isClickable ? "hover:bg-gray-100 cursor-pointer" : ""
      }`}
    >
      <div>
        <h3 className="text-sm font-medium text-gray-500">{label}: </h3>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {canEdit && (
        <div className="flex items-center">
          <GoPencil className="text-2xl" />
        </div>
      )}
    </div>
  );
};

export default InfoRow;
