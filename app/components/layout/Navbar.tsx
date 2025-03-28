"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TITLE } from "../../types/constants";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY;
    setVisible(currentScrollPos <= prevScrollPos || currentScrollPos <= 50);
    setPrevScrollPos(currentScrollPos);
  }, [prevScrollPos]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <nav
      className={`md:px-8 px-1 bg-white w-full z-20 top-0 start-0 border-b shadow border-gray-200  sticky transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-2 py-2">
        <a href="#" className="text-2xl font-bold font-raleway">
          {TITLE}
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-3 rtl:space-x-reverse">
          <SignedOut>
            <Button
              type="button"
              size="navButton"
              onClick={() => router.push("/sign-up")}
            >
              Sign up
            </Button>
            <Button
              onClick={() => router.push("/sign-in")}
              variant="outline"
              size="navButton"
              className="text-customDarkBlue rounded-[12px]  text-base font-medium w-[90px] h-[42px]
"
            >
              Sign in
            </Button>
          </SignedOut>
          <SignedIn>
            <SignOutButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
