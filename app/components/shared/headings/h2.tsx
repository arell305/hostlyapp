import React from "react";

interface Heading2Props {
  children: React.ReactNode;
  className?: string;
}

const Heading2: React.FC<Heading2Props> = ({ children, className = "" }) => {
  return <h2 className={`mb-4 ${className}`}>{children}</h2>;
};

export default Heading2;
