// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useAction } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Loader2 } from "lucide-react";
// import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
// import { cn } from "@/lib/utils";

// interface EditingPaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   email?: string;
// }

// const EditingPaymentModal: React.FC<EditingPaymentModalProps> = ({
//   isOpen,
//   onClose,
//   email,
// }) => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const updateSubscriptionPaymentMethod = useAction(
//     api.stripe.updateSubscriptionPaymentMethod
//   );
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     if (!stripe || !elements) {
//       setError("Stripe has not loaded yet. Please try again.");
//       setIsLoading(false);
//       return;
//     }

//     if (!email) {
//       setError("Email not found");
//       setIsLoading(false);
//       return;
//     }

//     const cardElement = elements.getElement(CardElement);

//     if (!cardElement) {
//       setError("Card element not found");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { error, paymentMethod } = await stripe.createPaymentMethod({
//         type: "card",
//         card: cardElement,
//       });

//       if (error) {
//         throw new Error(error.message);
//       }

//       if (!paymentMethod) {
//         throw new Error("Failed to create payment method");
//       }

//       await updateSubscriptionPaymentMethod({
//         email,
//         newPaymentMethodId: paymentMethod.id,
//       });
//       onClose();
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "An unknown error occurred"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="w-[90vw] md:min-w-0 rounded-xl">
//         <DialogHeader>
//           <DialogTitle className="flex">Update Payment</DialogTitle>
//         </DialogHeader>
//         <div
//           className={cn(
//             "rounded-none w-full border-b-2 bg-transparent py-1 focus-within:outline-none",
//             error ? "border-red-500" : "border-gray-300",
//             "focus-within:border-customDarkBlue"
//           )}
//         >
//           <CardElement
//             options={{
//               style: {
//                 base: {
//                   fontSize: "16px",
//                   color: "#2d3748", // Equivalent to `text-gray-800`
//                   backgroundColor: "transparent",
//                   "::placeholder": { color: "#a0aec0" }, // Placeholder color equivalent to `text-gray-400`
//                 },
//                 invalid: {
//                   color: "#e53e3e", // Red color for invalid state
//                 },
//               },
//             }}
//           />
//         </div>
//         {error && <p className="text-red-500">{error}</p>}
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
//             onClick={handleSubmit}
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

// export default EditingPaymentModal;
