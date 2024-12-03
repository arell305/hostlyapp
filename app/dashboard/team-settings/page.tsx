"use client";

import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import OrganizationNameEditor from "./OrganizationNameEditor";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import OrgPromoCode from "./OrgPromoCode";
import { useEffect, useState } from "react";

const TeamSettings = () => {
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();
  const { toast } = useToast();
  const updateOrganization = useAction(api.clerk.updateOrganization);
  const createOrganization = useAction(api.clerk.createOrganization);
  const { isLoaded: orgIsLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const [loading, setIsLoading] = useState<boolean>(false);
  const [orgName, setOrgName] = useState(organization ? organization.name : "");
  console.log("org", organization);
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
    }
  }, [organization]);

  const handleSave = async (newName: string) => {
    setIsLoading(true);
    try {
      if (organization && orgIsLoaded) {
        await updateOrganization({
          clerkOrganizationId: organization.id,
          name: newName,
        });
        setOrgName(newName);
        toast({
          title: "Team Name Updated",
          description: "The team name has been successfully updated",
        });
        await setActive({ organization: organization.id });
      } else {
        if (user) {
          const orgId = await createOrganization({
            name: newName,
            clerkUserId: user.id,
            email: user.emailAddresses[0].emailAddress,
          });
          if (orgId && orgIsLoaded) {
            await setActive({ organization: orgId });
            setOrgName(newName);
          }
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="mb-2">Team Settings</h1>
      <OrganizationNameEditor
        initialName={orgName}
        onUpdate={handleSave}
        firstTimeOnOrg={organization === undefined}
      />
      {organization && <OrgPromoCode />}
    </div>
  );
};

export default TeamSettings;
