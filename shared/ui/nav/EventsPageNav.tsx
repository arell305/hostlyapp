import { Button } from "@shared/ui/primitive/button";
import { UserButton } from "@clerk/nextjs";

interface EventsPageNavProps {
  handleNavigateHome: () => void;
  buttonText?: string;
}

const EventsPageNav: React.FC<EventsPageNavProps> = ({
  handleNavigateHome,
  buttonText = "Back to Events",
}) => {
  return (
    <nav className="flex justify-between items-center w-full px-3 py-2">
      <Button
        size="nav"
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

export default EventsPageNav;
