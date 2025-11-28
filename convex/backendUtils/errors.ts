import { ConvexError } from "convex/values";

interface ConvexErrorOptions {
  code?: string;
  showToUser?: boolean;
}

interface ConvexErrorPayload {
  data: ConvexErrorOptions;
}

function hasConvexErrorPayload(error: unknown): error is ConvexErrorPayload {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as Record<string, unknown>).data === "object" &&
    (error as Record<string, unknown>).data !== null
  );
}

export function throwConvexError(
  error: unknown,
  { code = "INTERNAL_ERROR", showToUser = false }: ConvexErrorOptions = {}
): never {
  console.error("[ConvexError]", error);

  const fallbackMessage = "Something went wrong. Please try again.";

  let derivedMessage: string | undefined;

  if (typeof error === "string") {
    derivedMessage = error;
  } else if (error instanceof Error) {
    derivedMessage = error.message;
  }

  const finalMessage = derivedMessage ?? fallbackMessage;

  const payload = hasConvexErrorPayload(error) ? error.data : undefined;

  const finalCode = payload?.code ?? code ?? "INTERNAL_ERROR";
  const finalShowToUser = payload?.showToUser ?? showToUser ?? false;

  throw new ConvexError({
    code: finalCode,
    message: finalMessage,
    showToUser: finalShowToUser,
  });
}
