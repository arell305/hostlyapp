"use client";
import React from "react";

const FullLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="-translate-y-[100px] animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
};

export default FullLoading;
