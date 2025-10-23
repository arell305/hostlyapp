import { Badge } from "@shared/ui/primitive/badge";
import { PricingOption } from "@shared/types/types";
import { truncatedToTwoDecimalPlaces } from "@shared/utils/helpers";

interface PlanSelectorProps {
  options: PricingOption[];
  selectedPlan: PricingOption | null;
  onSelect: (option: PricingOption) => void;
  discount?: number;
  label?: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  options,
  selectedPlan,
  onSelect,
  discount = 0,
  label = "Select Your Plan",
}) => {
  return (
    <div className="mb-8">
      <p className="font-medium">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ">
        {options.map((option) => {
          const discountedPrice = truncatedToTwoDecimalPlaces(
            Number(option.price) * (1 - discount / 100)
          );
          const isSelected = selectedPlan?.id === option.id;

          return (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-cardBackgroundHover ${
                isSelected ? "border-primaryBlue " : ""
              }`}
              onClick={() => onSelect(option)}
            >
              <h3 className="text-xl font-semibold">{option.tier}</h3>
              <Badge>{option.isFree ? "Free Trial" : "Full Access"}</Badge>
              <p className="mt-2">
                {discount > 0 ? (
                  <>
                    <span className="line-through">${option.price}</span>{" "}
                    <span className="font-semibold">${discountedPrice}</span>
                  </>
                ) : (
                  `$${option.price}/month`
                )}
              </p>
              <p className="text-sm text-grayText">{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelector;
