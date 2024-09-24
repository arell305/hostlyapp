"use client";
import React, { useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";

interface DashboardNavbarProps {
  isOpen: boolean;
  toggleNavbar: () => void;
  closeNavbar: () => void; // Ensure this is present
  setIsOpen: (open: boolean) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  isOpen,
  toggleNavbar,
  closeNavbar,
  setIsOpen,
}) => {
  const { organization } = useOrganization();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsOpen]);

  return (
    <nav className="bg-customDarkBlue w-full z-20 top-0 start-0 border-b border-gray-200 text-white sticky">
      <div className="max-w-screen-xl flex flex-wrap items-center mx-auto p-2.5 md:justify-between">
        <div className="flex items-center">
          {/* Menu icon button always visible */}
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg hover:border hover:border-white focus:outline-none focus:ring-1 focus:ring-white"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
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

        <div className="flex md:order-2 space-x-3 ml-auto md:ml-0">
          <UserButton />
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-screen w-[370px] bg-customDarkBlue z-20 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
        >
          <div className="flex justify-between p-4">
            <h2 className="text-2xl font-medium">
              {organization?.name ?? "Hostly"}
            </h2>
            <button
              onClick={closeNavbar}
              className="text-white text-xl hover:text-gray-300 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <ul className="flex flex-col p-6 mt-4 space-y-4 font-medium text-white">
            <li>
              <a
                href="#"
                className="block py-2 px-3 rounded"
                onClick={closeNavbar}
              >
                Home
              </a>
            </li>
            <li>
              <Link
                className="block py-2 px-3 rounded md:p-0 hover:underline"
                href="/organization"
                passHref
                onClick={closeNavbar}
              >
                {organization?.name}
              </Link>
            </li>
            <li>
              <a
                href="#benefits"
                className="block py-2 px-3 rounded"
                onClick={closeNavbar}
              >
                Benefits
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="block py-2 px-3 rounded"
                onClick={closeNavbar}
              >
                Pricing
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
