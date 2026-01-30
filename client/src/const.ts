export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// استخدام نظام Manus OAuth للمصادقة
export const getLoginUrl = () => {
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const currentUrl = window.location.origin + "/";
  const state = btoa(currentUrl);
  return `${portalUrl}?appId=${appId}&state=${state}`;
};
