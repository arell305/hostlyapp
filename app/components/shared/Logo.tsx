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
        width={124}
        height={20}
        priority
      />
    </div>
  );
};

export default Logo;
