"use client";

import { useEffect, useState } from "react";
import MobileSidebar from "./MobileSidebar";
import NavbarActions from "./NavBarActions";
import Logo from "@/shared/ui/image/Logo";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-12 md:px-8 bg-cardBackground flex items-center justify-between px-4 z-40 shadow-md border-b transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <MobileSidebar />

      <div className="flex-1 flex justify-center lg:hidden">
        <Logo />
      </div>
      <div className="flex-1 hidden lg:flex"></div>

      <NavbarActions />
    </nav>
  );
};

export default Navbar;
