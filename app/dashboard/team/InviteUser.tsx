// // InviteUser.tsx TO DELETE
// import React, { useState } from "react";
// import { UserRole, roleMap } from "../../../utils/enum"; // Adjust the import based on your file structure
// import { useToast } from "@/hooks/use-toast"; // Adjust the import based on your file structure
// import { useAction } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { isValidEmail } from "../../../utils/helpers";
// import { changeableRoles } from "@/types/enums";

// interface InviteUserProps {
//   organizationId: string;
//   inviterUserId: string;
//   //   onInviteSuccess: () => void;
// }

// const InviteUser: React.FC<InviteUserProps> = ({
//   organizationId,
//   inviterUserId,
//   //   onInviteSuccess,
// }) => {
//   const [inviteEmail, setInviteEmail] = useState<string>("");
//   const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.Promoter); // Default role
//   const [inviteError, setInviteError] = useState<string | null>(null);
//   const { toast } = useToast();
//   const createClerkInvitation = useAction(api.clerk.createClerkInvitation);

//   const handleInviteUser = async () => {
//     if (!isValidEmail(inviteEmail)) {
//       setInviteError("Please enter a valid email address.");
//       return;
//     }
//     try {
//       const result = await createClerkInvitation({
//         clerkOrgId: organizationId,
//         clerkUserId: inviterUserId,
//         role: inviteRole,
//         email: inviteEmail,
//       });

//       if (result.success) {
//         toast({
//           title: "Invitation Sent",
//           description: result.message,
//         });
//         setInviteEmail(""); // Clear input field
//         setInviteError(null); // Reset error
//         // onInviteSuccess(); // Optional callback to refresh or update state in parent
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (error) {
//       console.error("Failed to send invitation:", error);
//       toast({
//         title: "Error",
//         description: "Failed to send invitation.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="my-4">
//       <input
//         type="email"
//         placeholder="Enter email"
//         value={inviteEmail}
//         onChange={(e) => setInviteEmail(e.target.value)}
//         className="border p-2 rounded"
//       />

//       <select
//         value={inviteRole}
//         onChange={(e) => setInviteRole(e.target.value as UserRole)}
//         className="border rounded p-1 w-[120px]"
//       >
//         {changeableRoles.map((role) => (
//           <option key={role} value={role}>
//             {roleMap[role]}
//           </option>
//         ))}
//       </select>

//       <button
//         onClick={handleInviteUser}
//         className="ml-2 bg-blue-500 text-white p-2 rounded"
//       >
//         Invite User
//       </button>

//       {inviteError && <p className="text-red-500">{inviteError}</p>}
//     </div>
//   );
// };

// export default InviteUser;
