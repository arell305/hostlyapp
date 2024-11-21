"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { FaTicket } from "react-icons/fa6";
import OrgPromoCode from "./OrgPromoCode";

const OrganizationProfilePage = () => (
  <OrganizationProfile routing="hash">
    <OrganizationProfile.Page
      label="Team Promo Code"
      labelIcon={<FaTicket />}
      url="promoCode"
    >
      <OrgPromoCode />
    </OrganizationProfile.Page>
  </OrganizationProfile>
);

export default OrganizationProfilePage;
