import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaUserGroup } from "react-icons/fa6";

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
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          onClick={() => router.push("subscription")}
          label="Manage subscription"
          labelIcon={<PiNewspaper />}
        ></UserButton.Action>{" "}
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default AdminUserButton;
