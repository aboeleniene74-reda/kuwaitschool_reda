import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { notebooks as notebooksTable, subjects as subjectsTable, purchases as purchasesTable } from "../drizzle/schema";
import * as db from "./db";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

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
    
    // إحصائيات متقدمة
    getDetailedStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getDetailedStatistics();
    }),
    
    // إدارة المستخدمين
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getAllUsers();
    }),
    
    getUserActivity: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.getUserActivity(input.userId);
      }),
    
    // إدارة الإعلانات
    getAllAnnouncements: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getAllAnnouncements();
    }),
    
    createAnnouncement: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
        isActive: z.boolean().default(true),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.createAnnouncement(input);
      }),
    
    updateAnnouncement: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          message: z.string().optional(),
          type: z.enum(['info', 'success', 'warning', 'error']).optional(),
          isActive: z.boolean().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.updateAnnouncement(input.id, input.data);
        return { success: true };
      }),
    
    deleteAnnouncement: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.deleteAnnouncement(input.id);
        return { success: true };
      }),
    
    // إدارة إعدادات الموقع
    getAllSettings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getAllSettings();
    }),
    
    getSettingsByCategory: protectedProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.getSettingsByCategory(input.category);
      }),
    
    updateSetting: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.updateSetting(input.key, input.value);
        return { success: true };
      }),
    
    initializeSettings: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      await db.initializeDefaultSettings();
      return { success: true };
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
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.loginUser(input.email, input.password);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          });
        }
        
        // إنشاء session token
        const secretKey = new TextEncoder().encode(ENV.cookieSecret);
        const sessionToken = await new SignJWT({
          openId: `local_${user.id}`,
          appId: ENV.appId,
          name: user.name || "",
          userId: user.id,
          email: user.email,
          role: user.role,
        })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
          .sign(secretKey);
        
        // تعيين الكوكي
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true, user };
      }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "هذا البريد الإلكتروني مستخدم بالفعل",
          });
        }
        const user = await db.createUser(input);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل إنشاء الحساب",
          });
        }
        
        // إنشاء session token
        const secretKey = new TextEncoder().encode(ENV.cookieSecret);
        const sessionToken = await new SignJWT({
          openId: `local_${user.id}`,
          appId: ENV.appId,
          name: user.name || "",
          userId: user.id,
          email: user.email,
          role: user.role,
        })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
          .sign(secretKey);
        
        // تعيين الكوكي
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return { success: true, user };
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

    listByFilters: publicProcedure
      .input(z.object({
        subjectId: z.number(),
        semesterId: z.number(),
        categoryId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getNotebooksByFilters(input.subjectId, input.semesterId, input.categoryId);
      }),
      
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookById(input.id);
      }),
      
    listAll: teacherProcedure.query(async () => {
      return await db.getAllNotebooks();
    }),
      
    getUploadUrl: teacherProcedure
      .input(z.object({
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `notebooks/${Date.now()}-${randomSuffix}-${input.fileName}`;
        const { ENV } = await import('./_core/env');
        const baseUrl = ENV.forgeApiUrl.replace(/\/+$/, "");
        const apiKey = ENV.forgeApiKey;
        
        // إنشاء presigned upload URL
        const uploadUrl = new URL("v1/storage/upload", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
        uploadUrl.searchParams.set("path", fileKey);
        
        return { 
          uploadUrl: uploadUrl.toString(), 
          fileKey,
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        };
      }),

    uploadFile: teacherProcedure
      .input(z.object({
        file: z.string(), // base64 encoded file
        fileName: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import('./storage');
        const buffer = Buffer.from(input.file, 'base64');
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `notebooks/${Date.now()}-${randomSuffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        return { url, key: fileKey };
      }),

     create: teacherProcedure
      .input(z.object({
        subjectId: z.number(),
        gradeId: z.number(),
        semesterId: z.number(),
        categoryId: z.number(),
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

    // البحث في المذكرات
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        gradeId: z.number().optional(),
        subjectId: z.number().optional(),
        semesterId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchNotebooks(input.query, {
          gradeId: input.gradeId,
          subjectId: input.subjectId,
          semesterId: input.semesterId,
        });
      }),

    // تقييم المذكرات
    addReview: publicProcedure
      .input(z.object({
        notebookId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          notebookId: input.notebookId,
          rating: input.rating,
          comment: input.comment || null,
          userId: ctx.user?.id || input.userId,
        });
        return { success: true };
      }),

    getReviews: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookReviews(input.notebookId);
      }),

    getRatingStats: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotebookRatingStats(input.notebookId);
      }),

    // زيادة عداد المشاهدات
    incrementViewCount: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementNotebookViewCount(input.notebookId);
        return { success: true };
      }),

    // زيادة عداد التحميلات
    incrementDownloadCount: publicProcedure
      .input(z.object({ notebookId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementNotebookDownloadCount(input.notebookId);
        return { success: true };
      }),

    // تعديل مذكرة
    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        subjectId: z.number().optional(),
        gradeId: z.number().optional(),
        semesterId: z.number().optional(),
        categoryId: z.number().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        pages: z.number().optional(),
        fileUrl: z.string().optional(),
        previewUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        viewCount: z.number().optional(),
        downloadCount: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'teacher') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.updateNotebook(input.id, input);
        return { success: true };
      }),

    // حذف مذكرة
    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'teacher') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.deleteNotebook(input.id);
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

  // ============= Sessions Router =============
  sessions: router({
    list: publicProcedure.query(async () => {
      return await db.getUpcomingSessions();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const session = await db.getSessionBySlug(input.slug);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الحصة غير موجودة' });
        }
        const bookingCount = await db.getBookingCount(session.id);
        return { ...session, bookingCount };
      }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
      }
      return await db.getAllSessions();
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        sessionDate: z.date(),
        duration: z.number().min(15),
        meetingLink: z.string().url(),
        maxStudents: z.number().optional(),
        price: z.string().optional(),
        subjectId: z.number().optional(),
        gradeId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        
        // Generate unique slug
        const uniqueSlug = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await db.createSession({
          ...input,
          teacherId: ctx.user.id,
          uniqueSlug,
          sessionDate: input.sessionDate,
        });
        return { success: true, slug: uniqueSlug };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        sessionDate: z.date().optional(),
        duration: z.number().optional(),
        meetingLink: z.string().url().optional(),
        maxStudents: z.number().optional(),
        price: z.string().optional(),
        status: z.enum(['scheduled', 'live', 'completed', 'cancelled']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        const { id, ...data } = input;
        await db.updateSession(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        await db.deleteSession(input.id);
        return { success: true };
      }),

    getBookings: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        return await db.getBookingsBySession(input.sessionId);
      }),
  }),

  // ============= Session Bookings Router =============
  bookings: router({
    create: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        studentName: z.string().optional(),
        studentEmail: z.string().email().optional(),
        studentPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if session is full
        const session = await db.getSessionById(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'الحصة غير موجودة' });
        }
        
        if (session.maxStudents) {
          const bookingCount = await db.getBookingCount(input.sessionId);
          if (bookingCount >= session.maxStudents) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'الحصة مكتملة' });
          }
        }
        
        await db.createBooking({
          ...input,
          userId: ctx.user?.id,
          studentName: ctx.user ? ctx.user.name || undefined : input.studentName,
          studentEmail: ctx.user ? ctx.user.email || undefined : input.studentEmail,
        });
        return { success: true };
      }),

    myBookings: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'يجب تسجيل الدخول' });
      }
      return await db.getBookingsByUser(ctx.user.id);
    }),

    cancel: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input }) => {
        await db.cancelBooking(input.bookingId);
        return { success: true };
      }),
  }),

  // ============= Site Ratings Router =============
  siteRatings: router({
    create: publicProcedure
      .input(z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        userName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSiteRating(input);
        return { success: true };
      }),

    list: publicProcedure.query(async () => {
      return await db.getAllSiteRatings();
    }),

    // فلترة التقييمات حسب عدد النجوم
    listByStars: publicProcedure
      .input(z.object({
        stars: z.number().min(1).max(5).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSiteRatingsByStars(input.stars);
      }),

    stats: publicProcedure.query(async () => {
      return await db.getSiteRatingStats();
    }),

    // إحصائيات متقدمة مع توزيع التقييمات
    advancedStats: publicProcedure.query(async () => {
      return await db.getRatingsStatistics();
    }),

    // الإبلاغ عن تقييم
    report: publicProcedure
      .input(z.object({
        ratingId: z.number(),
        reporterName: z.string().optional(),
        reporterEmail: z.string().email().optional(),
        reason: z.string().min(10, "يجب أن يكون السبب 10 أحرف على الأقل"),
      }))
      .mutation(async ({ input }) => {
        const reportId = await db.createRatingReport(input);
        return { success: true, reportId };
      }),

    // حذف تقييم (للأدمن فقط)
    delete: protectedProcedure
      .input(z.object({
        ratingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        await db.deleteSiteRating(input.ratingId);
        return { success: true };
      }),

    // جلب جميع البلاغات (للأدمن)
    getAllReports: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
      }
      return await db.getAllRatingReports();
    }),

    // تحديث حالة البلاغ (للأدمن)
    updateReportStatus: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(['pending', 'reviewed', 'resolved', 'rejected']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        await db.updateRatingReportStatus(input.reportId, input.status, input.adminNotes);
        return { success: true };
      }),
  }),

  // ============= Session Ratings Router =============
  sessionRatings: router({
    create: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
        studentName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createSessionRating({
          ...input,
          userId: ctx.user?.id,
        });
        return { success: true };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionRatings(input.sessionId);
      }),

    average: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAverageSessionRating(input.sessionId);
      }),
  }),

  // ============= Semesters Router =============
  semesters: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSemesters();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSemesterById(input.id);
      }),
  }),

  // ============= Content Categories Router =============
  contentCategories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllContentCategories();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getContentCategoryById(input.id);
      }),
  }),

  // ============= Announcements Router (Public) =============
  announcements: router({
    getActive: publicProcedure.query(async () => {
      return await db.getActiveAnnouncements();
    }),
  }),

  // ============= Notifications Router =============
  notifications: router({
    // جلب إشعارات المستخدم
    getMyNotifications: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(20) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit);
      }),
    
    // عدد الإشعارات غير المقروءة
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotificationsCount(ctx.user.id);
    }),
    
    // تحديد إشعار كمقروء
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // تحديد جميع الإشعارات كمقروءة
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    
    // حذف إشعار
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNotification(input.id, ctx.user.id);
        return { success: true };
      }),
    
    // إدارة الإشعارات (أدمن فقط)
    broadcast: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'success', 'warning', 'error', 'notebook', 'session']).default('info'),
        link: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await db.broadcastNotification(input);
        return { success: true };
      }),
    
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getAllNotificationsForAdmin();
    }),
  }),

  // ============= Live Comments Router =============
  liveComments: router({
    create: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        comment: z.string(),
        studentName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createLiveComment({
          ...input,
          userId: ctx.user?.id,
        });
        return { success: true };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSessionLiveComments(input.sessionId);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input }: { input: { commentId: number } }) => {
        await db.markCommentAsRead(input.commentId);
        return { success: true };
      }),

    unreadCount: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }: { input: { sessionId: number } }) => {
        return await db.getUnreadCommentsCount(input.sessionId);
      }),
  }),
  
  // ============= Blog Router =============
  blog: router({
    // قائمة المقالات المنشورة
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getPublishedBlogPosts(input);
      }),

    // مقال واحد
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        // زيادة عدد المشاهدات
        await db.incrementBlogPostViews(post.id);
        return post;
      }),

    // إنشاء مقال (أدمن فقط)
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        excerpt: z.string(),
        content: z.string(),
        coverImage: z.string().optional(),
        category: z.string(),
        tags: z.string().optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const postId = await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
        });
        return { id: postId };
      }),
  }),

  // Sitemap endpoint
  sitemap: router({
    getUrls: publicProcedure.query(async () => {
      const baseUrl = "https://kuwait-secondary-school.manus.space";
      const currentDate = new Date().toISOString();
      
      // Static pages
      const staticPages = [
        { url: `${baseUrl}/`, priority: 1.0, changefreq: "daily" },
        { url: `${baseUrl}/about`, priority: 0.8, changefreq: "monthly" },
        { url: `${baseUrl}/sessions`, priority: 0.9, changefreq: "weekly" },
        { url: `${baseUrl}/privacy`, priority: 0.3, changefreq: "yearly" },
        { url: `${baseUrl}/terms`, priority: 0.3, changefreq: "yearly" },
      ];
      
      // Get all notebooks
      const notebooks = await db.getAllNotebooksForSitemap();
      const notebookPages = notebooks.map(notebook => ({
        url: `${baseUrl}/notebook/${notebook.id}`,
        lastmod: notebook.updatedAt?.toISOString() || currentDate,
        priority: 0.7,
        changefreq: "weekly"
      }));
      
      return [...staticPages, ...notebookPages];
    }),
    
    // إدارة عدادات المذكرات
    updateNotebookCounters: protectedProcedure
      .input(z.object({
        notebookId: z.number(),
        viewCount: z.number().optional(),
        downloadCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        return await db.updateNotebookCounters(
          input.notebookId,
          input.viewCount,
          input.downloadCount
        );
      }),
    
    // إضافة قيمة إلى عدادات المذكرة
    addToNotebookCounters: protectedProcedure
      .input(z.object({
        notebookId: z.number(),
        viewsToAdd: z.number().optional(),
        downloadsToAdd: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        return await db.addToNotebookCounters(
          input.notebookId,
          input.viewsToAdd,
          input.downloadsToAdd
        );
      }),
    
    // التحديث الأسبوعي التلقائي
    weeklyUpdateCounters: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        return await db.weeklyUpdateAllNotebookCounters();
      }),
    
    // الحصول على المذكرات مع عدادات معينة
    getNotebooksWithCounters: protectedProcedure
      .input(z.object({
        minViews: z.number().optional(),
        minDownloads: z.number().optional(),
        subjectId: z.number().optional(),
        gradeId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'غير مصرح' });
        }
        return await db.getNotebooksWithCounters(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
