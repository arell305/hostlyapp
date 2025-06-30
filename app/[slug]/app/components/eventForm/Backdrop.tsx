"use client";

import React from "react";

interface BackdropProps {
  onClick: () => void;
  className?: string;
}

const Backdrop: React.FC<BackdropProps> = ({ onClick, className }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/60 z-40 ${className ?? ""}`}
      onClick={onClick}
    ></div>
  );
};

export default Backdrop;
