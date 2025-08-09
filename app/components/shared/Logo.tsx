"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

const Logo = () => {
  const router = useRouter();

  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        NProgress.start();
        router.push("/");
      }}
    >
      <Image
        src="/logo/logo.png"
        alt="Hostly Logo"
        width={180} // intrinsic width of the file
        height={40} // intrinsic height of the file
        style={{ width: 90, height: "auto" }} // scale down, keep ratio
        priority
      />
    </div>
  );
};

export default Logo;
