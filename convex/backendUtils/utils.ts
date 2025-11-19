export async function retryUntil<T>(
  condition: () => Promise<T | null | undefined | false>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    baseDelayMs?: number;
    backoffMultiplier?: number;
    timeoutMessage?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 10,
    initialDelayMs = 0,
    baseDelayMs = 400,
    backoffMultiplier = 2,
    timeoutMessage = "Operation timed out after multiple attempts.",
  } = options;

  if (initialDelayMs > 0) {
    await new Promise((r) => setTimeout(r, initialDelayMs));
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await condition();

    if (result !== null && result !== false) {
      return result as T;
    }

    if (attempt < maxAttempts - 1) {
      const delay = baseDelayMs * Math.pow(backoffMultiplier, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(timeoutMessage);
}
