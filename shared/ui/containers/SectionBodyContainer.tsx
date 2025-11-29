interface SectionBodyContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SectionBodyContainer: React.FC<SectionBodyContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-4 min-h-[350px] md:min-h-[500px] ${className}`}
    >
      {children}
    </div>
  );
};

export default SectionBodyContainer;
