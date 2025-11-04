"use client";

import { cn } from "@/shared/lib/utils";

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 md:gap-6 relative",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        const handleClick = () => {
          if (onStepClick) {
            onStepClick(stepNumber);
          }
        };

        return (
          <div
            key={step.label}
            className={cn(
              "flex flex-col items-center relative min-w-[72px] group"
            )}
            onClick={handleClick}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 z-10 transition-colors cursor-pointer",
                isCompleted &&
                  "bg-primaryBlue text-white border-greenCustom group-hover:brightness-110",
                isCurrent &&
                  "border-primaryBlue text-primaryBlue group-hover:brightness-110",
                !isCompleted &&
                  !isCurrent &&
                  "border-grayText text-white group-hover:border-white"
              )}
            >
              {stepNumber}
            </div>

            <div
              className={cn(
                "mt-1 text-xs text-center leading-tight min-h-[32px]",
                "text-white group-hover:text-white/90"
              )}
            >
              {step.label.split(" ").map((word, i) => (
                <div key={i}>{word}</div>
              ))}
            </div>

            {index < steps.length - 1 && (
              <div className="absolute top-4 right-[-30px] md:right-[-44px] w-12 md:w-16 h-px bg-gray-600 z-0" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
