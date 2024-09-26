"use client";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { useOrganization } from "@clerk/nextjs";

interface DashboardNavbarProps {
  toggleNavbar: () => void;
  isOpen: boolean; // Add isOpen prop to manage the state of the sidebar
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  toggleNavbar,
  isOpen,
}) => {
  const { organization } = useOrganization();

  return (
    <nav className="bg-customDarkBlue w-full z-20 top-0 border-b border-gray-200 text-white sticky">
      <div className="flex flex-wrap items-center mx-auto p-2.5">
        <div className="flex items-center">
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg hover:border hover:border-white focus:outline-none focus:ring-1 focus:ring-white md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            {isOpen ? ( // Check if sidebar is open to toggle icon
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1l12 12M13 1L1 13"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            )}
          </button>
          <a href="#" className="text-2xl font-medium ml-3">
            {organization?.name ?? "Hostly"}
          </a>
        </div>
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
