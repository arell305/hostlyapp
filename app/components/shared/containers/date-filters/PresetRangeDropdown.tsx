"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronDown } from "lucide-react";
import { PRESET_OPTIONS, PresetOption } from "@/types/constants";
import useMediaQuery from "@/hooks/useMediaQuery";

interface PresetRangeDropdownProps {
  value: PresetOption;
  onChange: (value: PresetOption) => void;
}

const PresetRangeDropdown: React.FC<PresetRangeDropdownProps> = ({
  value,
  onChange,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = React.useState(false);

  if (isMobile) {
    return (
      <>
        <Button size="xs" variant="outline" onClick={() => setOpen(true)}>
          {value} <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select Date Range</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-3 mb-8">
              {PRESET_OPTIONS.map((preset) => (
                <Button
                  key={preset}
                  variant={preset === value ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    onChange(preset);
                    setOpen(false);
                  }}
                  size="datePreset"
                >
                  {preset}
                </Button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="xs">
          {value} <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PRESET_OPTIONS.map((preset) => (
          <DropdownMenuItem
            key={preset}
            onClick={() => onChange(preset)}
            className="cursor-pointer text-xs"
          >
            {preset}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PresetRangeDropdown;
