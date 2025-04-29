import Image from "next/image";
import _ from "lodash";

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
        <div className="w-[80px] h-[80px] rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
          {name ? _.capitalize(name[0]) : "?"}
        </div>
      )}
      <h1 className="text-2xl font-medium">{_.capitalize(name)}</h1>
    </div>
  );
};

export default ProfileBanner;
