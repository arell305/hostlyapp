import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { PiNewspaper } from "react-icons/pi";

interface AdminUserButtonProps {}

const AdminUserButton: React.FC<AdminUserButtonProps> = ({}) => {
  const router = useRouter();
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          onClick={() => router.push("subscription")}
          label="Manage subscription"
          labelIcon={<PiNewspaper />}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default AdminUserButton;
