"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function AfterSignUp() {
  const router = useRouter();

  return (
    <div className="mt-20 flex items-center justify-center">
      <div>Loading</div>
    </div>
  );
}

export default AfterSignUp;
