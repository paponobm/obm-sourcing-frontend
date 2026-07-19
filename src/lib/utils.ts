import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Browser Back for "Cancel"/"Back" actions — undoes the user's last in-app
 * navigation (so it lands wherever they actually came from) instead of
 * force-redirecting to a fixed route. Falls back to `fallbackHref` only when
 * there's no history to pop to, e.g. the page was opened via a direct link
 * with nothing before it in this tab's session history. */
export function goBackOrFallback(
  router: { back: () => void; push: (href: string) => void },
  fallbackHref: string,
) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push(fallbackHref);
  }
}
