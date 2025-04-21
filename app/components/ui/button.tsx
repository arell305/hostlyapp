import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primaryBlue text-white hover:bg-primaryBlue/80",
        destructive:
          "bg-altRed text-destructive-foreground hover:bg-destructive/90",
        outline: "border  bg-cardBackground hover:bg-cardBackgroundHover ",
        secondary:
          "text-customDarkBlue bg-white border border-customDarkBlue hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground font-semibold",
        link: "text-primary underline-offset-4 hover:underline",
        navGhost:
          "text-customDarkBlue font-semibold hover:underline font-raleway text-base p-0 h-auto",
        navDestructive:
          "text-red-600 hover:underline font-raleway text-base p-0 h-auto font-medium",
        sidebar:
          "bg-transparent justify-start gap-3 hover:bg-cardBackgroundHover",
        nav: "bg-cardBackgroundHover rounded-[20px] hover:bg-primaryBlue",
      },
      size: {
        default:
          "h-12 md:h-9 text-lg md:text-base font-semibold px-4 py-2  rounded-[20px] w-full md:w-[200px] md:font-medium",
        sm: "md:h-9 md:px-8  rounded-[20px] h-11 px-10 text-base md:text-sm font-medium",
        lg: "h-11  px-8",
        icon: "h-10 w-10",
        tripleButtons: "w-[300px] h-10 px-4 py-2 rounded-[20px]",
        doubelButtons: "h-10 px-4 py-2 rounded-[20px] w-[200px]",
        nav: "text-base md:text-sm px-3 py-2 gap-1",
        navButton: "w-[90px] h-[42px] rounded-[12px] text-base font-medium",
        xs: "md:text-xs px-3 py-2 h-9 font-medium",
        datePreset: "h-12 px-4 py-4",
        sidebar:
          "h-12 w-full px-4 text-base md:text-sm font-medium rounded-[12px]",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
