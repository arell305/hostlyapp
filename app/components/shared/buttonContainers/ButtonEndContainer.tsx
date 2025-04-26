"use client";

import React from "react";

interface ButtonEndContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonEndContainer: React.FC<ButtonEndContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={`my-6 flex justify-end ${className}`}>{children}</div>;
};

export default ButtonEndContainer;
