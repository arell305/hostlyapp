import Image from "next/image";
import _ from "lodash";
import { getInitial } from "@/utils/helpers";
import InitialAvatar from "../avatars/InitialAvatar";

interface ProfileBannerProps {
  displayPhoto: string | null | undefined;
  name: string;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  displayPhoto,
  name,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-6">
      {displayPhoto ? (
        <div className="relative w-[80px] h-[80px]">
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
    </div>
  );
};

export default ProfileBanner;
