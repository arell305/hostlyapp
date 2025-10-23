interface ClickableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ClickableRow: React.FC<ClickableRowProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <div
      className={`h-[95px] border-b w-full hover:bg-cardBackgroundHover cursor-pointer flex items-center justify-between px-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ClickableRow;
