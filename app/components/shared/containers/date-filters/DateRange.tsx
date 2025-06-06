"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { getShortWeekdayFormatter } from "../../../../../utils/calendar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { capitalize } from "lodash";

interface DatePickerProps {
  type: "start" | "end";
  date: Date | null;
  onDateChange: (date: Date) => void;
  otherDate?: Date | null;
  className?: string;
}

export default function SingleDatePickerModal({
  type,
  date,
  onDateChange,
  otherDate,
  className,
}: DatePickerProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const title = type === "start" ? "Start Date" : "End Date";
  const minDate = type === "end" ? otherDate ?? undefined : undefined;
  const maxDate = type === "start" ? otherDate ?? undefined : undefined;

  const calendarUI = (
    <Calendar
      formatShortWeekday={getShortWeekdayFormatter(isMobile)}
      className="react-calendar bg-backgroundBlack text-whiteText rounded-md shadow-[0_0_0_2px_rgba(255,255,255,0.2)]"
      value={date}
      minDate={minDate}
      maxDate={maxDate}
      onChange={(val) => {
        onDateChange(val as Date);
        setModalOpen(false);
      }}
      tileClassName={({ date: d }) =>
        date?.toDateString() === d.toDateString()
          ? "bg-white text-black rounded-md"
          : ""
      }
      next2Label={null}
      prev2Label={null}
      showNeighboringMonth={false}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => setModalOpen(true)}
        variant="outline"
        size="xs"
        className={cn(
          "w-[140px] justify-start text-left font-normal",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "LLL dd, y") : <span>Select date</span>}
      </Button>

      {isMobile ? (
        <Drawer open={modalOpen} onOpenChange={setModalOpen}>
          <DrawerContent className="p-4 flex justify-center items-center mb-4">
            <DrawerHeader>
              <DrawerTitle className="py-4 ">
                Select {capitalize(type)} date
              </DrawerTitle>
              <DrawerDescription>
                Select the {capitalize(type)} date.
              </DrawerDescription>
            </DrawerHeader>
            {calendarUI}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="p-6 flex justify-center items-center">
            <DialogTitle className="py-2">
              Select {capitalize(type)} date
            </DialogTitle>
            <DialogDescription>
              Select the {capitalize(type)} date.{" "}
            </DialogDescription>
            {calendarUI}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
