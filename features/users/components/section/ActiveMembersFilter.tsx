"use client";

import SearchInput from "@/features/events/components/SearchInput";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { useState, useRef, useMemo } from "react";
import ActiveMembersSection from "./ActiveMembersSection";
import { Doc } from "@/convex/_generated/dataModel";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import { filterUsers } from "@/shared/utils/format";

interface ActiveMembersFilterProps {
  users: Doc<"users">[];
}

const ActiveMembersFilter = ({ users }: ActiveMembersFilterProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchTerm);
  }, [users, searchTerm]);

  const showSearch = users.length > SEARCH_MIN_LENGTH;

  return (
    <SectionContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search members..."
        />
      )}
      <ActiveMembersSection users={filteredUsers} />
    </SectionContainer>
  );
};

export default ActiveMembersFilter;
