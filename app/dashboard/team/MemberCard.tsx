import React, { useState } from "react";
import { FaCheck, FaEllipsisV, FaTimes, FaSpinner } from "react-icons/fa"; // Import spinner icon
import { UserRole, roleMap } from "../../../utils/enum";
import { useDetectClickOutside } from "react-detect-click-outside";
import { RiArrowRightSLine } from "react-icons/ri";
interface MemberCardProps {
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl: string;
  clerkUserId: string; // Add userId as a prop
  onSaveRole: (userId: string, newRole: UserRole) => void; // Callback for role change
  onDelete: (userId: string) => void; // Callback for delete action
  clerkOrgId: string;
  isCurrentUser: boolean;
  currentUserRole?: UserRole;
}

const MemberCard: React.FC<MemberCardProps> = ({
  firstName,
  lastName,
  role,
  imageUrl,
  clerkUserId,
  onSaveRole,
  isCurrentUser,
  currentUserRole,
  onDelete,
  clerkOrgId,
}) => {
  const [showOptions, setShowOptions] = useState(false); // State to manage dropdown visibility
  const [isEditingUserModal, setIsEditingUserModal] = useState<boolean>(false);
  const [editingUserClerkId, setEditingUserClerkId] = useState<string>("");

  const handleDeleteUser = () => {
    onDelete(clerkUserId);
  };

  const openEditingModal = () => {
    setEditingUserClerkId(clerkUserId); // Set the current user's ID
    setIsEditingUserModal(true);
    setShowOptions(false); // Close dropdown
  };

  // Use the hook to detect clicks outside of this component
  const closeDropdown = () => setShowOptions(false);
  const ref = useDetectClickOutside({ onTriggered: closeDropdown });
  const isAdmin = role === UserRole.Admin;
  const canManageUsers =
    currentUserRole === UserRole.Admin || currentUserRole === UserRole.Manager;

  const fullName = (firstName ?? "") + " " + (lastName ?? "");
  return (
    <div className="border-b border-gray-300 p-4 w-full hover:bg-gray-100 cursor-pointer">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between">
          <img
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div className="flex-grow">
            <h2 className="text-lg font-semibold">
              {`${firstName} ${lastName}`}{" "}
              {isCurrentUser && (
                <span className="text-customDarkBlue text-sm">You</span>
              )}
            </h2>

            <p className="text-gray-800">{roleMap[role] || role}</p>
          </div>
        </div>
        {!isAdmin && canManageUsers && (
          <div className="ml-2 relative" ref={ref}>
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)} // Toggle options visibility
              className="inline-flex justify-center p-2 text-gray-500 hover:text-gray-700"
            >
              <RiArrowRightSLine className="text-3xl" />
            </button>

            {/* Dropdown Menu */}
            {showOptions && (
              <div className="absolute right-0 z-10 w-48 bg-white border rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={openEditingModal}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser();
                      setShowOptions(false); // Close options after deleting
                    }}
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
      {/* <EditingUserModal
        isOpen={isEditingUserModal}
        onClose={closeModal}
        editingUserClerkId={editingUserClerkId}
        role={role}
        clerkOrgId={clerkOrgId}
        fullName={fullName}
        onSaveRole={onSaveRole}
      /> */}
    </div>
  );
};

export default MemberCard;
