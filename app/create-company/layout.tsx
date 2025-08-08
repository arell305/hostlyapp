"use client";
import { useState, useEffect, useRef } from "react";

const Home: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Initialize as false
  const sidebarRef = useRef<HTMLDivElement | null>(null); // Ref for sidebar

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

  return <div className={``}>{children}</div>;
};

export default Home;
