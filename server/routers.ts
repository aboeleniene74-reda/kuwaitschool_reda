import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

// Middleware للتحقق من صلاحيات المعلم أو المدير
const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'teacher' && ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'يجب أن تكون معلماً للوصول إلى هذه الميزة' 
    });
  }
  return next({ ctx });
});

// Middleware للتحقق من صلاحيات الطالب
const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'student' && ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'يجب أن تكون طالباً للوصول إلى هذه الميزة' 
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ المواد الدراسية ============
  subjects: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSubjects();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubjectById(input.id);
      }),

    create: teacherProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createSubject({
          ...input,
          teacherId: ctx.user.id,
        });
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSubject(id, data);
        return { success: true };
      }),
  }),

  // ============ الدروس ============
  lessons: router({
    listBySubject: publicProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLessonsBySubject(input.subjectId);
      }),

    listForTeacher: teacherProcedure
      .input(z.object({ subjectId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAllLessonsForTeacher(input.subjectId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLessonById(input.id);
      }),

    create: teacherProcedure
      .input(z.object({
        subjectId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        pdfUrl: z.string().optional(),
        orderIndex: z.number().default(0),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createLesson(input);
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        pdfUrl: z.string().optional(),
        orderIndex: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLesson(id, data);
        return { success: true };
      }),

    markComplete: studentProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.markLessonComplete(input.lessonId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ الاختبارات ============
  quizzes: router({
    listBySubject: publicProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuizzesBySubject(input.subjectId);
      }),

    listForTeacher: teacherProcedure
      .input(z.object({ subjectId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAllQuizzesForTeacher(input.subjectId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuizById(input.id);
      }),

    create: teacherProcedure
      .input(z.object({
        subjectId: z.number(),
        lessonId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        duration: z.number().optional(),
        passingScore: z.string().optional(),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createQuiz(input);
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        passingScore: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateQuiz(id, data);
        return { success: true };
      }),
  }),

  // ============ الأسئلة ============
  questions: router({
    listByQuiz: publicProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionsByQuiz(input.quizId);
      }),

    create: teacherProcedure
      .input(z.object({
        quizId: z.number(),
        questionText: z.string().min(1),
        optionA: z.string().min(1),
        optionB: z.string().min(1),
        optionC: z.string().min(1),
        optionD: z.string().min(1),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
        points: z.string().default("1.00"),
        orderIndex: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createQuestion(input);
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        questionText: z.string().optional(),
        optionA: z.string().optional(),
        optionB: z.string().optional(),
        optionC: z.string().optional(),
        optionD: z.string().optional(),
        correctAnswer: z.enum(["A", "B", "C", "D"]).optional(),
        points: z.string().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateQuestion(id, data);
        return { success: true };
      }),

    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
  }),

  // ============ محاولات الاختبارات ============
  attempts: router({
    submit: studentProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          selectedAnswer: z.enum(["A", "B", "C", "D"]),
        })),
        startedAt: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        const questions = await db.getQuestionsByQuiz(input.quizId);
        let score = 0;
        let totalPoints = 0;

        const answersData = input.answers.map(answer => {
          const question = questions.find(q => q.id === answer.questionId);
          if (!question) return null;

          const isCorrect = question.correctAnswer === answer.selectedAnswer;
          const points = parseFloat(question.points);
          totalPoints += points;
          if (isCorrect) score += points;

          return {
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
          };
        }).filter(Boolean);

        const quiz = await db.getQuizById(input.quizId);
        const passingScore = quiz?.passingScore ? parseFloat(quiz.passingScore) : 0;
        const isPassed = score >= passingScore;

        const attemptResult = await db.createQuizAttempt({
          quizId: input.quizId,
          studentId: ctx.user.id,
          score: score.toString(),
          totalPoints: totalPoints.toString(),
          isPassed,
          startedAt: input.startedAt,
          completedAt: new Date(),
        });

        const attemptId = Number((attemptResult as any).insertId);

        for (const answerData of answersData) {
          if (answerData) {
            await db.createStudentAnswer({
              attemptId,
              ...answerData,
            });
          }
        }

        return {
          attemptId,
          score,
          totalPoints,
          isPassed,
        };
      }),

    myAttempts: studentProcedure
      .input(z.object({ quizId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        return await db.getStudentQuizAttempts(ctx.user.id, input.quizId);
      }),
  }),

  // ============ الواجبات ============
  assignments: router({
    listBySubject: publicProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssignmentsBySubject(input.subjectId);
      }),

    listForTeacher: teacherProcedure
      .input(z.object({ subjectId: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAllAssignmentsForTeacher(input.subjectId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAssignmentById(input.id);
      }),

    create: teacherProcedure
      .input(z.object({
        subjectId: z.number(),
        lessonId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date(),
        maxScore: z.string().default("100.00"),
        isPublished: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createAssignment(input);
      }),

    update: teacherProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        maxScore: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAssignment(id, data);
        return { success: true };
      }),
  }),

  // ============ تسليمات الواجبات ============
  submissions: router({
    submit: studentProcedure
      .input(z.object({
        assignmentId: z.number(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `submissions/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return await db.createSubmission({
          assignmentId: input.assignmentId,
          studentId: ctx.user.id,
          fileUrl: url,
          fileKey,
          notes: input.notes,
        });
      }),

    mySubmission: studentProcedure
      .input(z.object({ assignmentId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getStudentSubmission(input.assignmentId, ctx.user.id);
      }),

    listByAssignment: teacherProcedure
      .input(z.object({ assignmentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubmissionsByAssignment(input.assignmentId);
      }),

    grade: teacherProcedure
      .input(z.object({
        id: z.number(),
        score: z.string(),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSubmission(id, {
          ...data,
          isGraded: true,
          gradedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  // ============ التقدم والإحصائيات ============
  progress: router({
    myProgress: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentProgress(ctx.user.id);
    }),

    myStats: studentProcedure.query(async ({ ctx }) => {
      return await db.getStudentStats(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
