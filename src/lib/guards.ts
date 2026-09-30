import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";

export async function requireTutor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "tutor") return null;
  const tutor = await db.tutor.findUnique({ where: { userId: session.user.id }, include: { user: { select: { id: true, name: true } } } });
  return tutor;
}

export async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "student") return null;
  const student = await db.student.findUnique({ where: { userId: session.user.id }, include: { user: { select: { id: true, name: true } } } });
  return student;
}

export async function requireSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}
