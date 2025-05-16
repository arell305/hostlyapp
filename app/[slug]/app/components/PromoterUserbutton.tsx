import React, { useState, useCallback, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { FaEdit } from "react-icons/fa";

interface PromoterUserButtonProps {
  promoCode: string | undefined | null;
  onEditPromoCode: () => void;
}

const PromoterUserButton: React.FC<PromoterUserButtonProps> = ({
  promoCode,
  onEditPromoCode,
}) => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    forceUpdate();
  }, [promoCode, forceUpdate]);

  const promoCodeDisplay = promoCode
    ? `Promo Code: ${promoCode}`
    : "Add Promo Code";

  return (
    <UserButton key={promoCode}>
      <UserButton.MenuItems>
        <UserButton.Action
          label={promoCodeDisplay}
          labelIcon={<FaEdit />}
          onClick={onEditPromoCode}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default PromoterUserButton;
