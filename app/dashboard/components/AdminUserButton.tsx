import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaUserGroup } from "react-icons/fa6";
import SubscriptionTab from "./settings/SubscriptionTab";
import { PiNewspaper } from "react-icons/pi";

interface AdminUserButtonProps {
  onEditSubscription: () => void;
}

const DotIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
    >
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};

const AdminUserButton: React.FC<AdminUserButtonProps> = ({
  onEditSubscription,
}) => {
  const router = useRouter();

  const handleTeamClick = () => {
    router.push("/team");
  };

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label={"Manage Team"}
          labelIcon={<FaUserGroup />}
          onClick={handleTeamClick}
        />
      </UserButton.MenuItems>
      <UserButton.UserProfilePage
        label="Subscription"
        url="subscription"
        labelIcon={<PiNewspaper />}
      >
        <SubscriptionTab />
      </UserButton.UserProfilePage>
    </UserButton>
  );
};

export default AdminUserButton;
