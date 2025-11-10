import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primaryBlue text-whiteText hover:bg-primaryBlue/80",
        destructive:
          "bg-altRed text-destructive-foreground hover:bg-destructive/90",
        outline: "border  hover:bg-cardBackgroundHover",
        secondary: "text-whiteText hover:underline",
        ghost: "hover:bg-accent hover:text-accent-foreground font-semibold",
        link: "text-primary underline-offset-4 underline hover:opacity-80",
        navGhost:
          "text-whiteText font-semibold underline hover:text-whiteText/80 text-base p-0 h-auto",
        navDestructive:
          "text-red-600 hover:underline font-raleway text-base p-0 h-auto font-medium",
        sidebar:
          "bg-transparent justify-start gap-3 hover:bg-cardBackgroundHover",
        nav: "bg-cardBackgroundHover rounded-[20px] hover:bg-primaryBlue",
        secondaryAction:
          "bg-transparent border border-gray-600 hover:bg-primaryBlue/10",
        selection: "rounded-[20px] border font-normal",
        menu: "font-normal text-base gap-6 text-left justify-start w-full rounded-md hover:bg-cardBackgroundHover ",
        menuDestructive:
          "font-normal text-left text-base gap-6 justify-start w-full rounded-md text-destructive hover:bg-destructive/10 ",
      },
      size: {
        default:
          "h-12 md:h-9 text-lg md:text-base font-semibold px-4 py-2 rounded-[20px] w-full md:w-[200px] md:font-medium",
        sm: "md:h-9 md:px-8 rounded-[20px] h-11 px-10 text-base md:text-sm font-medium",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        tripleButtons: "w-[300px] h-10 px-4 py-2 rounded-[20px]",
        doubelButtons: "h-10 px-4 py-2 rounded-[20px] w-[200px]",
        nav: "text-base md:text-sm px-3 py-2 gap-1",
        navButton: "w-[90px] h-[42px] rounded-[12px] text-base font-medium",
        xs: "px-3 py-2 h-9 font-normal",
        datePreset: "h-12 px-4 py-4",
        sidebar:
          "h-12 w-full px-4 text-base md:text-sm font-medium rounded-[12px]",
        modal: "font-medium px-4 py-2 text-base rounded-[20px] w-full",
        heading: "text-base w-[100px] gap-0.5 h-10 rounded-md",
        // NEW: Menu size
        menu: "px-4 py-2.5 ",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "navGhost",
        size: "nav",
        className: "w-auto",
      },
    ],
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "relative")}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <span className="opacity-0">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
