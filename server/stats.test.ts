import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";

// Mock admin context
function createAdminContext() {
  return {
    ctx: {
      user: {
        id: 1,
        openId: "admin-test-id",
        name: "Admin Test",
        email: "admin@test.com",
        role: "admin" as const,
        createdAt: new Date(),
      },
    },
  };
}

function createUserContext() {
  return {
    ctx: {
      user: {
        id: 2,
        openId: "user-test-id",
        name: "User Test",
        email: "user@test.com",
        role: "user" as const,
        createdAt: new Date(),
      },
    },
  };
}

describe("admin.getDetailedStats", () => {
  it("يجب أن يعيد الإحصائيات المفصلة للأدمن", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getDetailedStats();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalVisits");
    expect(result).toHaveProperty("totalViews");
    expect(result).toHaveProperty("totalDownloads");
    expect(result).toHaveProperty("totalReviews");
    expect(result).toHaveProperty("averageRating");
    expect(result).toHaveProperty("topNotebooks");
    
    // التحقق من أن القيم أرقام
    expect(typeof result.totalVisits).toBe("number");
    expect(typeof result.totalViews).toBe("number");
    expect(typeof result.totalDownloads).toBe("number");
    expect(typeof result.totalReviews).toBe("number");
    
    // التحقق من أن topNotebooks مصفوفة
    expect(Array.isArray(result.topNotebooks)).toBe(true);
    
    // التحقق من أن كل مذكرة لديها عنوان
    if (result.topNotebooks.length > 0) {
      const firstNotebook = result.topNotebooks[0];
      expect(firstNotebook).toHaveProperty("notebookId");
      expect(firstNotebook).toHaveProperty("title");
      expect(firstNotebook).toHaveProperty("views");
      expect(firstNotebook).toHaveProperty("downloads");
    }
  });

  it("يجب أن يرفض الوصول للمستخدم العادي", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getDetailedStats()).rejects.toThrow();
  });
  
  it("يجب أن تكون المشاهدات والتحميلات أرقام موجبة أو صفر", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getDetailedStats();

    expect(result.totalVisits).toBeGreaterThanOrEqual(0);
    expect(result.totalViews).toBeGreaterThanOrEqual(0);
    expect(result.totalDownloads).toBeGreaterThanOrEqual(0);
    expect(result.totalReviews).toBeGreaterThanOrEqual(0);
  });
});
