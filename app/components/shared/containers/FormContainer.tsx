interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-2  ${className}`}>{children}</div>;
};

export default FormContainer;
