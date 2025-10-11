// lib/errorHelper.ts
import { ERROR_TITLES, ERROR_MESSAGES } from "@/types/constants";
import { ErrorCode } from "@/types/types";

export interface ServerErrorData {
  code?: string; // may be anything; we coerce it
  message?: string; // ignored on purpose
}
export interface RouteError extends Error {
  digest?: string;
  data?: ServerErrorData;
}

function coerceCode(maybeCode?: string): ErrorCode {
  switch (maybeCode) {
    case "UNAUTHORIZED":
    case "FORBIDDEN":
    case "NOT_FOUND":
    case "VALIDATION_FAILED":
    case "CONFLICT":
    case "RATE_LIMITED":
    case "INTERNAL_ERROR":
      return maybeCode;
    default:
      return "INTERNAL_ERROR";
  }
}

export function toUiError(routeError: RouteError) {
  const code = coerceCode(routeError.data?.code);
  const title = ERROR_TITLES[code];
  const message = ERROR_MESSAGES[code];
  return { code, title, message };
}

export type PrimaryCta =
  | { kind: "retry" }
  | { kind: "link"; href: string; label: string };

export function pickPrimaryCta(code?: ErrorCode | string): PrimaryCta {
  switch (code) {
    case "UNAUTHORIZED":
      return { kind: "link", href: "/sign-in", label: "Sign in" };
    case "FORBIDDEN":
    case "NOT_FOUND":
    case "NOT_IMPLEMENTED":
      return { kind: "link", href: "/", label: "Go home" };
    case "RATE_LIMITED":
    case "INTERNAL_ERROR":
    default:
      return { kind: "retry" };
  }
}
