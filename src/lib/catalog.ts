import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "./db";

// These expressions must match the GIN expression indexes in prisma/migrations/*_fts_expression_indexes.
const COURSE_TSV = Prisma.sql`(
  setweight(to_tsvector('english', coalesce(c.title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(c.subject, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(c.description, '')), 'C'))`;
const TUTOR_TSV = Prisma.sql`to_tsvector('english', coalesce(t.bio, ''))`;

export const PAGE_SIZE = 12;

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  rating: number;
  totalReviews: number;
  enrollmentCount: number;
  tutor: { id: string; name: string };
};

export type TutorSummary = {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  profileImageUrl: string | null;
  courseCount: number;
};

export type CourseFilters = { tutorId?: string; q?: string; subject?: string; price?: string; minRating?: string; sort?: string; page?: string };
export type TutorFilters = { q?: string; specialty?: string; minRating?: string; sort?: string; page?: string };

type CourseRow = {
  id: string; title: string; description: string; subject: string; price: Prisma.Decimal; discount_price: Prisma.Decimal | null;
  is_free: boolean; rating: Prisma.Decimal; total_reviews: number; enrollment_count: bigint; tutor_id: string; tutor_name: string; total: bigint;
};

type TutorRow = {
  id: string; name: string; bio: string; specialties: string[]; hourly_rate: Prisma.Decimal; rating: Prisma.Decimal;
  total_reviews: number; profile_image_url: string | null; course_count: bigint; total: bigint;
};

function pageNumber(page?: string) {
  const n = Number(page);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function ratingFloor(minRating?: string) {
  const n = Number(minRating);
  return Number.isFinite(n) && n > 0 && n <= 5 ? n : null;
}

function toCourse(r: CourseRow): CourseSummary {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    subject: r.subject,
    price: Number(r.price),
    discountPrice: r.discount_price === null ? null : Number(r.discount_price),
    isFree: r.is_free,
    rating: Number(r.rating),
    totalReviews: r.total_reviews,
    enrollmentCount: Number(r.enrollment_count),
    tutor: { id: r.tutor_id, name: r.tutor_name },
  };
}

function toTutor(r: TutorRow): TutorSummary {
  return {
    id: r.id,
    name: r.name,
    bio: r.bio,
    specialties: r.specialties,
    hourlyRate: Number(r.hourly_rate),
    rating: Number(r.rating),
    totalReviews: r.total_reviews,
    profileImageUrl: r.profile_image_url,
    courseCount: Number(r.course_count),
  };
}

export async function searchCourses(filters: CourseFilters) {
  const q = filters.q?.trim().slice(0, 100) ?? "";
  const page = pageNumber(filters.page);
  const minRating = ratingFloor(filters.minRating);
  const conditions: Prisma.Sql[] = [Prisma.sql`c.is_published = true`, Prisma.sql`u.status = 'active'`];

  if (q) conditions.push(Prisma.sql`(${COURSE_TSV} @@ websearch_to_tsquery('english', ${q}) OR u.name ILIKE ${"%" + q + "%"})`);
  if (filters.tutorId) conditions.push(Prisma.sql`c.tutor_id = ${filters.tutorId}::uuid`);
  if (filters.subject) conditions.push(Prisma.sql`c.subject = ${filters.subject}`);
  if (filters.price === "free") conditions.push(Prisma.sql`c.is_free = true`);
  if (filters.price === "paid") conditions.push(Prisma.sql`c.is_free = false`);
  if (minRating !== null) conditions.push(Prisma.sql`c.rating >= ${minRating}`);

  const effective = Prisma.sql`CASE WHEN c.is_free THEN 0 ELSE coalesce(c.discount_price, c.price) END`;
  const orderBy = {
    rating: Prisma.sql`c.rating DESC, c.total_reviews DESC`,
    price_asc: Prisma.sql`${effective} ASC`,
    price_desc: Prisma.sql`${effective} DESC`,
    newest: Prisma.sql`c.created_at DESC`,
  }[filters.sort ?? ""] ?? (q ? Prisma.sql`ts_rank(${COURSE_TSV}, websearch_to_tsquery('english', ${q})) DESC, c.rating DESC` : Prisma.sql`c.rating DESC, c.created_at DESC`);

  const rows = await db.$queryRaw<CourseRow[]>`
    SELECT c.id, c.title, c.description, c.subject, c.price, c.discount_price, c.is_free, c.rating, c.total_reviews,
           (SELECT count(*) FROM course_enrollments e WHERE e.course_id = c.id) AS enrollment_count,
           t.id AS tutor_id, u.name AS tutor_name, count(*) OVER () AS total
    FROM courses c
    JOIN tutors t ON t.id = c.tutor_id
    JOIN users u ON u.id = t.user_id
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY ${orderBy}, c.id
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`;

  return { courses: rows.map(toCourse), total: rows.length ? Number(rows[0]!.total) : 0, page };
}

export async function searchTutors(filters: TutorFilters) {
  const q = filters.q?.trim().slice(0, 100) ?? "";
  const page = pageNumber(filters.page);
  const minRating = ratingFloor(filters.minRating);
  const conditions: Prisma.Sql[] = [Prisma.sql`u.status = 'active'`];

  if (q) {
    conditions.push(Prisma.sql`(${TUTOR_TSV} @@ websearch_to_tsquery('english', ${q})
      OR u.name ILIKE ${"%" + q + "%"}
      OR EXISTS (SELECT 1 FROM unnest(t.specialties) s WHERE s ILIKE ${"%" + q + "%"}))`);
  }
  if (filters.specialty) conditions.push(Prisma.sql`t.specialties @> ARRAY[${filters.specialty}]::text[]`);
  if (minRating !== null) conditions.push(Prisma.sql`t.rating >= ${minRating}`);

  const orderBy = {
    rate_asc: Prisma.sql`t.hourly_rate ASC`,
    rate_desc: Prisma.sql`t.hourly_rate DESC`,
    reviews: Prisma.sql`t.total_reviews DESC`,
  }[filters.sort ?? ""] ?? Prisma.sql`t.rating DESC, t.total_reviews DESC`;

  const rows = await db.$queryRaw<TutorRow[]>`
    SELECT t.id, u.name, t.bio, t.specialties, t.hourly_rate, t.rating, t.total_reviews, t.profile_image_url,
           (SELECT count(*) FROM courses c WHERE c.tutor_id = t.id AND c.is_published) AS course_count,
           count(*) OVER () AS total
    FROM tutors t
    JOIN users u ON u.id = t.user_id
    WHERE ${Prisma.join(conditions, " AND ")}
    ORDER BY ${orderBy}, t.id
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`;

  return { tutors: rows.map(toTutor), total: rows.length ? Number(rows[0]!.total) : 0, page };
}

export async function listSubjects() {
  const rows = await db.course.groupBy({ by: ["subject"], where: { isPublished: true }, orderBy: { subject: "asc" } });
  return rows.map((r) => r.subject);
}

export async function listSpecialties() {
  const rows = await db.$queryRaw<{ specialty: string }[]>`
    SELECT DISTINCT unnest(t.specialties) AS specialty FROM tutors t JOIN users u ON u.id = t.user_id
    WHERE u.status = 'active' ORDER BY 1`;
  return rows.map((r) => r.specialty);
}

export async function featuredCourses() {
  return (await searchCourses({ sort: "rating" })).courses.slice(0, 6);
}

export async function platformStats() {
  const [courses, tutors, students, ratings] = await Promise.all([
    db.course.count({ where: { isPublished: true } }),
    db.user.count({ where: { role: "tutor", status: "active" } }),
    db.user.count({ where: { role: "student", status: "active" } }),
    db.review.aggregate({ _avg: { rating: true } }),
  ]);
  return { courses, tutors, students, averageRating: ratings._avg.rating };
}

export async function getCourse(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const course = await db.course.findFirst({
    where: { id, isPublished: true, tutor: { user: { status: "active" } } },
    include: {
      tutor: { include: { user: { select: { name: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10, include: { student: { include: { user: { select: { name: true } } } } } },
      _count: { select: { enrollments: true, batches: true } },
    },
  });
  if (!course) return null;
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    subject: course.subject,
    price: Number(course.price),
    discountPrice: course.discountPrice === null ? null : Number(course.discountPrice),
    isFree: course.isFree,
    rating: Number(course.rating),
    totalReviews: course.totalReviews,
    enrollmentCount: course._count.enrollments,
    batchCount: course._count.batches,
    updatedAt: course.updatedAt.toISOString(),
    tutor: {
      id: course.tutor.id,
      name: course.tutor.user.name,
      bio: course.tutor.bio,
      specialties: course.tutor.specialties,
      rating: Number(course.tutor.rating),
      totalReviews: course.tutor.totalReviews,
    },
    reviews: course.reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, author: r.student.user.name, createdAt: r.createdAt.toISOString() })),
  };
}

export async function getTutor(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const tutor = await db.tutor.findFirst({
    where: { id, user: { status: "active" } },
    include: {
      user: { select: { id: true, name: true, createdAt: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10, include: { student: { include: { user: { select: { name: true } } } }, course: { select: { title: true } } } },
    },
  });
  if (!tutor) return null;
  const { courses } = await searchCourses({ tutorId: tutor.id, sort: "rating" });
  return {
    id: tutor.id,
    userId: tutor.user.id,
    name: tutor.user.name,
    bio: tutor.bio,
    specialties: tutor.specialties,
    hourlyRate: Number(tutor.hourlyRate),
    rating: Number(tutor.rating),
    totalReviews: tutor.totalReviews,
    joinedAt: tutor.user.createdAt.toISOString(),
    courses,
    reviews: tutor.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: r.student.user.name,
      courseTitle: r.course.title,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
