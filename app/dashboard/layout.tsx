"use client";
import React, { ReactNode, useState } from "react";
import DashboardNavbar from "./components/DashboardNavbar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const closeNavbar = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Pass isOpen and toggleNavbar to DashboardNavbar */}
      <DashboardNavbar
        isOpen={isOpen}
        toggleNavbar={toggleNavbar}
        closeNavbar={closeNavbar}
        setIsOpen={setIsOpen}
      />

      {/* Dark overlay when the navbar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10"
          onClick={closeNavbar}
        ></div>
      )}

      <main onClick={closeNavbar}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
