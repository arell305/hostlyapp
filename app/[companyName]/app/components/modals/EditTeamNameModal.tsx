import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TeamNameModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdateTeamName: () => void;
  setTeamNameError: (error: string | null) => void;
  setTeamName: (name: string) => void;
  teamName: string;
  onClose: () => void;
}

const TeamNameModal: React.FC<TeamNameModalProps> = ({
  isOpen,
  onOpenChange,
  error,
  isLoading,
  onUpdateTeamName,
  setTeamNameError,
  setTeamName,
  teamName,
  onClose,
}) => {
  // const [teamName, setTeamName] = useState<string | undefined>(
  //   organization?.name
  // );
  // const [nameError, setNameError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const { toast } = useToast();
  // const createOrganization = useAction(api.clerk.createOrganization);
  // const updateOrganization = useAction(api.clerk.updateOrganization);
  // const existingOrganizations = useQuery(api.organizations.getAllOrganizations);
  // const { isLoaded: orgIsLoaded, setActive } = useOrganizationList({
  //   userMemberships: true,
  // });

  // const handleSave = async () => {
  //   setNameError(null);

  //   if (!teamName || teamName.trim() === "") {
  //     setNameError("Name cannot be empty.");
  //     return;
  //   }
  //   if (!user) {
  //     setNameError("User Not Found. Please try again.");
  //     return;
  //   }

  //   if (organization?.name === teamName) {
  //     return onClose();
  //   }
  //   const isDuplicate = existingOrganizations?.some(
  //     (org) => org.name.toLowerCase() === teamName.toLowerCase()
  //   );
  //   if (isDuplicate) {
  //     setNameError(
  //       "This organization name already exists. Please choose another."
  //     );
  //     return;
  //   }
  //   setIsLoading(true);

  //   try {
  //     // create organization if it doesn't exist
  //     if (!organization) {
  //       const orgId = await createOrganization({
  //         name: teamName,
  //         clerkUserId: user.id,
  //         email: user.emailAddresses[0].emailAddress,
  //       });
  //       if (orgId && orgIsLoaded) {
  //         await setActive({ organization: orgId });
  //       }
  //     } else {
  //       // update organiation name
  //       await updateOrganization({
  //         clerkOrganizationId: organization.id,
  //         name: teamName,
  //       });
  //       if (setActive) {
  //         await setActive({ organization: organization.id });
  //       }
  //     }
  //     toast({
  //       title: "Success",
  //       description: "Team name set.",
  //     });
  //     onClose();
  //   } catch (error) {
  //     console.error("Failed to update team name", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to Update Team Name.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Team Name</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter name"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            setTeamNameError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
        <p
          className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>{" "}
        <div className="flex justify-center space-x-10 mt-4">
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
            onClick={onUpdateTeamName}
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
