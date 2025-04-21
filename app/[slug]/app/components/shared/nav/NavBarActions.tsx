"use client";

import { useEffect, useState } from "react";
import { Plus, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import {
  canCheckInGuests,
  canCreateEvent,
} from "../../../../../../utils/permissions";

interface NavbarActionsProps {
  slug: string;
  orgRole: string;
}

const NavbarActions = ({ slug, orgRole }: NavbarActionsProps) => {
  const [showUserButton, setShowUserButton] = useState<boolean>(false);
  const router = useRouter();

  const hasCreateEventPermission = canCreateEvent(orgRole);
  const hasCheckInGuestsPermission = canCheckInGuests(orgRole);

  // Delay UserButton display to prevent layout shift
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUserButton(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center space-x-3">
      {hasCreateEventPermission && (
        <Button
          size="nav"
          variant="nav"
          className="pl-3 pr-4"
          onClick={() => router.push(`/${slug}/app/add-event`)}
        >
          <Plus size={24} />
          <p>Event</p>
        </Button>
      )}
      {hasCheckInGuestsPermission && (
        <Button size="nav" variant="nav" className="pl-3 pr-4">
          <ScanLine size={24} />
          <p>Check In</p>
        </Button>
      )}

      <div className="h-8 w-8">
        {showUserButton ? (
          <UserButton />
        ) : (
          <div className="h-full w-full rounded-full bg-gray-700 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default NavbarActions;
