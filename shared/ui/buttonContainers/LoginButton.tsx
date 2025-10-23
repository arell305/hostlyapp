interface ButtonProps {
  className?: string;
  icon?: any;
  text?: string;
  href: string;
}

export const LoginButton: React.FC<ButtonProps> = ({
  className = "",
  icon,
  text = "Book A Demo",
  href,
}) => {
  return (
    <a href={href} className={`flex  ${className}`}>
      <button
        className={`shadow-xl w-[350px]  px-10 py-4 rounded-md  bg-customLightBlue text-black font-semibold  hover:bg-customDarkerBlue flex justify-center items-center space-x-2`}
      >
        {icon}
        <span className="text-xl pl-1">{text}</span>
      </button>
    </a>
  );
};
