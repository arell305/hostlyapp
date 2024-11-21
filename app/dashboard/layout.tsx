"use client";
import { useState, useEffect } from "react";
import DashboardNavbar from "./components/DashboardNavbar";
import DashboardMobileSidebar from "./components/DashboardMobileSidebar";
import DashboardDesktopSidebar from "./components/DashboardDesktopSidebar";
import SuspenseBoundary from "@/components/layout/SuspenseBoundary";
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

  const toggleSidebar = () => {
    // Only toggle sidebar for mobile view
    if (isMobile) {
      setIsOpen((prev) => !prev);
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

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return (
    <div className="relative h-screen flex flex-col w-full">
      {/* Navbar */}

      <DynamicDashboardNavbar toggleNavbar={toggleSidebar} isOpen={isOpen} />
      <div className="md:flex h-full mt-[50px]">
        {/* Sidebar */}
        <div className="md:w-64 w-full">
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
        <div
          className={`relative flex-grow transition-all duration-300 ${
            isOpen && !isMobile ? "ml-64" : ""
          }`}
        >
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
