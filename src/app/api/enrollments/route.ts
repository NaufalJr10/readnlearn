import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, readJson, validationFailed } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ courseId: z.uuid() });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "unauthorized", "Please log in to enroll.");
  if (session.user.role !== "student") return fail(403, "forbidden", "Only student accounts can enroll in courses.");

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return validationFailed(parsed.error);

  const [course, student] = await Promise.all([
    db.course.findFirst({ where: { id: parsed.data.courseId, isPublished: true }, select: { id: true, isFree: true } }),
    db.student.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
  ]);
  if (!course) return fail(404, "not_found", "This course isn't available.");
  if (!student) return fail(403, "forbidden", "Student profile not found.");
  if (!course.isFree) return fail(402, "payment_required", "Secure checkout for paid courses is launching soon. Free courses are open now.");

  try {
    await db.courseEnrollment.create({ data: { courseId: course.id, studentId: student.id } });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
  }
  return ok({ enrolled: true }, { status: 201 });
}
