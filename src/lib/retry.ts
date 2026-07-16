import { isAxiosError } from "axios";

/**
 * The exact backoff schedule requested for cold-start retries: retry 1 waits
 * 2s, retry 2 waits 3s, retry 3 waits 5s, retry 4 waits 8s, retry 5 waits 10s.
 * Index is 0-based (RETRY_DELAYS_MS[0] is the wait before retry #1), matching
 * both this module's own `retryWithBackoff` and React Query's `retryDelay`
 * (which also takes a 0-based `attemptIndex`).
 */
export const RETRY_DELAYS_MS = [2000, 3000, 5000, 8000, 10000];
export const MAX_TRANSIENT_RETRIES = RETRY_DELAYS_MS.length;
const LAST_RETRY_DELAY_MS = RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1] as number;

function delayForAttempt(attemptIndex: number): number {
  return RETRY_DELAYS_MS[attemptIndex] ?? LAST_RETRY_DELAY_MS;
}

/**
 * True only for a transient connection failure — a request that never
 * reached the server or never got a response back (Render cold start, a
 * dropped connection, a client-side timeout) — never a real 4xx/5xx, which
 * always carries `error.response`. Deliberately narrow: retrying a real
 * "wrong password" or validation error would just waste 5 attempts on
 * something retrying can never fix.
 *
 * Browsers don't expose Chrome's granular network error strings (like
 * ERR_CONNECTION_CLOSED, only visible in the DevTools Network tab) to JS —
 * axios surfaces all of them the same way: no `error.response`, with
 * `error.code` set to `ERR_NETWORK`/`ECONNABORTED`/etc and `error.message`
 * along the lines of "Network Error" or "timeout of Xms exceeded". This
 * checks both the axios error shape and the plain-fetch equivalent
 * (a `TypeError` with a "Failed to fetch" message), so it works whether a
 * given call goes through `apiClient` or a bare `fetch`.
 */
export function isTransientNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    if (error.response) return false;
    const code = error.code ?? "";
    const message = error.message ?? "";
    return (
      ["ERR_NETWORK", "ECONNABORTED", "ECONNRESET", "ETIMEDOUT"].includes(code) ||
      /network error|failed to fetch|timeout|econnreset|connection reset|err_connection_closed/i.test(message)
    );
  }
  if (error instanceof TypeError) {
    return /failed to fetch|network/i.test(error.message);
  }
  return false;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper for one-off axios/fetch calls made *outside* React
 * Query — retries only transient connection failures (see
 * `isTransientNetworkError` above), up to `MAX_TRANSIENT_RETRIES` times, on
 * the same fixed backoff schedule as `transientErrorRetryConfig` below.
 * `onRetry` fires right before each wait, so a caller can surface a
 * "Retrying (n/5)" message without needing its own retry-counting state.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  onRetry?: (attempt: number, maxRetries: number) => void,
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= MAX_TRANSIENT_RETRIES || !isTransientNetworkError(error)) throw error;
      attempt += 1;
      onRetry?.(attempt, MAX_TRANSIENT_RETRIES);
      await wait(delayForAttempt(attempt - 1));
    }
  }
}

/**
 * Drop-in `retry`/`retryDelay` pair for `useMutation`/`useQuery` — spread
 * this into any mutation/query's options to make it auto-retry a Render
 * cold-start (or any other transient connection failure) on the 2/3/5/8/10s
 * schedule, up to 5 times, while leaving real errors (wrong password, 4xx
 * validation, 5xx from a server that's actually up) to fail immediately.
 *
 * Pairs with the mutation's own `failureCount` (exposed by React Query on
 * every `useMutation` result) to show progress, e.g.:
 * `login.failureCount > 0 && login.isPending` → "Retrying (2/5)".
 */
export const transientErrorRetryConfig = {
  // React Query's `failureCount` is 1-based (the count of failures so far,
  // evaluated *before* deciding whether to run the next retry) — `<=` here
  // is what actually grants exactly 5 retries (failureCount 1..5 all retry,
  // 6 stops); `<` would grant only 4.
  retry: (failureCount: number, error: unknown) =>
    failureCount <= MAX_TRANSIENT_RETRIES && isTransientNetworkError(error),
  retryDelay: (attemptIndex: number) => delayForAttempt(attemptIndex),
};
