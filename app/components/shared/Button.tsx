interface ButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children = "Book A Demo",
}) => {
  return (
    <a href="#demo">
      <button
        className={`shadow-xl text-xl px-10 py-3 rounded-md border border-black bg-customLightBlue text-black font-semibold transition duration-200 hover:bg-customDarkBlue hover:text-white  ${className}`}
      >
        {children}
      </button>
    </a>
  );
};
