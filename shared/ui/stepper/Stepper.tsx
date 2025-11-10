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
  disabledSteps?: number[];
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
  disabledSteps = [],
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
        const isDisabled = disabledSteps.includes(stepNumber);

        const handleClick = () => {
          if (onStepClick && !isDisabled) {
            onStepClick(stepNumber);
          }
        };

        return (
          <div
            key={step.label}
            className={cn(
              "flex flex-col items-center relative min-w-[72px] group",
              isDisabled && "cursor-not-allowed opacity-50"
            )}
            onClick={handleClick}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 z-10 transition-colors",
                isDisabled
                  ? "border-gray-500 text-gray-400 cursor-not-allowed"
                  : isCompleted
                    ? "bg-primaryBlue text-white border-greenCustom group-hover:brightness-110"
                    : isCurrent
                      ? "border-primaryBlue text-primaryBlue group-hover:brightness-110"
                      : "border-grayText text-white group-hover:border-white",
                !isDisabled && "cursor-pointer"
              )}
            >
              {stepNumber}
            </div>

            <div
              className={cn(
                "mt-1 text-xs text-center leading-tight min-h-[32px]",
                "text-white group-hover:text-white/90",
                isDisabled && "text-gray-400 group-hover:text-gray-400"
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
