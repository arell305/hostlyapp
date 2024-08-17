import { cn } from "../../lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  size,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  size?: string | undefined;
}) => {
  let itemClasses =
    "rounded-lg group/bento hover:shadow-xl transition duration-200 shadow-input p-4  bg-gray-50 border border-transparent justify-between flex flex-col space-y-4";

  if (size === "small") {
    itemClasses += " md:col-span-1";
  } else if (size === "medium") {
    itemClasses += " md:col-span-2 hidden md:display md:block";
  } else if (size === "large") {
    itemClasses += " md:col-span-3 ";
  } else if (size === "medium-show") {
    itemClasses += " md:col-span-2";
  }
  return (
    <div className={cn(itemClasses, className)}>
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-bold text-neutral-600  mb-2 mt-2 text-lg">
          {title}
        </div>
        <div className="font-normal text-neutral-600 text-md ">
          {description}
        </div>
      </div>
    </div>
  );
};
