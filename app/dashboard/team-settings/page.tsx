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
    <div className="justify-center md:border-2 max-w-3xl md:p-6 rounded-lg mx-auto ">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">Team Settings</h1>

      <div
        onClick={() => setActiveModal(TeamSettingsModalType.TeamName)}
        className="flex justify-between border-b hover:cursor-pointer"
      >
        <div>
          <p className="font-bold">Team Name: </p>
          <p className="pb-1 text-altBlack">
            {organization?.name || "Not Set"}
          </p>
        </div>

        <div className="flex items-center">
          <RiArrowRightSLine size={14} />
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
          className="flex justify-between border-b hover:cursor-pointer"
        >
          <div>
            <p className="font-bold pt-1">Promo Discount Amount: </p>
            <p className="pb-1 text-altBlack">
              {(organization?.publicMetadata?.promoDiscount as string) ||
                "Not Set"}
            </p>
          </div>

          <div className="flex items-center">
            <RiArrowRightSLine size={14} />
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
