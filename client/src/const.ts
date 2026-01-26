export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// استخدام نظام تسجيل الدخول الداخلي بدلاً من OAuth الخارجي
export const getLoginUrl = () => {
  return "/login";
};
