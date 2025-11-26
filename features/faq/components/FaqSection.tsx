"use client";

import { useMemo, useRef, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import SearchInput from "@/features/events/components/SearchInput";
import { filterFaqs } from "@/shared/utils/format";
import FAQContent from "./FAQContent";

interface FaqSectionProps {
  faqs: Doc<"faq">[];
}

const FaqSection = ({ faqs }: FaqSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredFaqs = useMemo(() => {
    return filterFaqs(faqs, searchTerm);
  }, [faqs, searchTerm]);

  const showSearch = faqs.length > SEARCH_MIN_LENGTH;

  return (
    <SectionContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search faqs..."
        />
      )}
      <FAQContent faqs={filteredFaqs} />
    </SectionContainer>
  );
};

export default FaqSection;
