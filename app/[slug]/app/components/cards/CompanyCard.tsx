import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../../../convex/_generated/api";
import ClickableRow from "@/components/shared/cards/ClickableRow";
import { capitalizeWords, getInitial } from "@/utils/helpers";
import { OrganizationDetails } from "@/types/types";
import InitialAvatar from "@/components/shared/avatars/InitialAvatar";
import { subscriptionStatusMap } from "@/types/enums";
import Link from "next/link";

interface CompanyCardProps {
  company: OrganizationDetails;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const { subscriptionTier, subscriptionStatus, photoStorageId, name } =
    company;
  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photoStorageId
      ? {
          storageId: photoStorageId,
        }
      : "skip"
  );

  return (
    <Link href={`/${company.slug}/app/`}>
      <ClickableRow>
        <div className="flex items-center justify-between">
          {displayCompanyPhoto ? (
            <Image
              src={displayCompanyPhoto}
              alt={`${name} Avatar`}
              className="w-16 h-16 rounded-md"
              width={64}
              height={64}
            />
          ) : (
            <InitialAvatar
              initial={getInitial(name)}
              size={64}
              textSize="text-xl"
              bgColor="bg-gray-600"
            />
          )}
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{`${capitalizeWords(name)}`}</h2>

            <p className="text-grayText">{subscriptionTier}</p>
          </div>
        </div>
        <div className="relative">
          {subscriptionStatus && subscriptionStatusMap[subscriptionStatus]}
        </div>
      </ClickableRow>
    </Link>
  );
};

export default CompanyCard;
