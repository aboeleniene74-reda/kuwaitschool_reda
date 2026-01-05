import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { notebooks as notebooksTable, subjects as subjectsTable, purchases as purchasesTable } from "../drizzle/schema";
import * as db from "./db";

const teacherProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "يجب تسجيل الدخول للوصول إلى هذه الميزة",
    });
  }
  if (ctx.user.role !== "teacher" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "يجب أن تكون معلماً أو مديراً للوصول إلى هذه الميزة",
    });
  }
  return next({ ctx });
});

// تم استيراد protectedProcedure من ./_core/trpc

export const appRouter = router({
  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
      }
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      
      const [notebooks, subjects, purchases] = await Promise.all([
        database.select({ count: sql<number>`count(*)` }).from(notebooksTable),
        database.select({ count: sql<number>`count(*)` }).from(subjectsTable),
        database.select({ count: sql<number>`count(*)` }).from(purchasesTable),
      ]);
      
      return {
        totalNotebooks: Number(notebooks[0]?.count || 0),
        totalSubjects: Number(subjects[0]?.count || 0),
        totalPurchases: Number(purchases[0]?.count || 0),
      };
    }),
  }),
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= Grades (الصفوف الدراسية) =============
  grades: router({
    list: publicProcedure.query(async () => {
      return await db.getAllGrades();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getGradeById(input.id);
      }),
      
    create: teacherProcedure
      .input(z.object({
        name: z.string(),
        nameEn: z.string(),
        order: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createGrade(input);
        return { success: true };
      }),
  }),

  // ============= Subjects (المواد الدراسية) =============
  subjects: router({
    listByGrade: publicProcedure
      .input(z.object({ gradeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubjectsByGrade(input.gradeId);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubjectById(input.id);
      }),
      
    create: teacherProcedure
      .input(z.object({
        gradeId: z.number(),
        name: z.string(),
        nameEn: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSubject(input);
        return { success: true };
      }),
  }),

  // ============= Notebooks (المذكرات) =============
  notebooks: router({
    listBySubject: publicProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebooksBySubject(input.subjectId);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookById(input.id);
      }),
      
    listAll: teacherProcedure.query(async () => {
      return await db.getAllNotebooks();
    }),
      
    create: teacherProcedure
      .input(z.object({
        subjectId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        price: z.string(),
        pages: z.number().optional(),
        fileUrl: z.string().optional(),
        previewUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
        isPublished: z.boolean().default(false),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createNotebook({
          ...input,
          teacherId: ctx.user!.id,
        });
        return { success: true };
      }),
  }),

  // ============= Purchases (المشتريات) =============
  purchases: router({
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserPurchases(ctx.user!.id);
    }),
    
    checkPurchased: protectedProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input, ctx }) => {
        const purchased = await db.checkUserPurchased(ctx.user!.id, input.notebookId);
        return { purchased };
      }),
      
    create: protectedProcedure
      .input(z.object({
        notebookId: z.number(),
        price: z.string(),
        paymentMethod: z.string().optional(),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createPurchase({
          ...input,
          userId: ctx.user!.id,
          status: "pending",
        });
        return { success: true };
      }),
  }),

  // ============= Reviews (التقييمات) =============
  reviews: router({
    listByNotebook: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookReviews(input.notebookId);
      }),
      
    create: protectedProcedure
      .input(z.object({
        notebookId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          ...input,
          userId: ctx.user!.id,
        });
        return { success: true };
      }),
  }),

  // ============= Statistics (الإحصائيات) =============
  statistics: router({
    trackVisit: publicProcedure
      .input(z.object({
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.trackStatistic({
          type: "visit",
          userId: ctx.user?.id,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });
        return { success: true };
      }),
      
    trackView: publicProcedure
      .input(z.object({
        notebookId: z.number(),
        ipAddress: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.trackStatistic({
          type: "view",
          notebookId: input.notebookId,
          userId: ctx.user?.id,
          ipAddress: input.ipAddress,
        });
        return { success: true };
      }),
      
    trackDownload: publicProcedure
      .input(z.object({
        notebookId: z.number(),
        ipAddress: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.trackStatistic({
          type: "download",
          notebookId: input.notebookId,
          userId: ctx.user?.id,
          ipAddress: input.ipAddress,
        });
        return { success: true };
      }),
      
    getNotebookStats: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookStats(input.notebookId);
      }),
      
    getTotalVisits: publicProcedure.query(async () => {
      return await db.getTotalVisits();
    }),
      
    getAllStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
      }
      const [visits, notebooksStats] = await Promise.all([
        db.getTotalVisits(),
        db.getAllNotebooksStats(),
      ]);
      return {
        totalVisits: visits,
        notebooks: notebooksStats,
      };
    }),
  }),

  // ============= Comments (التعليقات) =============
  comments: router({
    listByNotebook: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookComments(input.notebookId, false);
      }),
      
    create: publicProcedure
      .input(z.object({
        notebookId: z.number(),
        content: z.string().min(1),
        authorName: z.string().optional(),
        authorEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createComment({
          ...input,
          userId: ctx.user?.id,
          authorName: ctx.user ? ctx.user.name || undefined : input.authorName,
          authorEmail: ctx.user ? ctx.user.email || undefined : input.authorEmail,
        });
        return { success: true };
      }),
      
    listPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
      }
      return await db.getAllPendingComments();
    }),
      
    approve: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        await db.approveComment(input.commentId);
        return { success: true };
      }),
      
    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        await db.deleteComment(input.commentId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
