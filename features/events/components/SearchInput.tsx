"use client";

import { Input } from "@shared/ui/primitive/input";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { RefObject } from "react";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@shared/types/constants";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  searchInputRef,
  placeholder = "Search...",
}) => {
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const handleClick = () => {
    if (searchInputRef.current && !isDesktop) {
      searchInputRef.current.focus();
      setTimeout(() => {
        const rect = searchInputRef.current!.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        window.scrollTo({
          top: scrollTop + rect.top - 20,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <div
      className="relative flex items-center   rounded-md "
      onClick={handleClick}
    >
      <FaSearch className="absolute left-4 text-grayText" />
      <Input
        ref={searchInputRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      {searchTerm !== "" && (
        <MdOutlineCancel
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering focus scroll
            setSearchTerm("");
          }}
          className="cursor-pointer absolute right-4 text-grayText hover:text-cardBackgroundHover: text-2xl"
        />
      )}
    </div>
  );
};

export default SearchInput;
