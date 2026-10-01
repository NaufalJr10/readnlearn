import { assignmentSchema, batchSchema, courseSchema, gradeSchema, httpUrl, lessonSchema, messageSchema } from "../schemas";

const course = { title: "Calculus Made Clear", subject: "Mathematics", description: "Limits, derivatives and integrals explained visually.", isFree: false, price: 100, discountPrice: 80 };

describe("courseSchema", () => {
  it("accepts a valid paid course with a discount", () => {
    expect(courseSchema.safeParse(course).success).toBe(true);
  });

  it("requires a positive price unless the course is free", () => {
    expect(courseSchema.safeParse({ ...course, price: 0, discountPrice: null }).success).toBe(false);
  });

  it("rejects a discount that is not below the price", () => {
    expect(courseSchema.safeParse({ ...course, discountPrice: 100 }).success).toBe(false);
    expect(courseSchema.safeParse({ ...course, discountPrice: 120 }).success).toBe(false);
  });

  it("normalizes free courses to price 0 and no discount", () => {
    const result = courseSchema.parse({ ...course, isFree: true });
    expect(result).toMatchObject({ isFree: true, price: 0, discountPrice: null });
  });

  it("rejects short titles and descriptions", () => {
    expect(courseSchema.safeParse({ ...course, title: "ab" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...course, description: "too short" }).success).toBe(false);
  });
});

describe("httpUrl", () => {
  it.each(["https://example.com/work", "http://example.com"])("accepts %s", (url) => expect(httpUrl.safeParse(url).success).toBe(true));
  it("adds https:// to links typed without a scheme", () => {
    expect(httpUrl.parse("youtube.com/watch?v=0lbo_9fB7XY")).toBe("https://youtube.com/watch?v=0lbo_9fB7XY");
    expect(httpUrl.parse("www.example.com")).toBe("https://www.example.com");
  });
  it.each(["javascript:alert(1)", "ftp://example.com", "data:text/html,hi", "not a url", ""])("rejects %p", (url) => expect(httpUrl.safeParse(url).success).toBe(false));
});

describe("batchSchema", () => {
  it("allows a single-day batch but not an end before the start", () => {
    expect(batchSchema.safeParse({ name: "Evening", startDate: "2026-10-01", endDate: "2026-10-01" }).success).toBe(true);
    expect(batchSchema.safeParse({ name: "Evening", startDate: "2026-10-02", endDate: "2026-10-01" }).success).toBe(false);
  });
});

describe("lessonSchema", () => {
  const lesson = { title: "Chain rule", scheduledAt: "2026-10-05T17:00:00.000Z", durationMinutes: 60 };
  it("accepts ISO datetimes and defaults the description", () => {
    expect(lessonSchema.parse(lesson).description).toBe("");
  });
  it("rejects bad datetimes and out-of-range durations", () => {
    expect(lessonSchema.safeParse({ ...lesson, scheduledAt: "tomorrow" }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...lesson, durationMinutes: 2 }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...lesson, durationMinutes: 600 }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...lesson, durationMinutes: 45.5 }).success).toBe(false);
  });
});

describe("assignmentSchema and gradeSchema", () => {
  it("requires a positive whole max score", () => {
    const base = { title: "Homework", dueDate: "2026-10-05T17:00:00.000Z" };
    expect(assignmentSchema.safeParse({ ...base, maxScore: 100 }).success).toBe(true);
    expect(assignmentSchema.safeParse({ ...base, maxScore: 0 }).success).toBe(false);
  });
  it("does not allow negative scores", () => {
    expect(gradeSchema.safeParse({ score: -1 }).success).toBe(false);
    expect(gradeSchema.parse({ score: 7 }).feedback).toBe("");
  });
});

describe("messageSchema", () => {
  const recipientId = "5a507c6d-48d5-4022-8b24-dde2a9e686f9";
  it("trims and rejects blank or oversized messages", () => {
    expect(messageSchema.parse({ recipientId, content: "  hello  " }).content).toBe("hello");
    expect(messageSchema.safeParse({ recipientId, content: "   " }).success).toBe(false);
    expect(messageSchema.safeParse({ recipientId, content: "x".repeat(2001) }).success).toBe(false);
  });
  it("requires a UUID recipient", () => {
    expect(messageSchema.safeParse({ recipientId: "abc", content: "hi" }).success).toBe(false);
  });
});
