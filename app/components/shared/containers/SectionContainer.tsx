import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <section className={`flex flex-col gap-4 pb-10 ${className}`}>
      {children}
    </section>
  );
};

export default SectionContainer;
