import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import * as db from "../db";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // أولاً: محاولة المصادقة المحلية (email/password)
    user = await authenticateLocalUser(opts.req);
    
    // إذا لم تنجح المصادقة المحلية، جرب OAuth
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

// دالة المصادقة المحلية
async function authenticateLocalUser(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    
    const cookies = parseCookieHeader(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    if (!sessionCookie) return null;
    
    const secretKey = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
      algorithms: ["HS256"],
    });
    
    // التحقق من أن هذا token محلي (يحتوي على userId)
    if (payload.userId && typeof payload.userId === "number") {
      const user = await db.getUserById(payload.userId);
      if (user) {
        return user;
      }
    }
    
    // إذا كان openId يبدأ بـ local_ فهو مستخدم محلي
    if (payload.openId && typeof payload.openId === "string" && payload.openId.startsWith("local_")) {
      const userId = parseInt(payload.openId.replace("local_", ""), 10);
      if (!isNaN(userId)) {
        const user = await db.getUserById(userId);
        if (user) {
          return user;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
