"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TITLE } from "../../constants";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos > prevScrollPos && currentScrollPos > 50) {
      setVisible(false);
    } else {
      setVisible(true);
    }

    setPrevScrollPos(currentScrollPos);
  }, [prevScrollPos]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav
      className={`bg-customDarkBlue w-full z-20 top-0 start-0 border-b border-gray-200 text-white sticky transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="text-2xl font-medium">
          {TITLE}
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-3 rtl:space-x-reverse">
          <SignedOut>
            <a href="/signup" className="my-auto">
              <button
                type="button"
                className="bg-transparent border border-white hover:bg-white hover:text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:py-1.5 text-center"
              >
                Signup
              </button>
            </a>

            <a href="#demo" className="my-auto">
              <button
                type="button"
                className="bg-customPrimaryBlue hover:bg-customSecondaryBlue hover:text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:py-1.5 text-center"
              >
                Demo
              </button>
            </a>
          </SignedOut>
          <SignedIn>
            <SignOutButton />
          </SignedIn>
          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:border hover:border-white focus:outline-none focus:ring-1 focus:ring-white"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg
                className="w-5 h-5"
                aria-hidden="true"
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
                aria-hidden="true"
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
        </div>
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 md:mr-6 font-medium border rounded-lg bg-transparent md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 text-white items-center">
            <li>
              <a
                href="#"
                className="block py-2 px-3 rounded md:p-0 hover:underline"
                aria-current="page"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="block py-2 px-3 rounded md:p-0 hover:underline"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#benefits"
                className="block py-2 px-3 rounded md:p-0 hover:underline"
              >
                Benefits
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="block py-2 px-3 rounded md:p-0 hover:underline"
              >
                Pricing
              </a>
            </li>
            <SignedOut>
              <li>
                <Link
                  className="block py-2 px-3 rounded md:p-0 hover:underline"
                  href="/sign-in"
                  passHref
                >
                  Sign in
                </Link>
              </li>
            </SignedOut>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
