// import React from "react";
// import {
//   FaPencilAlt,
//   FaTrashAlt,
//   FaCheck,
//   FaTimes,
//   FaCheckCircle,
//   FaUserCheck,
// } from "react-icons/fa";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { formatArrivalTime } from "../../../utils/helpers";

// interface GuestCardProps {
//   guest: {
//     id: string;
//     name: string;
//     attended?: boolean;
//     malesInGroup?: number;
//     femalesInGroup?: number;
//     checkInTime?: string;
//     promoterName?: string;
//   };
//   editingId?: string | null;
//   editName?: string;
//   canEditGuests: boolean;
//   onEdit?: (id: string, name: string) => void;
//   onSave?: (id: string) => void;
//   onDelete?: (id: string) => void;
//   onCancelEdit?: () => void;
//   setEditName?: (name: string) => void;
//   canSeePromoterName?: boolean;
//   canCheckInGuests?: boolean;
//   onCheckIn?: (guestId: string) => void;
// }

// const GuestCard: React.FC<GuestCardProps> = ({
//   guest,
//   editingId,
//   editName,
//   canEditGuests,
//   onEdit,
//   onSave,
//   onDelete,
//   onCancelEdit,
//   setEditName,
//   canSeePromoterName,
//   canCheckInGuests,
//   onCheckIn,
// }) => {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>
//           <div className="flex justify-between items-center">
//             {editingId === guest.id && setEditName ? (
//               <Input
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 className="w-full"
//               />
//             ) : (
//               <div className="flex items-center">
//                 <span>{guest.name}</span>
//                 {guest.attended && (
//                   <FaCheckCircle className="ml-2 text-green-500" />
//                 )}
//               </div>
//             )}
//             {canEditGuests &&
//               !guest.attended &&
//               onSave &&
//               onEdit &&
//               onDelete && (
//                 <div className="flex justify-end space-x-2">
//                   {editingId === guest.id ? (
//                     <>
//                       <Button onClick={() => onSave(guest.id)} size="sm">
//                         <FaCheck className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         onClick={onCancelEdit}
//                         size="sm"
//                         variant="outline"
//                       >
//                         <FaTimes className="h-4 w-4" />
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <Button
//                         variant="outline"
//                         onClick={() => onEdit(guest.id, guest.name)}
//                         size="sm"
//                       >
//                         <FaPencilAlt className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         onClick={() => onDelete(guest.id)}
//                         size="sm"
//                       >
//                         <FaTrashAlt className="h-4 w-4" />
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               )}
//             {canCheckInGuests && onCheckIn && (
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={() => onCheckIn(guest.id)}
//                 className="border"
//               >
//                 <FaUserCheck className="h-6 w-6" />
//               </Button>
//             )}
//           </div>
//           {canSeePromoterName && (
//             <p className="text-sm font-normal pt-2">{guest.promoterName}</p>
//           )}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-0">
//         {guest.attended && guest.checkInTime && (
//           <div className="flex flex-col">
//             <div className="flex justify-between">
//               <div>
//                 <span>Males: {guest.malesInGroup || 0}</span>
//                 <span className="ml-4">
//                   Females: {guest.femalesInGroup || 0}
//                 </span>
//               </div>
//               <span className="text-gray-500">
//                 Arrived: {formatArrivalTime(guest.checkInTime)}
//               </span>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default GuestCard;

import React, { useState } from "react";
import { FaEllipsisV, FaCheckCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { formatArrivalTime } from "../../../../utils/helpers";
import { GuestWithPromoter } from "@/types/types";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Badge } from "@/components/ui/badge";

interface GuestCardProps {
  guest: GuestWithPromoter;
  editingId?: string | null;
  editName?: string;
  canEditGuests: boolean;
  onEdit?: (id: string, name: string) => void;
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
  canSeePromoterName?: boolean;
  canCheckInGuests?: boolean;
  onCheckIn?: (guestId: string) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  canEditGuests,
  onEdit,
  onSave,
  onDelete,
  canSeePromoterName,
  canCheckInGuests,
  onCheckIn,
}) => {
  const [isLoading, setIsLoading] = useState(false); // Local loading state for save operation
  const [showOptions, setShowOptions] = useState(false); // State to manage dropdown visibility

  const handleSave = async () => {
    if (onSave) {
      setIsLoading(true);
      await onSave(guest.id);
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(guest.id);
      setShowOptions(false); // Close options after deleting
    }
  };

  return (
    <div
      className={`border-b border-gray-300 p-4 w-full flex justify-between items-center ${canCheckInGuests && onCheckIn ? "hover:bg-gray-100 cursor-pointer" : ""}`}
      onClick={() => {
        if (canCheckInGuests && onCheckIn) {
          onCheckIn(guest.id);
        }
      }}
    >
      <div className="flex justify-center items-center">
        <div className="flex items-center justify-center flex-col mr-3 w-[40px]">
          {guest.attended && guest.checkInTime && (
            <>
              <FaCheckCircle
                className=" text-customDarkBlue text-center"
                size={33}
              />
              <p className="text-[11px] text-gray-500">
                {" "}
                {formatArrivalTime(guest.checkInTime)}
              </p>
            </>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <p className="text-xl font-semibold">{guest.name}</p>
          </div>
          <div className="flex">
            {canSeePromoterName && (
              <p className="text-sm text-altGray font-normal pt-[2px]">
                {guest.promoterName}
              </p>
            )}
            {guest.attended && guest.checkInTime && (
              <div className="flex pt-[2px] space-x-1 ml-2">
                <Badge>M: {guest.malesInGroup || 0}</Badge>
                <Badge>F: {guest.femalesInGroup || 0}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      {canCheckInGuests && onCheckIn && (
        <MdOutlineKeyboardArrowRight className="text-gray-500 cursor-pointer text-2xl" />
      )}
      {canEditGuests && !guest.attended && (
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FaEllipsisV />
          </Button>
          {/* Dropdown Menu */}
          {showOptions && (
            <div className="absolute right-0 z-10 mt-2 w-48 bg-white border rounded-md shadow-lg">
              <div className="py-1">
                <button
                  onClick={() => {
                    if (onEdit) {
                      setShowOptions(false); // Close options after selecting edit
                      onEdit(guest.id, guest.name);
                    }
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="block px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="border-b border-gray-300 p-4 w-full">
  //     {editingId === guest.id && setEditName ? (
  //       <div className="flex items-center">
  //         <Input
  //           value={editName}
  //           onChange={(e) => setEditName(e.target.value)}
  //           className="flex-grow"
  //         />
  //         <Button
  //           onClick={handleSave}
  //           size="sm"
  //           className="ml-2"
  //           disabled={isLoading}
  //         >
  //           {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
  //         </Button>
  //         <Button
  //           onClick={onCancelEdit}
  //           size="sm"
  //           variant="outline"
  //           className="ml-2"
  //         >
  //           <FaTimes />
  //         </Button>
  //       </div>
  //     ) : (
  //       <div className="flex justify-between items-center">
  //         <div>
  //           <div className="flex items-center">
  //             <span className="text-xl font-semibold">{guest.name}</span>
  //             {guest.attended && (
  //               <FaCheckCircle className="ml-2 text-green-500" />
  //             )}
  //           </div>
  //           {canEditGuests && !guest.attended && (
  //             <div className="relative">
  //               <Button
  //                 size="sm"
  //                 variant="ghost"
  //                 onClick={() => setShowOptions(!showOptions)}
  //               >
  //                 <FaEllipsisV />
  //               </Button>
  //               {/* Dropdown Menu */}
  //               {showOptions && (
  //                 <div className="absolute right-0 z-10 mt-2 w-48 bg-white border rounded-md shadow-lg">
  //                   <div className="py-1">
  //                     <button
  //                       onClick={() => {
  //                         if (onEdit) {
  //                           setShowOptions(false); // Close options after selecting edit
  //                           onEdit(guest.id, guest.name);
  //                         }
  //                       }}
  //                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
  //                     >
  //                       Edit
  //                     </button>
  //                     <button
  //                       onClick={handleDelete}
  //                       className="block px-4 py-2 text-sm text-red-700 hover:bg-red-100 w-full text-left"
  //                     >
  //                       Delete
  //                     </button>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           )}
  //         </div>
  //         {canCheckInGuests && onCheckIn && (
  //           <MdOutlineKeyboardArrowRight
  //             className="text-gray-500 cursor-pointer"
  //             onClick={() => onCheckIn(guest.id)} // Call check-in function
  //           />
  //         )}
  //       </div>
  //     )}
  //     {canSeePromoterName && (
  //       <p className="text-sm text-altGray font-normal pt-2">
  //         {guest.promoterName}
  //       </p>
  //     )}
  //     {guest.attended && guest.checkInTime && (
  //       <CardContent className="pt-0">
  //         <div className="flex justify-between">
  //           <div>
  //             <span>Males: {guest.malesInGroup || 0}</span>
  //             <span className="ml-4">Females: {guest.femalesInGroup || 0}</span>
  //           </div>
  //           <span className="text-gray-500">
  //             Arrived: {formatArrivalTime(guest.checkInTime)}
  //           </span>
  //         </div>
  //       </CardContent>
  //     )}
  //   </div>
  // );
};

export default GuestCard;
