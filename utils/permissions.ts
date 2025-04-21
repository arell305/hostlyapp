import { UserRole } from "@/types/enums";

export const canCreateEvent = (role?: string): boolean => {
  return (
    role === UserRole.Admin ||
    role === UserRole.Manager ||
    role === UserRole.Hostly_Admin ||
    role === UserRole.Hostly_Moderator
  );
};

export const canCheckInGuests = (role?: string): boolean => {
  return role === UserRole.Moderator;
};

export const isAdmin = (role?: string): boolean => {
  return role === UserRole.Admin;
};

export const isAdminOrHostlyAdmin = (role?: string): boolean => {
  return (
    role === UserRole.Admin ||
    role === UserRole.Hostly_Admin ||
    role === UserRole.Hostly_Moderator
  );
};

export const isManager = (role?: string): boolean => {
  return (
    role === UserRole.Manager ||
    role === UserRole.Hostly_Moderator ||
    role === UserRole.Hostly_Admin ||
    role === UserRole.Admin
  );
};

export const isHostlyUser = (role?: string): boolean => {
  return role === UserRole.Hostly_Admin || role === UserRole.Hostly_Moderator;
};

export const isAnalyticsUser = (role?: string): boolean => {
  return (
    role === UserRole.Admin ||
    role === UserRole.Manager ||
    role === UserRole.Hostly_Admin ||
    role === UserRole.Promoter
  );
};
