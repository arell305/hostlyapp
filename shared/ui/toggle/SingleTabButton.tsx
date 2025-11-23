// SingleTabButton.tsx
import { Label } from "@/shared/ui/primitive/label";
import { ChevronDown } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/shared/lib/utils"; // assuming you have a cn() utility

interface SingleTabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  buttonLabel?: string;
  isActive?: boolean;
  className?: string;
  /** Optional: if you want to use asChild from parent (recommended) */
  asChild?: boolean;
}

const SingleTabButton = forwardRef<HTMLButtonElement, SingleTabButtonProps>(
  (
    {
      label,
      buttonLabel = "More",
      onClick,
      isActive = false,
      className = "",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <div className="space-y-2">
        {label && <Label className="block text-sm font-medium">{label}</Label>}

        <div
          className={cn(
            "inline-flex gap-2 rounded-lg border border-borderGray p-1",
            className
          )}
        >
          <Comp
            ref={ref}
            type={asChild ? undefined : "button"}
            onClick={onClick}
            aria-label={buttonLabel}
            className={cn(
              "flex items-center gap-1 rounded-md px-4 py-1 text-sm font-medium transition",
              isActive
                ? "bg-cardBackgroundHover text-whiteText"
                : "text-grayText hover:bg-cardBackgroundHover/70 hover:text-whiteText",
              // Radix adds these states – make sure they look good
              "data-[state=open]:bg-cardBackgroundHover data-[state=open]:text-whiteText"
            )}
            {...props}
          >
            {buttonLabel}
            <ChevronDown
              size={16}
              className="transition-transform data-[state=open]:rotate-180"
            />
          </Comp>
        </div>
      </div>
    );
  }
);

SingleTabButton.displayName = "SingleTabButton";

export default SingleTabButton;
