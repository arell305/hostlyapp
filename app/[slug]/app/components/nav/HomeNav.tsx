import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";

interface HomeNavProps {
  user: UserResource | null;
  handleNavigateHome: () => void;
  buttonText?: string;
}

const HomeNav: React.FC<HomeNavProps> = ({
  user,
  handleNavigateHome,
  buttonText = "Home",
}) => {
  if (!user) return null;

  return (
    <nav className="flex justify-between items-center w-full px-2 py-2">
      <Button
        variant="navGhost"
        className="justify-start"
        onClick={handleNavigateHome}
      >
        {buttonText}
      </Button>
      <UserButton />
    </nav>
  );
};

export default HomeNav;
