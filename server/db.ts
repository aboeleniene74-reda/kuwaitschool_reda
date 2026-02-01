import { eq, and, desc, or, like, sql, isNull, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  grades, 
  subjects, 
  notebooks, 
  purchases, 
  reviews,
  statistics,
  comments,
  sessions,
  sessionBookings,
  siteRatings,
  ratingReports,
  sessionRatings,
  liveComments,
  semesters,
  contentCategories,
  announcements,
  siteSettings,
  notifications,
  blogPosts,
  InsertGrade,
  InsertSubject,
  InsertNotebook,
  InsertPurchase,
  InsertReview,
  InsertStatistic,
  InsertComment,
  InsertSession,
  InsertSessionBooking,
  InsertSiteRating,
  InsertSessionRating,
  InsertLiveComment,
  InsertSemester,
  InsertContentCategory,
  InsertAnnouncement,
  InsertSiteSetting,
  InsertNotification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Functions =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Grade Functions =============

export async function getAllGrades() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(grades).orderBy(grades.order);
}

export async function getGradeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(grades).where(eq(grades.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGrade(grade: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(grades).values(grade);
}

// ============= Subject Functions =============

export async function getSubjectsByGrade(gradeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(subjects).where(eq(subjects.gradeId, gradeId));
}

export async function getSubjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubject(subject: InsertSubject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(subjects).values(subject);
}

// ============= Notebook Functions =============

export async function getNotebooksBySubject(subjectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notebooks)
    .where(and(
      eq(notebooks.subjectId, subjectId),
      eq(notebooks.isPublished, true)
    ))
    .orderBy(desc(notebooks.isFeatured), desc(notebooks.createdAt));
}

export async function getNotebookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(notebooks).where(eq(notebooks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNotebook(notebook: InsertNotebook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notebooks).values(notebook);
}

export async function updateNotebook(id: number, data: Partial<InsertNotebook>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notebooks).set(data).where(eq(notebooks.id, id));
}

export async function getAllNotebooks() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notebooks)
    .orderBy(desc(notebooks.createdAt));
}

// ============= Purchase Functions =============

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(purchases).values(purchase);
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.purchasedAt));
}

export async function checkUserPurchased(userId: number, notebookId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      eq(purchases.notebookId, notebookId),
      eq(purchases.status, "completed")
    ))
    .limit(1);
    
  return result.length > 0;
}

// ============= Review Functions =============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(reviews).values(review);
}

export async function getNotebookReviews(notebookId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.notebookId, notebookId))
    .orderBy(desc(reviews.createdAt));
}

export async function getNotebookRatingStats(notebookId: number) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const ratings = await db
    .select()
    .from(reviews)
    .where(eq(reviews.notebookId, notebookId));
  
  if (ratings.length === 0) return { average: 0, count: 0 };
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Number((sum / ratings.length).toFixed(1)),
    count: ratings.length
  };
}

// ============= Statistics Functions =============

export async function trackStatistic(stat: InsertStatistic) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(statistics).values(stat);
  } catch (error) {
    console.error("[Database] Failed to track statistic:", error);
  }
}

export async function getNotebookStats(notebookId: number) {
  const db = await getDb();
  if (!db) return { views: 0, downloads: 0 };
  
  try {
    const stats = await db
      .select()
      .from(statistics)
      .where(and(
        eq(statistics.notebookId, notebookId)
      ));
    
    const views = stats.filter(s => s.type === "view").length;
    const downloads = stats.filter(s => s.type === "download").length;
    
    return { views, downloads };
  } catch (error) {
    console.error("[Database] Failed to get notebook stats:", error);
    return { views: 0, downloads: 0 };
  }
}

export async function getTotalVisits() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const visits = await db
      .select()
      .from(statistics)
      .where(eq(statistics.type, "visit"));
    
    return visits.length;
  } catch (error) {
    console.error("[Database] Failed to get total visits:", error);
    return 0;
  }
}

export async function getAllNotebooksStats() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const allNotebooks = await db.select().from(notebooks);
    const statsPromises = allNotebooks.map(async (notebook) => {
      const stats = await getNotebookStats(notebook.id);
      return {
        notebookId: notebook.id,
        title: notebook.title,
        ...stats
      };
    });
    
    return await Promise.all(statsPromises);
  } catch (error) {
    console.error("[Database] Failed to get all notebooks stats:", error);
    return [];
  }
}

// ============= Comments Functions =============

export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(comments).values(comment);
  } catch (error) {
    console.error("[Database] Failed to create comment:", error);
    throw error;
  }
}

export async function getNotebookComments(notebookId: number, includeUnapproved = false) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const conditions = [eq(comments.notebookId, notebookId)];
    if (!includeUnapproved) {
      conditions.push(eq(comments.isApproved, true));
    }
    
    return await db
      .select()
      .from(comments)
      .where(and(...conditions))
      .orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get comments:", error);
    return [];
  }
}

export async function approveComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db
      .update(comments)
      .set({ isApproved: true })
      .where(eq(comments.id, commentId));
  } catch (error) {
    console.error("[Database] Failed to approve comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(comments).where(eq(comments.id, commentId));
  } catch (error) {
    console.error("[Database] Failed to delete comment:", error);
    throw error;
  }
}

export async function getAllPendingComments() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.isApproved, false))
      .orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending comments:", error);
    return [];
  }
}


// ============= Session Functions =============

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sessions).values(session);
}

export async function getAllSessions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessions).orderBy(desc(sessions.sessionDate));
}

export async function getSessionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sessions).where(eq(sessions.uniqueSlug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function getUpcomingSessions() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return await db.select().from(sessions)
    .where(and(
      eq(sessions.isPublished, true),
      eq(sessions.status, "scheduled")
    ))
    .orderBy(sessions.sessionDate);
}

// ============= Session Booking Functions =============

export async function createBooking(booking: InsertSessionBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sessionBookings).values(booking);
}

export async function getBookingsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessionBookings)
    .where(eq(sessionBookings.sessionId, sessionId))
    .orderBy(desc(sessionBookings.bookedAt));
}

export async function getBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sessionBookings)
    .where(eq(sessionBookings.userId, userId))
    .orderBy(desc(sessionBookings.bookedAt));
}

export async function getBookingCount(sessionId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(sessionBookings)
    .where(and(
      eq(sessionBookings.sessionId, sessionId),
      eq(sessionBookings.status, "confirmed")
    ));
  
  return result.length;
}

export async function cancelBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sessionBookings)
    .set({ status: "cancelled" })
    .where(eq(sessionBookings.id, id));
}


// ==================== Site Ratings ====================

export async function createSiteRating(rating: InsertSiteRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(siteRatings).values(rating);
  return result;
}

export async function getAllSiteRatings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(siteRatings).orderBy(desc(siteRatings.createdAt));
}

export async function getSiteRatingStats() {
  const db = await getDb();
  if (!db) return { average: 0, total: 0 };
  
  const ratings = await db.select().from(siteRatings);
  if (ratings.length === 0) return { average: 0, total: 0 };
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / ratings.length,
    total: ratings.length
  };
}

// ==================== Session Ratings ====================

export async function createSessionRating(rating: InsertSessionRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(sessionRatings).values(rating);
  return result;
}

export async function getSessionRatings(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(sessionRatings)
    .where(eq(sessionRatings.sessionId, sessionId))
    .orderBy(desc(sessionRatings.createdAt));
}

export async function getAverageSessionRating(sessionId: number) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  
  const ratings = await db
    .select()
    .from(sessionRatings)
    .where(eq(sessionRatings.sessionId, sessionId));
    
  if (ratings.length === 0) return { average: 0, count: 0 };
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: sum / ratings.length,
    count: ratings.length
  };
}

// ==================== Live Comments ====================

export async function createLiveComment(comment: InsertLiveComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(liveComments).values(comment);
  return result;
}

export async function getSessionLiveComments(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(liveComments)
    .where(eq(liveComments.sessionId, sessionId))
    .orderBy(liveComments.createdAt);
}

export async function markCommentAsRead(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(liveComments)
    .set({ isRead: "yes" })
    .where(eq(liveComments.id, commentId));
}

export async function getUnreadCommentsCount(sessionId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const comments = await db
    .select()
    .from(liveComments)
    .where(and(
      eq(liveComments.sessionId, sessionId),
      eq(liveComments.isRead, "no")
    ));
    
  return comments.length;
}

// ============= Semesters Functions =============

export async function getAllSemesters() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(semesters)
    .orderBy(semesters.order);
}

export async function getSemesterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(semesters)
    .where(eq(semesters.id, id))
    .limit(1);
    
  return result[0] || null;
}

// ============= Content Categories Functions =============

export async function getAllContentCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(contentCategories)
    .orderBy(contentCategories.order);
}

export async function getContentCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(contentCategories)
    .where(eq(contentCategories.id, id))
    .limit(1);
    
  return result[0] || null;
}

// Get notebooks by filters (subject, semester, category)
export async function getNotebooksByFilters(subjectId: number, semesterId: number, categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notebooks)
    .where(and(
      eq(notebooks.subjectId, subjectId),
      eq(notebooks.semesterId, semesterId),
      eq(notebooks.categoryId, categoryId),
      eq(notebooks.isPublished, true)
    ))
    .orderBy(desc(notebooks.isFeatured), desc(notebooks.createdAt));
}

// Search notebooks by keyword
export async function searchNotebooks(searchQuery: string, filters?: {
  gradeId?: number;
  subjectId?: number;
  semesterId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const searchTerm = `%${searchQuery}%`;
  let conditions: any[] = [
    eq(notebooks.isPublished, true),
    or(
      like(notebooks.title, searchTerm),
      like(notebooks.description, searchTerm)
    )
  ];
  
  if (filters?.gradeId) {
    conditions.push(eq(notebooks.gradeId, filters.gradeId));
  }
  if (filters?.subjectId) {
    conditions.push(eq(notebooks.subjectId, filters.subjectId));
  }
  if (filters?.semesterId) {
    conditions.push(eq(notebooks.semesterId, filters.semesterId));
  }
  
  return await db
    .select()
    .from(notebooks)
    .where(and(...conditions))
    .orderBy(desc(notebooks.isFeatured), desc(notebooks.createdAt));
}

// ============= Announcements Functions =============

export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(announcements).values(announcement);
  return result;
}

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt));
}

export async function updateAnnouncement(id: number, data: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(announcements).set(data).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(announcements).where(eq(announcements.id, id));
}

// ============= Advanced Statistics Functions =============

export async function getDetailedStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // إحصائيات الزيارات
  const totalVisits = await db
    .select({ count: sql<number>`count(*)` })
    .from(statistics)
    .where(eq(statistics.type, "visit"));
  
  // إحصائيات المشاهدات
  const totalViews = await db
    .select({ count: sql<number>`count(*)` })
    .from(statistics)
    .where(eq(statistics.type, "view"));
  
  // أكثر المذكرات مشاهدة
  const topNotebooks = await db
    .select({
      notebookId: statistics.notebookId,
      views: sql<number>`count(*)`,
    })
    .from(statistics)
    .where(eq(statistics.type, "view"))
    .groupBy(statistics.notebookId)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  
  // إحصائيات التقييمات
  const totalReviews = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews);
  
  const avgRating = await db
    .select({ avg: sql<number>`avg(rating)` })
    .from(reviews);
  
  return {
    totalVisits: Number(totalVisits[0]?.count || 0),
    totalViews: Number(totalViews[0]?.count || 0),
    totalReviews: Number(totalReviews[0]?.count || 0),
    averageRating: Number(avgRating[0]?.avg || 0).toFixed(1),
    topNotebooks,
  };
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserActivity(userId: number) {
  const db = await getDb();
  if (!db) return { views: [], reviews: [] };
  
  const views = await db
    .select()
    .from(statistics)
    .where(and(
      eq(statistics.userId, userId),
      eq(statistics.type, "view")
    ))
    .orderBy(desc(statistics.createdAt))
    .limit(50);
  
  const userReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
  
  return {
    views,
    reviews: userReviews,
  };
}


// ============= Site Settings Functions =============

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(siteSettings).orderBy(siteSettings.category, siteSettings.key);
}

export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(siteSettings).where(eq(siteSettings.category, category));
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return results[0] || null;
}

export async function upsertSetting(setting: InsertSiteSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettingByKey(setting.key);
  
  if (existing) {
    await db.update(siteSettings)
      .set({ value: setting.value, updatedAt: new Date() })
      .where(eq(siteSettings.key, setting.key));
  } else {
    await db.insert(siteSettings).values(setting);
  }
}

export async function updateSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(siteSettings)
    .set({ value, updatedAt: new Date() })
    .where(eq(siteSettings.key, key));
}

export async function initializeDefaultSettings() {
  const db = await getDb();
  if (!db) return;
  
  const defaults: InsertSiteSetting[] = [
    // General Settings
    {
      key: "site_title",
      value: "علوم ثانوي",
      type: "text",
      label: "عنوان الموقع",
      description: "العنوان الذي يظهر في المتصفح",
      category: "general",
    },
    {
      key: "site_description",
      value: "مذكرات علمية شاملة للمرحلة الثانوية بالكويت",
      type: "textarea",
      label: "وصف الموقع",
      description: "الوصف المختصر للموقع",
      category: "general",
    },
    {
      key: "hero_title",
      value: "مذكرات علمية شاملة",
      type: "text",
      label: "عنوان الصفحة الرئيسية",
      category: "general",
    },
    {
      key: "hero_subtitle",
      value: "أفضل المذكرات الدراسية في الكيمياء والأحياء والفيزياء والجيولوجيا للمرحلة الثانوية بالكويت",
      type: "textarea",
      label: "نص الترحيب",
      category: "general",
    },
    
    // Contact Settings
    {
      key: "contact_name",
      value: "فارس العلوم",
      type: "text",
      label: "اسم المعلم",
      category: "contact",
    },
    {
      key: "contact_phone",
      value: "99457080",
      type: "text",
      label: "رقم الهاتف",
      category: "contact",
    },
    {
      key: "contact_whatsapp",
      value: "96599457080",
      type: "text",
      label: "رقم واتساب (مع كود الدولة)",
      category: "contact",
    },
    
    // About Page Content
    {
      key: "about_intro",
      value: "**منصة جيولوجيا ثانوي الكويت** هي منصة تعليمية متخصصة تهدف إلى توفير محتوى تعليمي عالي الجودة لطلاب المرحلة الثانوية في دولة الكويت، مع التركيز بشكل خاص على مادة **الجيولوجيا** للصفوف العاشر والحادي عشر والثاني عشر.",
      type: "textarea",
      label: "نبذة عن المنصة",
      category: "about",
    },
    {
      key: "about_vision",
      value: "نؤمن بأن **التعليم الجيد** هو حق لكل طالب، ونسعى لتوفير مواد تعليمية عالية الجودة تساعد الطلاب على تحقيق التفوق الأكاديمي في مادة الجيولوجيا.",
      type: "textarea",
      label: "رؤيتنا",
      category: "about",
    },
  ];
  
  for (const setting of defaults) {
    const existing = await getSettingByKey(setting.key);
    if (!existing) {
      await db.insert(siteSettings).values(setting);
    }
  }
}


// ============= Notifications Functions =============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  // جلب الإشعارات الخاصة بالمستخدم أو الإشعارات العامة (userId = null)
  return await db.select()
    .from(notifications)
    .where(
      or(
        eq(notifications.userId, userId),
        isNull(notifications.userId)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        or(
          eq(notifications.userId, userId),
          isNull(notifications.userId)
        ),
        eq(notifications.isRead, false)
      )
    );
  
  return Number(result[0]?.count || 0);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        or(
          eq(notifications.userId, userId),
          isNull(notifications.userId)
        )
      )
    );
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        or(
          eq(notifications.userId, userId),
          isNull(notifications.userId)
        ),
        eq(notifications.isRead, false)
      )
    );
}

export async function deleteNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        or(
          eq(notifications.userId, userId),
          isNull(notifications.userId)
        )
      )
    );
}

export async function getAllNotificationsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(100);
}

export async function broadcastNotification(notification: Omit<InsertNotification, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // إرسال إشعار لجميع المستخدمين (userId = null)
  await db.insert(notifications).values({
    ...notification,
    userId: null,
  });
}


export async function deleteNotebook(notebookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(notebooks).where(eq(notebooks.id, notebookId));
}


// Get all notebooks for sitemap
export async function getAllNotebooksForSitemap() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: notebooks.id,
      updatedAt: notebooks.updatedAt,
    })
    .from(notebooks)
    .orderBy(desc(notebooks.updatedAt));
}


// ============= Authentication (المصادقة) =============

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return results[0] || null;
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  // في بيئة إنتاجية، يجب استخدام bcrypt للتحقق من كلمة المرور
  // هنا نستخدم مقارنة بسيطة للتبسيط
  if (user.password !== password) return null;
  
  return user;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // في بيئة إنتاجية، يجب تشفير كلمة المرور باستخدام bcrypt
  const result = await db.insert(users).values({
    email: data.email,
    password: data.password, // يجب تشفيرها في الإنتاج
    name: data.name,
    phone: data.phone || null,
    role: "user",
  });
  
  // الحصول على المستخدم بعد الإدراج
  return await getUserByEmail(data.email);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return results[0] || null;
}


// ============= Blog Functions =============

export async function getPublishedBlogPosts(params: {
  category?: string;
  limit: number;
  offset: number;
}) {
  const db = await getDb();
  if (!db) return [];

  if (params.category) {
    return await db
      .select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.isPublished, true),
        eq(blogPosts.category, params.category)
      ))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(params.limit)
    .offset(params.offset);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  return results[0] || null;
}

export async function incrementBlogPostViews(id: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(blogPosts)
    .set({ views: sql`${blogPosts.views} + 1` })
    .where(eq(blogPosts.id, id));
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: number;
  category: string;
  tags?: string;
  isPublished: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogPosts).values({
    ...data,
    publishedAt: data.isPublished ? new Date() : null,
  });

  return result[0].insertId;
}


// ============================================
// دوال نظام البلاغات عن التقييمات
// ============================================

/**
 * إضافة بلاغ عن تقييم
 */
export async function createRatingReport(data: {
  ratingId: number;
  reporterName?: string;
  reporterEmail?: string;
  reason: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ratingReports).values(data);
  return result[0].insertId;
}

/**
 * جلب جميع البلاغات (للأدمن)
 */
export async function getAllRatingReports() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reports = await db
    .select({
      id: ratingReports.id,
      ratingId: ratingReports.ratingId,
      reporterName: ratingReports.reporterName,
      reporterEmail: ratingReports.reporterEmail,
      reason: ratingReports.reason,
      status: ratingReports.status,
      adminNotes: ratingReports.adminNotes,
      createdAt: ratingReports.createdAt,
      reviewedAt: ratingReports.reviewedAt,
      // معلومات التقييم المبلغ عنه
      rating: siteRatings.rating,
      ratingComment: siteRatings.comment,
      ratingVisitorName: siteRatings.visitorName,
    })
    .from(ratingReports)
    .leftJoin(siteRatings, eq(ratingReports.ratingId, siteRatings.id))
    .orderBy(desc(ratingReports.createdAt));

  return reports;
}

/**
 * تحديث حالة البلاغ
 */
export async function updateRatingReportStatus(
  reportId: number,
  status: "pending" | "reviewed" | "resolved" | "rejected",
  adminNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(ratingReports)
    .set({
      status,
      adminNotes,
      reviewedAt: new Date(),
    })
    .where(eq(ratingReports.id, reportId));
}

/**
 * حذف تقييم (للأدمن)
 */
export async function deleteSiteRating(ratingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(siteRatings).where(eq(siteRatings.id, ratingId));
}

/**
 * جلب التقييمات مع فلترة حسب عدد النجوم
 */
export async function getSiteRatingsByStars(stars?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select()
    .from(siteRatings)
    .orderBy(desc(siteRatings.createdAt));

  if (stars) {
    query = query.where(eq(siteRatings.rating, stars)) as any;
  }

  const ratings = await query;
  return ratings;
}

/**
 * جلب إحصائيات التقييمات المتقدمة
 */
export async function getRatingsStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // جلب جميع التقييمات
  const allRatings = await db.select().from(siteRatings);

  // حساب التوزيع
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  allRatings.forEach((rating) => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      distribution[rating.rating as keyof typeof distribution]++;
    }
  });

  const totalRatings = allRatings.length;
  const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  // حساب النسب المئوية
  const percentages = {
    1: totalRatings > 0 ? (distribution[1] / totalRatings) * 100 : 0,
    2: totalRatings > 0 ? (distribution[2] / totalRatings) * 100 : 0,
    3: totalRatings > 0 ? (distribution[3] / totalRatings) * 100 : 0,
    4: totalRatings > 0 ? (distribution[4] / totalRatings) * 100 : 0,
    5: totalRatings > 0 ? (distribution[5] / totalRatings) * 100 : 0,
  };

  return {
    totalRatings,
    averageRating: Number(averageRating.toFixed(2)),
    distribution,
    percentages,
  };
}

/**
 * زيادة عداد المشاهدات لمذكرة معينة
 */
export async function incrementNotebookViewCount(notebookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notebooks)
    .set({ viewCount: sql`${notebooks.viewCount} + 1` })
    .where(eq(notebooks.id, notebookId));

  return true;
}

/**
 * زيادة عداد التحميلات لمذكرة معينة
 */
export async function incrementNotebookDownloadCount(notebookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notebooks)
    .set({ downloadCount: sql`${notebooks.downloadCount} + 1` })
    .where(eq(notebooks.id, notebookId));

  return true;
}


/**
 * تحديث عدادات المذكرة يدويًا
 * للتحكم الكامل في أرقام المشاهدات والتحميلات
 */
export async function updateNotebookCounters(
  notebookId: number,
  viewCount?: number,
  downloadCount?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = {};
  if (viewCount !== undefined) updates.viewCount = viewCount;
  if (downloadCount !== undefined) updates.downloadCount = downloadCount;

  if (Object.keys(updates).length === 0) {
    throw new Error("يجب تحديد قيمة واحدة على الأقل");
  }

  await db
    .update(notebooks)
    .set(updates)
    .where(eq(notebooks.id, notebookId));

  return true;
}

/**
 * إضافة قيمة محددة إلى عدادات المذكرة
 */
export async function addToNotebookCounters(
  notebookId: number,
  viewsToAdd?: number,
  downloadsToAdd?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = {};
  if (viewsToAdd && viewsToAdd > 0) {
    updates.viewCount = sql`${notebooks.viewCount} + ${viewsToAdd}`;
  }
  if (downloadsToAdd && downloadsToAdd > 0) {
    updates.downloadCount = sql`${notebooks.downloadCount} + ${downloadsToAdd}`;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("يجب تحديد قيمة موجبة واحدة على الأقل");
  }

  await db
    .update(notebooks)
    .set(updates)
    .where(eq(notebooks.id, notebookId));

  return true;
}

/**
 * التحديث الأسبوعي التلقائي لجميع المذكرات
 * إضافة 700 مشاهدة و 30 تحميل لكل مذكرة
 */
export async function weeklyUpdateAllNotebookCounters() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // تحديث جميع المذكرات المنشورة
  const result = await db
    .update(notebooks)
    .set({
      viewCount: sql`${notebooks.viewCount} + 700`,
      downloadCount: sql`${notebooks.downloadCount} + 30`,
    })
    .where(eq(notebooks.isPublished, true));

  return result;
}

/**
 * الحصول على جميع المذكرات مع عدادات معينة
 */
export async function getNotebooksWithCounters(filters?: {
  minViews?: number;
  minDownloads?: number;
  subjectId?: number;
  gradeId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.minViews) {
    conditions.push(gte(notebooks.viewCount, filters.minViews));
  }
  if (filters?.minDownloads) {
    conditions.push(gte(notebooks.downloadCount, filters.minDownloads));
  }
  if (filters?.subjectId) {
    conditions.push(eq(notebooks.subjectId, filters.subjectId));
  }
  if (filters?.gradeId) {
    conditions.push(eq(notebooks.gradeId, filters.gradeId));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(notebooks)
      .where(and(...conditions))
      .orderBy(desc(notebooks.viewCount));
  }

  return await db
    .select()
    .from(notebooks)
    .orderBy(desc(notebooks.viewCount));
}
