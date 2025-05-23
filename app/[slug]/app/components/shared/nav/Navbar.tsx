"use client";

import { useEffect, useState } from "react";
import MobileSidebar from "./MobileSidebar";
import NavbarActions from "./NavBarActions";
import Logo from "@/components/shared/Logo";
import { UserWithPromoCode } from "@/types/types";

const Navbar = ({
  slug,
  orgRole,
  userData,
}: {
  slug: string;
  orgRole: string;
  userData?: UserWithPromoCode;
}) => {
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
      className={`fixed top-0 left-0 w-full h-14 md:h-16 bg-cardBackground flex items-center justify-between px-4 z-40 shadow-md border-b transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Hamburger menu for mobile */}
      <MobileSidebar slug={slug} orgRole={orgRole} />

      {/* Centered logo only on mobile */}
      <div className="flex-1 flex justify-center lg:hidden">
        <Logo />
      </div>
      <div className="flex-1 hidden lg:flex"></div>

      <NavbarActions orgRole={orgRole} userData={userData} />
    </nav>
  );
};

export default Navbar;
