import Cookies from "js-cookie";

const DEVICE_ID_COOKIE = "obm_device_id";

/** Opaque per-browser id used by the backend to recognize a previously-verified device. */
export function getOrCreateDeviceId(): string {
  const existing = Cookies.get(DEVICE_ID_COOKIE);
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  Cookies.set(DEVICE_ID_COOKIE, deviceId, { expires: 365, sameSite: "lax" });
  return deviceId;
}
