"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/primitive/button";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import { TicketType } from "@shared/types/types";
import { ticketNameOptions } from "@shared/types/constants";
import { useEventForm } from "@/contexts/EventFormContext";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { Label } from "@/shared/ui/primitive/label";
import CurrencyInput from "@/shared/ui/fields/CurrencyInput";
import IntegerInput from "@/shared/ui/fields/IntegerInput";

interface TicketSectionProps {
  isEdit: boolean;
  initialTicketData?: TicketType[] | null;
}

const TicketSection: React.FC<TicketSectionProps> = ({
  isEdit,
  initialTicketData,
}) => {
  const { ticketTypes, setTicketTypes, isIOSDevice, errors } = useEventForm();

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [ticketIndexToRemove, setTicketIndexToRemove] = useState<number | null>(
    null
  );

  const handleConfirmRemove = () => {
    if (ticketIndexToRemove === null) return;
    setTicketTypes(ticketTypes.filter((_, i) => i !== ticketIndexToRemove));
    setShowConfirm(false);
    setTicketIndexToRemove(null);
  };

  return (
    <>
      {showConfirm && ticketIndexToRemove !== null && (
        <ResponsiveConfirm
          isOpen={showConfirm}
          title="Remove Ticket"
          content="Are you sure you want to remove this ticket option? This cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          confirmVariant="destructive"
          modalProps={{
            onClose: () => {
              setShowConfirm(false);
              setTicketIndexToRemove(null);
            },
            onConfirm: handleConfirmRemove,
          }}
          drawerProps={{
            onOpenChange: (open) => {
              setShowConfirm(open);
              if (!open) setTicketIndexToRemove(null);
            },
            onSubmit: handleConfirmRemove,
          }}
          error={null}
          isLoading={false}
        />
      )}

      {ticketTypes.map((type, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">
              Ticket Option #{index + 1}
            </div>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="text-red-500 text-base font-normal p-0 h-auto"
              onClick={() => {
                if (isEdit && initialTicketData?.length) {
                  setTicketIndexToRemove(index);
                  setShowConfirm(true);
                } else {
                  setTicketTypes(ticketTypes.filter((_, i) => i !== index));
                }
              }}
            >
              Remove
            </Button>
          </div>

          <div className="mb-4">
            <Label className="mb-1">Ticket Name*</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {ticketNameOptions.map((preset) => {
                const isUsed = ticketTypes.some(
                  (t, i) => t.name === preset && i !== index
                );

                return (
                  <Button
                    key={preset}
                    type="button"
                    variant={type.name === preset ? "default" : "outline"}
                    size="sm"
                    disabled={isUsed}
                    onClick={() => {
                      const newTypes = [...ticketTypes];
                      newTypes[index].name = preset;
                      newTypes[index].showCustomInput = false;
                      setTicketTypes(newTypes);
                    }}
                  >
                    {preset}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant={type.showCustomInput ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newTypes = [...ticketTypes];
                  newTypes[index].name = "";
                  newTypes[index].showCustomInput = true;
                  setTicketTypes(newTypes);
                }}
              >
                Custom
              </Button>
            </div>
          </div>

          {type.showCustomInput && (
            <LabeledInputField
              label="Custom Ticket Name*"
              name="ticketName"
              placeholder="Enter ticket name"
              value={type.name}
              onChange={(e) => {
                const newTypes = [...ticketTypes];
                newTypes[index].name = e.target.value;
                setTicketTypes(newTypes);
              }}
              error={errors.ticketFieldErrors?.[index]?.name}
            />
          )}
          <CurrencyInput
            name="ticketPrice"
            label="Ticket Price*"
            value={type.price ? parseFloat(type.price) : null}
            onChange={(val) => {
              const newTypes = [...ticketTypes];
              newTypes[index].price = val ? val.toString() : "";
              setTicketTypes(newTypes);
            }}
            error={errors.ticketFieldErrors?.[index]?.price}
          />

          <IntegerInput
            name="ticketCapacity"
            label="Ticket Capacity*"
            value={type.capacity ? parseInt(type.capacity) : null}
            onChange={(val) => {
              const newTypes = [...ticketTypes];
              newTypes[index].capacity = val ? val.toString() : "";
              setTicketTypes(newTypes);
            }}
            error={errors.ticketFieldErrors?.[index]?.capacity}
            placeholder="Enter ticket capacity"
          />

          <LabeledDateTimeField
            name="ticketSalesEndTime"
            label="Ticket Sales End Time*"
            value={type.ticketSalesEndTime}
            onChange={(val) => {
              const newTypes = [...ticketTypes];
              newTypes[index].ticketSalesEndTime = val;
              setTicketTypes(newTypes);
            }}
            error={errors.ticketFieldErrors?.[index]?.ticketSalesEndTime}
            isIOS={isIOSDevice}
          />
        </div>
      ))}

      <div className="flex justify-between items-center mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setTicketTypes([
              ...ticketTypes,
              {
                name: "",
                price: "",
                capacity: "",
                ticketSalesEndTime: null,
                showCustomInput: false,
              },
            ])
          }
        >
          + Add Ticket Type
        </Button>
      </div>
    </>
  );
};

export default TicketSection;
