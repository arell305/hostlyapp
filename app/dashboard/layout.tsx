"use client";
import { useState, useEffect, useRef } from "react";
import DashboardNavbar from "./components/DashboardNavbar";
import DashboardMobileSidebar from "./components/DashboardMobileSidebar";
import DashboardDesktopSidebar from "./components/DashboardDesktopSidebar";
import dynamic from "next/dynamic";

const DynamicDashboardNavbar = dynamic(
  () => import("./components/DashboardNavbar"),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

const Home: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Initialize as false
  const sidebarRef = useRef<HTMLDivElement | null>(null); // Ref for sidebar

  const toggleSidebar = () => {
    // Only toggle sidebar for mobile view
    if (isMobile) {
      setIsOpen((prev) => !prev);
    }
  };

  // Close sidebar if clicking outside of it
  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // This runs only on the client side
    const handleResize = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);

      // Reset sidebar state when switching to desktop
      if (!mobileView && isOpen) {
        setIsOpen(false);
      }
    };

    // Initialize on mount
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Add click listener for closing sidebar
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative  flex flex-col w-full">
      <DynamicDashboardNavbar toggleNavbar={toggleSidebar} isOpen={isOpen} />
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
        {/* Main content area */}
        <div className={` relative flex-grow ${!isMobile ? "ml-[280px]" : ""}`}>
          <div className={``}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
