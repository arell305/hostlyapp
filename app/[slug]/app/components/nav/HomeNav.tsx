import Logo from "@/components/shared/Logo";
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
    <nav className="flex bg-cardBackground border-b w-full px-3">
      <div className="w-full max-w-screen-xl flex items-center justify-between px-2 h-14 md:h-16 mx-auto">
        <div className="flex items-center space-x-3">
          <Logo />
          <Button
            variant="navGhost"
            className="justify-start"
            onClick={handleNavigateHome}
            size="nav"
          >
            {buttonText}
          </Button>
        </div>
        <UserButton />
      </div>
    </nav>
  );
};

export default HomeNav;
