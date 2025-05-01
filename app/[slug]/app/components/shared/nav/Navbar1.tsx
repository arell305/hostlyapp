"use client";

import { useEffect, useState } from "react";
import MobileSidebar from "./MobileSidebar";
import NavbarActions from "./NavBarActions";
import Image from "next/image";
import Logo from "@/components/shared/Logo";
const Navbar = ({ slug, orgRole }: { slug: string; orgRole: string }) => {
  const [showNavbar, setShowNavbar] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up or near top
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-14 bg-cardBackground flex items-center justify-between px-4 z-40 shadow-md border-b transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Hamburger menu for mobile */}
      <MobileSidebar slug={slug} orgRole={orgRole} />

      {/* Centered logo only on mobile */}
      <div className="flex-1 flex justify-center md:hidden">
        <Logo />
      </div>
      <div className="flex-1 flex">
        <Logo />
      </div>

      <NavbarActions slug={slug} orgRole={orgRole} />
    </nav>
  );
};

export default Navbar;
