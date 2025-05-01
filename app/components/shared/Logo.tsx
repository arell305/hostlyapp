"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <div className="cursor-pointer" onClick={() => router.push("/")}>
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
