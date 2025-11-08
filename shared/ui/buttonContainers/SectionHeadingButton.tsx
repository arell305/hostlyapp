import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";
import { Button } from "@/shared/ui/primitive/button";
import { cn } from "@/shared/lib/utils";
import IconButton from "./IconButton";

interface SectionHeadingButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ElementType; // Accepts the icon component itself
  className?: string;
  desktopIconSize?: number;
  mobileIconSize?: number;
  showMobileIcon?: boolean;
}

const SectionHeadingButton = ({
  onClick,
  label,
  icon: Icon,
  className,
  desktopIconSize = 18,
  mobileIconSize = 20,
  showMobileIcon = false,
}: SectionHeadingButtonProps) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  return isDesktop || !showMobileIcon ? (
    <Button size="heading" className={cn("gap-1", className)} onClick={onClick}>
      <Icon size={desktopIconSize} />
      <span>{label}</span>
    </Button>
  ) : (
    <IconButton
      icon={<Icon size={mobileIconSize} />}
      onClick={onClick}
      aria-label={label}
      variant="primary"
    />
  );
};

export default SectionHeadingButton;
