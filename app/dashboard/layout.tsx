"use client";
import { useState, useEffect } from "react";
import DashboardNavbar from "./components/DashboardNavbar";
import DashboardMobileSidebar from "./components/DashboardMobileSidebar";
import DashboardDesktopSidebar from "./components/DashboardDesktopSidebar";

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
    <div className="relative h-screen flex flex-col">
      {/* Navbar */}
      <DashboardNavbar toggleNavbar={toggleSidebar} isOpen={isOpen} />
      <div className="md:flex">
        {/* Sidebar */}
        {isMobile ? (
          <DashboardMobileSidebar
            isOpen={isOpen}
            toggleSidebar={toggleSidebar}
          />
        ) : (
          <DashboardDesktopSidebar />
        )}

        {/* Main content area */}
        <div className="">
          <main
            className={`relative z-10 flex-grow transition-all duration-300 ${
              isOpen && !isMobile ? "ml-64" : ""
            }`}
          >
            <div className="p-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
