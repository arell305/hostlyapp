import { Id } from "../../convex/_generated/dataModel";
import { UserRole } from "../../utils/enum";

export interface UserSchema {
  _id: Id<"users">;
  clerkUserId?: string;
  email: string;
  clerkOrganizationId?: string;
  acceptedInvite: boolean;
  customerId?: Id<"customers">;
  role: UserRole | null;
  name?: string;
  promoterPromoCode?: {
    promoCodeId: Id<"promoterPromoCode">;
    name: string;
  };
  imageUrl?: string;
}

interface OrganizationsSchema {
  _id: Id<"organizations">;
  _creationTime: number;
  clerkOrganizationId: string;
  name: string;
  clerkUserIds: string[];
  imageUrl?: string;
  eventIds: Id<"events">[];
  customerId: Id<"customers">;
  promoDiscount: number;
  isActive?: boolean;
}
