import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean; // Add an error prop
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border-2 bg-transparent px-3 py-2 placeholder:text-grayText disabled:cursor-not-allowed disabled:opacity-50",
          "border-2",
          error ? "border-red-500" : "",
          "focus:border-customDarkBlue",
          className
        )}
        style={{
          outline: "none",
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
