"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 100, minimum: 0.1 });

export default function RouteChangeProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();

    // Stop progress bar after navigation completes
    NProgress.done();

    // Cleanup on unmount
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
