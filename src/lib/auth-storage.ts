import Cookies from "js-cookie";

const TOKEN_KEY = "obm_access_token";
const REFRESH_KEY = "obm_refresh_token";

/**
 * Stored as cookies (not localStorage) so the Next.js middleware
 * can read the session on the server to protect (dashboard) routes.
 */
export const authStorage = {
  getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  },
  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string) {
    Cookies.set(TOKEN_KEY, accessToken, { expires: 1, sameSite: "lax" });
    if (refreshToken) {
      Cookies.set(REFRESH_KEY, refreshToken, { expires: 7, sameSite: "lax" });
    }
  },
  clear() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_KEY);
  },
};
