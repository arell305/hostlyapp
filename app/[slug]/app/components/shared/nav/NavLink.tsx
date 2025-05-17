// components/shared/nav/NavLinkWithProgress.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NProgress from "nprogress";
import { useCallback } from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}

const NavLink = ({ href, children, onNavigate }: NavLinkProps) => {
  const handleClick = useCallback(() => {
    NProgress.start();
    onNavigate?.();
  }, [onNavigate]);

  return (
    <Link href={href} onClick={handleClick} passHref>
      <Button variant="sidebar" size="sidebar" asChild>
        <span className="flex items-center gap-2">{children}</span>
      </Button>
    </Link>
  );
};

export default NavLink;
