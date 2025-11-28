import { ERROR_TITLES, ERROR_MESSAGES } from "@/shared/types/constants";
import { ConvexClientError, ErrorCode } from "@/shared/types/types";

export type ConvexErrorCode =
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "BAD_REQUEST";

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

export function getConvexErrorMessage(unknownError: unknown): {
  message: string;
  code?: ConvexErrorCode;
  recognized: boolean;
} {
  const payload = (unknownError as any)?.data;

  if (payload && typeof payload === "object") {
    const rawCode = payload.code as string | undefined;
    const message = payload.message as string | undefined;
    const showToUser = payload.showToUser ?? false;

    if (showToUser) {
      return {
        message: message ?? "Something went wrong.",
        code: rawCode as ConvexErrorCode | undefined,
        recognized: true,
      };
    } else {
      return {
        message: "Something went wrong. Please try again.",
        recognized: true,
      };
    }
  }
  return {
    message: "Something went wrong. Please try again.",
    recognized: false,
  };
}

export function setErrorFromConvexError(
  unknownError: unknown,
  setError: (msg: string) => void
): void {
  const { message } = getConvexErrorMessage(unknownError);
  console.error(message, unknownError);
  setError(message);
}
