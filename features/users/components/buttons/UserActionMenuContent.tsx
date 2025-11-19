"use client";

import { Id } from "@/convex/_generated/dataModel";
import { UserWithPromoCode } from "@/shared/types/types";
import MenuContainer from "@/shared/ui/buttonContainers/menu/MenuContainer";
import MenuDelete from "@/shared/ui/buttonContainers/menu/MenuDelete";
import MenuReactivate from "@/shared/ui/buttonContainers/menu/MenuReactivate";

type Props = {
  user: UserWithPromoCode;
  onDelete: (id: Id<"users">) => void;
  onReactivate: (id: Id<"users">) => void;
  onClose: () => void;
};

export default function ContactActionMenuContent({
  user,
  onDelete,
  onReactivate,
  onClose,
}: Props) {
  return (
    <MenuContainer>
      {user.isActive ? (
        <MenuDelete doc={user} onDelete={onDelete} onClose={onClose} />
      ) : (
        <MenuReactivate
          doc={user}
          onReactivate={onReactivate}
          onClose={onClose}
        />
      )}
    </MenuContainer>
  );
}
