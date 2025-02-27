// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useToast } from "@/hooks/use-toast";
// import { useAction, useMutation } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Loader2 } from "lucide-react";
// import { useOrganizationList } from "@clerk/nextjs";
// import { UserResource, OrganizationResource } from "@clerk/types";

// interface PromoAmountModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   organization?: OrganizationResource | null;
// }

// const PromoAmountModal: React.FC<PromoAmountModalProps> = ({
//   isOpen,
//   onClose,
//   organization,
// }) => {
//   const [promoAmount, setPromoAmount] = useState<string>(
//     (organization?.publicMetadata?.promoDiscount as string) || ""
//   );
//   const [promoAmountError, setpromoAmountError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const { toast } = useToast();
//   const updateOrganizationMetadata = useAction(
//     api.clerk.updateOrganizationMetadata
//   );
//   const updatePromoDiscount = useMutation(
//     api.organizations.updateOrganizationPromoDiscount
//   );

//   const { isLoaded: orgIsLoaded, setActive } = useOrganizationList({
//     userMemberships: true,
//   });

//   const handleSave = async () => {
//     if (promoAmount === undefined) {
//       setpromoAmountError("Promo Amount is undefined. Please try again.");
//       return;
//     }
//     const discountValue: number = parseFloat(promoAmount);

//     // Validation logic
//     if (isNaN(discountValue)) {
//       setpromoAmountError("Please enter a valid number.");
//       return;
//     }

//     if (!isFinite(discountValue)) {
//       setpromoAmountError("Please enter a finite number.");
//       return;
//     }

//     if (discountValue <= 0) {
//       setpromoAmountError("Please enter a positive number.");
//       return;
//     }

//     // Check for more than two decimal places
//     const decimalCheck = /^\d+(\.\d{1,2})?$/; // Regex to allow up to 2 decimal places
//     if (!decimalCheck.test(promoAmount)) {
//       setpromoAmountError(
//         "Please enter a number with up to two decimal places."
//       );
//       return;
//     }

//     if (!organization || !orgIsLoaded) {
//       setpromoAmountError("Team is undefined. Please try again.");
//       return;
//     }

//     setpromoAmountError(null);
//     setIsLoading(true);

//     try {
//       const promises = [
//         updateOrganizationMetadata({
//           clerkOrganizationId: organization.id,
//           params: {
//             promoDiscount: discountValue,
//           },
//         }),
//         updatePromoDiscount({
//           clerkOrganizationId: organization.id,
//           promoDiscount: discountValue,
//         }),
//       ];

//       await Promise.all(promises);
//       await setActive({ organization: organization.id });
//       toast({
//         title: "Success",
//         description: "Promo discount amount set.",
//       });
//       onClose();
//     } catch (error) {
//       console.error("Failed to update promo discount amount.", error);
//       setpromoAmountError(
//         "Error updating promo discount amount. Please try again"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="w-[90vw] md:min-w-0 rounded">
//         <DialogHeader>
//           <DialogTitle className="flex">Promo Code Amount:</DialogTitle>
//         </DialogHeader>
//         <input
//           type="text"
//           placeholder="Enter promo code amount"
//           value={promoAmount}
//           onChange={(e) => setPromoAmount(e.target.value)}
//           className={`w-full border-b-2 bg-transparent py-1 text-gray-800 focus:outline-none
//           ${promoAmountError ? "border-red-500" : "border-gray-300"}
//           focus:border-customDarkBlue`}
//         />

//         {promoAmountError && <p className="text-red-500">{promoAmountError}</p>}
//         <div className="flex justify-center space-x-10">
//           <Button
//             disabled={isLoading}
//             variant="ghost"
//             onClick={onClose}
//             className="font-semibold  w-[140px]"
//           >
//             Cancel
//           </Button>
//           <Button
//             className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
//             onClick={handleSave}
//             disabled={isLoading}
//           >
//             {" "}
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               "Save"
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PromoAmountModal;
