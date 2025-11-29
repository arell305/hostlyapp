"use client";

import { usePathname } from "next/navigation";

export const CLEAN_LAYOUT_PATTERNS = [
  "/[slug]/app",
  "/[slug]/app/analytics",
  "/[slug]/app/company-settings",
  "/[slug]/app/add-event",
  "/[slug]/app/faq",
  "/[slug]/app/team",
  "/[slug]/app/stripe",
  "/[slug]/app/subscription",
  "/[slug]/app/contacts/[contactId]",
  "/[slug]/app/templates/[userId]",
  "/[slug]/app/campaigns/[userId]",
  "/[slug]/app/campaigns/[userId]/add",
  "/[slug]/app/campaigns",
] as const;

const normalizePath = (path: string) => {
  if (!path) {
    return "";
  }
  if (path.endsWith("/") && path !== "/") {
    return path.replace(/\/+$/, "");
  }
  return path;
};

const matchNextJsPattern = (pattern: string, currentPath: string): boolean => {
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(currentPath);

  const patternSegments = normalizedPattern.split("/").filter(Boolean);
  const pathSegments = normalizedPath.split("/").filter(Boolean);

  const endsWithWildcard =
    patternSegments.length > 0 &&
    patternSegments[patternSegments.length - 1] === "*";
  const requiredLength = endsWithWildcard
    ? patternSegments.length - 1
    : patternSegments.length;

  if (endsWithWildcard) {
    if (pathSegments.length < requiredLength) {
      return false;
    }
  }

  if (!endsWithWildcard) {
    if (pathSegments.length !== requiredLength) {
      return false;
    }
  }

  for (let index = 0; index < requiredLength; index++) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith("[") && patternSegment.endsWith("]")) {
      if (!pathSegment || pathSegment.length === 0) {
        return false;
      }
      continue;
    }

    if (patternSegment !== pathSegment) {
      return false;
    }
  }

  return true;
};

export const useCleanLayout = (): boolean => {
  const pathname = usePathname() ?? "";
  const normalizedPathname = normalizePath(pathname);
  const matched = CLEAN_LAYOUT_PATTERNS.some((pattern) =>
    matchNextJsPattern(pattern, normalizedPathname)
  );
  return matched;
};
