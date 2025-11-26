"use client";

import SearchInput from "@/features/events/components/SearchInput";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { useState, useRef, useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import { filterUsers } from "@/shared/utils/format";
import DeletedMembersSection from "./DeletedMembersSection";

interface DeletedMembersFilterProps {
  users: Doc<"users">[];
}

const DeletedMembersFilter = ({ users }: DeletedMembersFilterProps) => {
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
      <DeletedMembersSection users={filteredUsers} />
    </SectionContainer>
  );
};

export default DeletedMembersFilter;
