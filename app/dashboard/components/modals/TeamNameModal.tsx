import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useOrganizationList } from "@clerk/nextjs";
import { UserResource, OrganizationResource } from "@clerk/types";

interface TeamNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserResource | null;
  organization?: OrganizationResource | null;
}

const TeamNameModal: React.FC<TeamNameModalProps> = ({
  isOpen,
  onClose,
  user,
  organization,
}) => {
  const [teamName, setTeamName] = useState<string | undefined>(
    organization?.name
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const createOrganization = useAction(api.clerk.createOrganization);
  const updateOrganization = useAction(api.clerk.updateOrganization);
  const existingOrganizations = useQuery(api.organizations.getAllOrganizations);
  const { isLoaded: orgIsLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });

  const handleSave = async () => {
    setNameError(null);

    if (!teamName || teamName.trim() === "") {
      setNameError("Name cannot be empty.");
      return;
    }
    if (!user) {
      setNameError("User Not Found. Please try again.");
      return;
    }

    if (organization?.name === teamName) {
      return onClose();
    }
    const isDuplicate = existingOrganizations?.some(
      (org) => org.name.toLowerCase() === teamName.toLowerCase()
    );
    if (isDuplicate) {
      setNameError(
        "This organization name already exists. Please choose another."
      );
      return;
    }
    setIsLoading(true);

    try {
      // create organization if it doesn't exist
      if (!organization) {
        const orgId = await createOrganization({
          name: teamName,
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
        });
        if (orgId && orgIsLoaded) {
          await setActive({ organization: orgId });
        }
      } else {
        // update organiation name
        await updateOrganization({
          clerkOrganizationId: organization.id,
          name: teamName,
        });
        if (setActive) {
          await setActive({ organization: organization.id });
        }
      }
      toast({
        title: "Success",
        description: "Team name set.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update team name", error);
      toast({
        title: "Error",
        description: "Failed to Update Team Name.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Team Name</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          placeholder="Enter name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className={`w-full border-b-2 bg-transparent py-1 text-gray-800 focus:outline-none 
          ${nameError ? "border-red-500" : "border-gray-300"} 
          focus:border-customDarkBlue`}
        />

        {nameError && <p className="text-red-500">{nameError}</p>}
        <div className="flex justify-center space-x-10">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold  w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={handleSave}
            disabled={isLoading}
          >
            {" "}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNameModal;
