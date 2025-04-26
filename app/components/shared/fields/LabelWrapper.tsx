interface LabelWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const LabelWrapper: React.FC<LabelWrapperProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
};

export default LabelWrapper;
