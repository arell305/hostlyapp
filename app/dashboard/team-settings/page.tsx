"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import OrganizationNameEditor from "./OrganizationNameEditor";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import OrgPromoCode from "./OrgPromoCode";

const TeamSettings = () => {
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();
  const { toast } = useToast();
  const updateOrganization = useAction(api.clerk.updateOrganization);
  const createOrganization = useAction(api.clerk.createOrganization);

  const handleSave = async (newName: string) => {
    try {
      if (organization) {
        await updateOrganization({
          clerkOrganizationId: organization.id,
          name: newName,
        });
        toast({
          title: "Team Name Updated",
          description: "The team name has been successfully updated",
        });
      } else {
        if (user) {
          await createOrganization({ name: newName, clerkUserId: user.id });
          toast({
            title: "Team Created",
            description: "The team name has been successfully created",
          });
        }
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      toast({
        title: "Error",
        description: "Failed to save team. Please try again",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="mb-2">Team Settings</h2>
      <OrganizationNameEditor
        initialName={organization ? organization.name : ""}
        onUpdate={handleSave}
      />
      {organization && <OrgPromoCode />}
    </div>
  );
};

export default TeamSettings;
