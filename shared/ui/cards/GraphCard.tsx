interface GraphCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const GraphCard: React.FC<GraphCardProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`rounded-xl border bg-cardBackground p-4 ${className}`}>
      {title && <h2 className=" font-medium text-sm mb-4">{title}</h2>}
      <div className="w-full h-full">{children}</div>
    </div>
  );
};

export default GraphCard;
