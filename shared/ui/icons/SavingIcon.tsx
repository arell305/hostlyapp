import { Loader2, Save } from "lucide-react";

interface SavingIconProps {
  isSaving: boolean;
  size?: number;
}

const SavingIcon: React.FC<SavingIconProps> = ({ isSaving, size = 20 }) => {
  return isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Save size={size} />
  );
};

export default SavingIcon;
