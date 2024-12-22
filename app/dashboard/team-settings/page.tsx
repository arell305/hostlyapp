"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { RiArrowRightSLine } from "react-icons/ri";
import TeamNameModal from "../components/modals/TeamNameModal";
import PromoAmountModal from "../components/modals/PromoAmountModal";
import { TeamSettingsModalType } from "@/utils/enums";

const TeamSettings = () => {
  const { organization, isLoaded } = useOrganization();
  const { user } = useUser();
  const [activeModal, setActiveModal] = useState<TeamSettingsModalType | null>(
    null
  );

  const closeModal = () => {
    setActiveModal(null);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="justify-center md:border-2 max-w-3xl rounded-lg mx-auto mt-1.5 md:shadow">
      <h1 className="pt-6 pl-4 text-3xl md:text-4xl font-bold mb-3">
        Team Settings
      </h1>

      <div
        onClick={() => setActiveModal(TeamSettingsModalType.TeamName)}
        className="px-4 flex justify-between border-b cursor-pointer hover:bg-gray-100 py-3"
      >
        <div className="">
          <h3 className="text-sm font-medium text-gray-500">Team Name: </h3>
          <p className="text-lg font-semibold">
            {organization?.name || "Not Set"}
          </p>
        </div>

        <div className="flex items-center">
          <RiArrowRightSLine className="text-2xl" />
        </div>
      </div>

      {activeModal === TeamSettingsModalType.TeamName && (
        <TeamNameModal
          isOpen={activeModal === TeamSettingsModalType.TeamName}
          onClose={closeModal}
          organization={organization}
          user={user}
        />
      )}

      {organization && (
        <div
          onClick={() => setActiveModal(TeamSettingsModalType.PromoDiscount)}
          className="px-4 flex justify-between border-b cursor-pointer hover:bg-gray-100 py-3"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Promo Discount Amount:{" "}
            </h3>
            <p className="text-lg font-semibold">
              {(organization?.publicMetadata?.promoDiscount as string) ||
                "Not Set"}
            </p>
          </div>

          <div className="flex items-center">
            <RiArrowRightSLine className="text-2xl" />
          </div>
        </div>
      )}
      {activeModal === TeamSettingsModalType.PromoDiscount && (
        <PromoAmountModal
          isOpen={activeModal === TeamSettingsModalType.PromoDiscount}
          onClose={closeModal}
          organization={organization}
        />
      )}
    </div>
  );
};

export default TeamSettings;
