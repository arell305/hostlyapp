import React, { useState } from "react";
import { FaCheck, FaEllipsisV, FaTimes, FaSpinner } from "react-icons/fa"; // Import spinner icon
import { UserRole, roleMap } from "../../../utils/enum";
import { useDetectClickOutside } from "react-detect-click-outside";

interface MemberCardProps {
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl: string;
  clerkUserId: string; // Add userId as a prop
  onSaveRole: (userId: string, newRole: UserRole) => void; // Callback for role change
  onDelete?: (userId: string) => void; // Callback for delete action
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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);
  const [showOptions, setShowOptions] = useState(false); // State to manage dropdown visibility
  const [isLoading, setIsLoading] = useState<boolean>(false); // Local loading state

  const availableRoles = Object.values(UserRole).filter(
    (role) => role !== UserRole.Admin
  ); // Exclude Admin

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as UserRole;
    setSelectedRole(newRole);
  };

  const handleSaveRole = () => {
    setIsLoading(true);
    onSaveRole(clerkUserId, selectedRole);
    setIsLoading(false);
    setIsEditing(false);
  };

  // Use the hook to detect clicks outside of this component
  const closeDropdown = () => setShowOptions(false);
  const ref = useDetectClickOutside({ onTriggered: closeDropdown });
  const isAdmin = role === UserRole.Admin;
  const canManageUsers =
    currentUserRole === UserRole.Admin || currentUserRole === UserRole.Manager;
  return (
    <div className="border rounded-lg p-4 shadow-md flex items-center relative">
      {isEditing ? (
        <>
          <div className="flex-grow flex items-center">
            <img
              src={imageUrl}
              alt={`${firstName} ${lastName}`}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div className="flex-grow">
              <h2 className="text-lg font-semibold">{`${firstName} ${lastName}`}</h2>

              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="border rounded p-1 w-[120px]"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleMap[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={handleSaveRole}
                className="inline-flex justify-center p-2 text-gray-500 hover:text-gray-700"
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" /> // Show spinner while loading
                ) : (
                  <FaCheck /> // Show check icon when not loading and in edit mode
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)} // Cancel editing without saving
                className="inline-flex justify-center p-2 text-gray-500 hover:text-gray-700"
              >
                {!isLoading ? <FaTimes /> : null}{" "}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-grow flex items-center">
            <img
              src={imageUrl}
              alt={`${firstName} ${lastName}`}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div className="flex-grow">
              <h2 className="text-lg font-semibold">
                {`${firstName} ${lastName}`}{" "}
                {isCurrentUser && (
                  <span className="text-green-500 text-sm">You</span>
                )}
              </h2>

              <p className="text-gray-800">{roleMap[role] || role}</p>
            </div>
          </div>
          <div className="ml-2" ref={ref}>
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)} // Toggle options visibility
              className="inline-flex justify-center p-2 text-gray-500 hover:text-gray-700"
            >
              {!isAdmin && canManageUsers && <FaEllipsisV />}
            </button>

            {/* Dropdown Menu */}
            {showOptions && (
              <div className="absolute right-0 z-10 mt-2 w-48 bg-white border rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false); // Close options after selecting edit
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => {
                      //   if (onDelete) {
                      //     onDelete(clerkUserId); // Call delete function if provided
                      //   }
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
        </>
      )}
    </div>
  );
};

export default MemberCard;
