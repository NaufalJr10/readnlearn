import { z } from "zod";

// Links typed without a scheme (youtube.com/watch?v=…) get https:// prepended. A scheme followed by a
// non-digit (javascript:, ftp:, data:) is left alone so the check below rejects it; "host:8080" is not a scheme.
const withDefaultScheme = (value: string) => (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(value) || value.startsWith("//") ? value : `https://${value}`);

// Only http(s): z.url() alone would accept javascript: links that tutors and students later click.
export const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value ? withDefaultScheme(value) : value))
  .pipe(z.url("Enter a valid link"))
  .refine((value) => /^https?:\/\//i.test(value), "Links must start with http:// or https://");

const money = z.number().min(0, "Price can't be negative").max(100_000, "Price is too high");

export const courseSchema = z
  .object({
    title: z.string().trim().min(3, "Title needs at least 3 characters").max(120, "Title is too long"),
    subject: z.string().trim().min(2, "Add a subject").max(40, "Subject is too long"),
    description: z.string().trim().min(20, "Describe the course in at least 20 characters").max(5000, "Description is too long"),
    isFree: z.boolean(),
    price: money,
    discountPrice: money.nullable(),
  })
  .superRefine((course, ctx) => {
    if (course.isFree) return;
    if (course.price <= 0) ctx.addIssue({ code: "custom", path: ["price"], message: "Set a price above 0, or mark the course as free" });
    if (course.discountPrice !== null && course.discountPrice >= course.price) {
      ctx.addIssue({ code: "custom", path: ["discountPrice"], message: "Discount price must be lower than the regular price" });
    }
  })
  .transform((course) => (course.isFree ? { ...course, price: 0, discountPrice: null } : course));

export const coursePatchSchema = z.object({ isPublished: z.boolean() });

export const batchSchema = z
  .object({
    name: z.string().trim().min(2, "Name the batch").max(80, "Name is too long"),
    startDate: z.iso.date("Pick a start date"),
    endDate: z.iso.date("Pick an end date"),
  })
  .refine((batch) => batch.endDate >= batch.startDate, { path: ["endDate"], message: "End date must be on or after the start date" });

export const batchStudentsSchema = z.object({ studentIds: z.array(z.uuid()).min(1, "Choose at least one student").max(200) });

export const lessonSchema = z.object({
  title: z.string().trim().min(2, "Give the lesson a title").max(120, "Title is too long"),
  scheduledAt: z.iso.datetime({ message: "Pick a date and time" }),
  durationMinutes: z.number().int("Use whole minutes").min(5, "At least 5 minutes").max(480, "At most 8 hours"),
  description: z.string().trim().max(2000, "Description is too long").default(""),
});

export const assignmentSchema = z.object({
  title: z.string().trim().min(2, "Give the assignment a title").max(120, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").default(""),
  dueDate: z.iso.datetime({ message: "Pick a due date" }),
  maxScore: z.number().int("Use a whole number").min(1, "At least 1").max(1000, "At most 1000"),
});

export const gradeSchema = z.object({
  score: z.number().int("Use a whole number").min(0, "Score can't be negative"),
  feedback: z.string().trim().max(3000, "Feedback is too long").default(""),
});

export const announcementSchema = z.object({
  courseId: z.uuid(),
  batchId: z.uuid().nullable().default(null),
  title: z.string().trim().min(2, "Give the announcement a title").max(120, "Title is too long"),
  content: z.string().trim().min(2, "Write the announcement").max(5000, "Announcement is too long"),
});

export const materialSchema = z.object({
  title: z.string().trim().min(2, "Name the material").max(120, "Name is too long"),
  url: httpUrl,
});

export const attendanceSchema = z.object({
  records: z.array(z.object({ batchStudentId: z.uuid(), status: z.enum(["present", "absent", "late"]) })).min(1).max(500),
});

export const submissionSchema = z.object({ submissionUrl: httpUrl });

export const reviewSchema = z.object({
  courseId: z.uuid(),
  rating: z.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(2000, "Review is too long").default(""),
});

export const messageSchema = z.object({
  recipientId: z.uuid(),
  content: z.string().trim().min(1, "Write a message").max(2000, "Message is too long (2000 characters max)"),
});

export const announcementReadSchema = z.object({ ids: z.array(z.uuid()).max(200).optional() });
