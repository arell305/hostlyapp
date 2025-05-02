interface ToggleButtonProps {
  isChecked: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
}
const ToggleButton: React.FC<ToggleButtonProps> = ({
  isChecked,
  setIsChecked,
}) => {
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <label className="themeSwitcherTwo  relative inline-flex cursor-pointer select-none items-center justify-center rounded-md  p-1 border shadow">
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center space-x-[6px] rounded-md py-2 px-[18px] text-sm font-medium ${
            !isChecked
              ? "text-white bg-cardBackgroundHover border-[.5px] border-gray-700"
              : "text-body-color"
          }`}
        >
          Reserved
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded-md py-2 px-[18px] text-sm font-medium ${
            isChecked
              ? "text-white bg-cardBackgroundHover border-[.5px] border-gray-700"
              : "text-body-color"
          }`}
        >
          Checked-In
        </span>
      </label>
    </>
  );
};

export default ToggleButton;
