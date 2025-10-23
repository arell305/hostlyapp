import React from "react";

interface CountInputContainerProps {
  children: React.ReactNode;
  className?: string;
}

const CountInputContainer: React.FC<CountInputContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`my-4 flex items-center justify-between mx-10 md:mx-14 ${className}`}
    >
      {children}
    </div>
  );
};

export default CountInputContainer;
