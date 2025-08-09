"use client";
import React, { useState, useEffect, useCallback } from "react";
import { SignedIn, SignedOut, SignOutButton, useAuth } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Logo from "../shared/Logo";
import NProgress from "nprogress";
import Link from "next/link";

const Navbar: React.FC = () => {
  const { isLoaded } = useAuth();
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
      className={`md:px-8 px-1 bg-cardBackground w-full z-20 top-0 start-0 border-b shadow sticky transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-2 h-12">
        <Logo />
        <div className="flex md:order-2 space-x-3 md:space-x-3 rtl:space-x-reverse">
          {!isLoaded ? (
            <div className="w-[180px] h-[42px] bg-gray-700 animate-pulse rounded-lg" />
          ) : (
            <>
              <SignedOut>
                <Link href="/sign-up" onClick={() => NProgress.start()}>
                  <Button type="button" size="navButton">
                    Sign up
                  </Button>
                </Link>

                <Link href="/sign-in" onClick={() => NProgress.start()}>
                  <Button
                    variant="outline"
                    size="navButton"
                    className="rounded-[12px] border-primaryBlue text-base font-medium w-[90px] h-[42px]"
                  >
                    Sign in
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <SignOutButton />
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
