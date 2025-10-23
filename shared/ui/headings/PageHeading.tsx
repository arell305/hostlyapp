"use client";

interface PageHeadingProps {
  title: string;
  datePicker?: React.ReactNode;
  presetDropdown?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  datePicker,
  presetDropdown,
  rightSlot,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex flex-wrap gap-2 items-center">
        {presetDropdown}
        {datePicker}
        {rightSlot}
      </div>
    </div>
  );
};

export default PageHeading;
