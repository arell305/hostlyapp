"use client";
import { useState, useEffect, useRef } from "react";
import DashboardMobileSidebar from "./components/DashboardMobileSidebar";
import DashboardDesktopSidebar from "./components/DashboardDesktopSidebar";
import FullLoading from "./components/loading/FullLoading";
import DashboardNavbar from "./components/DashboardNavbar";
import { Protect, useAuth } from "@clerk/nextjs";
import { ClerkPermissions } from "../../../utils/enum";
import TicketScannerFAB from "./components/ui/TicketScannerFAB";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

const Home: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { has } = useAuth();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    }
  };

  // Close sidebar when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const simulateLoading = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);

      if (!mobileView && isOpen) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(simulateLoading);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (isLoading || !has) {
    return <FullLoading />;
  }

  return (
    <div className="relative flex flex-col w-full">
      <DashboardNavbar toggleNavbar={toggleSidebar} isOpen={isOpen} />
      <div className="md:flex mt-[50px] overflow-hidden">
        {/* Sidebar */}
        <div ref={sidebarRef}>
          {isMobile ? (
            <DashboardMobileSidebar
              isOpen={isOpen}
              toggleSidebar={toggleSidebar}
            />
          ) : (
            <DashboardDesktopSidebar />
          )}
        </div>

        {/* Main content */}
        <OrganizationProvider>
          <div
            className={`min-h-screen relative flex-grow ${!isMobile ? "ml-[250px]" : ""}`}
          >
            <div>
              {children}
              <Protect
                condition={(has) =>
                  has({ permission: ClerkPermissions.CHECK_GUESTS })
                }
              >
                <TicketScannerFAB />
              </Protect>
            </div>
          </div>
        </OrganizationProvider>
      </div>
    </div>
  );
};

export default Home;
