import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-semibold inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-customDarkBlue text-white hover:bg-primary/90",
        destructive:
          "bg-altRed text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-customDarkBlue bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-white border border-customDarkBlue hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground font-semibold",
        link: "text-primary underline-offset-4 hover:underline",
        navGhost:
          "text-customDarkBlue font-semibold hover:underline font-raleway text-base",
      },
      size: {
        default:
          "h-12 md:h-10 text-lg font-semibold px-4 py-2 rounded-[20px] w-full md:w-[250px]",
        sm: "h-9 px-3",
        lg: "h-11 d px-8",
        icon: "h-10 w-10",
        tripleButtons: "w-[300px] h-10 px-4 py-2 rounded-[20px]",
        doubelButtons: "h-10 px-4 py-2 rounded-[20px] w-[200px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
