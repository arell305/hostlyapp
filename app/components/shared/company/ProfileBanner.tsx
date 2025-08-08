import Image from "next/image";
import _ from "lodash";
import { getInitial } from "@/utils/helpers";
import InitialAvatar from "../avatars/InitialAvatar";
import clsx from "clsx";
import Link from "next/link";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";

interface ProfileBannerProps {
  displayPhoto: string | null | undefined;
  name: string;
  className?: string;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  displayPhoto,
  name,
  className,
}) => {
  const { slug } = useContextPublicOrganization();
  return (
    <Link
      href={`/${slug}`}
      className={clsx("flex items-center gap-4 pt-4 pb-2", className)}
    >
      {displayPhoto ? (
        <div className="relative w-[60px] h-[60px]">
          <Image
            src={displayPhoto}
            alt="Profile"
            fill
            sizes="80px"
            className="rounded-full object-cover"
          />
        </div>
      ) : (
        <InitialAvatar
          initial={getInitial(name)}
          size={80}
          textSize="text-xl"
          bgColor="bg-gray-600"
        />
      )}
      <h1 className="text-2xl font-medium">{_.capitalize(name)}</h1>
    </Link>
  );
};

export default ProfileBanner;
