import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateReferralCode } from "../src/lib/tokens";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const DEMO_PASSWORD = "Password@123";

type DemoCourse = { title: string; subject: string; description: string; price: number; discount?: number; free?: boolean };
type DemoTutor = { name: string; email: string; bio: string; specialties: string[]; rate: number; courses: DemoCourse[] };

const tutors: DemoTutor[] = [
  {
    name: "Amara Okafor",
    email: "amara@demo.readnlearn.com",
    bio: "Former Olympiad coach who makes calculus feel like a puzzle, not a chore. 10+ years helping students go from anxious to confident.",
    specialties: ["Mathematics", "Calculus", "Statistics"],
    rate: 45,
    courses: [
      { title: "Calculus Made Clear", subject: "Mathematics", description: "Limits, derivatives and integrals explained visually, with weekly problem sets and live walkthroughs.", price: 129, discount: 89 },
      { title: "Statistics for Everyday Decisions", subject: "Mathematics", description: "Probability, distributions and hypothesis testing using real-world data sets you actually care about.", price: 99 },
    ],
  },
  {
    name: "Daniel Reyes",
    email: "daniel@demo.readnlearn.com",
    bio: "Software engineer turned teacher. I focus on building real projects so concepts stick.",
    specialties: ["Programming", "Python", "Web Development"],
    rate: 60,
    courses: [
      { title: "Python from Zero", subject: "Programming", description: "Start coding with Python: variables, loops, functions and your first mini-apps. No experience needed.", price: 0, free: true },
      { title: "Modern Web Development", subject: "Programming", description: "HTML, CSS, JavaScript and React. Ship three portfolio projects by the end of the course.", price: 199, discount: 149 },
    ],
  },
  {
    name: "Sofia Lindqvist",
    email: "sofia@demo.readnlearn.com",
    bio: "Native Swedish speaker and certified language teacher. Conversation-first lessons that get you speaking from day one.",
    specialties: ["Languages", "English", "Swedish"],
    rate: 35,
    courses: [
      { title: "Confident English Conversation", subject: "Languages", description: "Build fluency and confidence through guided conversation, pronunciation drills and real scenarios.", price: 79 },
      { title: "Swedish for Beginners", subject: "Languages", description: "Everyday Swedish for travel and relocation: greetings, grammar essentials and practical vocabulary.", price: 69 },
    ],
  },
  {
    name: "Kwame Mensah",
    email: "kwame@demo.readnlearn.com",
    bio: "PhD in Physics. I love turning tricky mechanics and electromagnetism problems into intuitive stories.",
    specialties: ["Physics", "Chemistry", "Science"],
    rate: 50,
    courses: [
      { title: "Physics Fundamentals", subject: "Science", description: "Mechanics, energy and waves with hands-on experiments you can do at home.", price: 119 },
      { title: "Chemistry Crash Course", subject: "Science", description: "Atoms, bonding, reactions and stoichiometry: exam-focused and beginner friendly.", price: 0, free: true },
    ],
  },
  {
    name: "Priya Nair",
    email: "priya@demo.readnlearn.com",
    bio: "Published author and writing coach. I help students find their voice in essays, stories and applications.",
    specialties: ["Writing", "Literature", "Essay Coaching"],
    rate: 40,
    courses: [
      { title: "Essay Writing Masterclass", subject: "Writing", description: "Structure, argument and style. Write essays that are clear, persuasive and memorable.", price: 89, discount: 59 },
      { title: "Creative Writing Workshop", subject: "Writing", description: "Short fiction and poetry with weekly prompts and supportive peer feedback.", price: 75 },
    ],
  },
  {
    name: "Lucas Moreau",
    email: "lucas@demo.readnlearn.com",
    bio: "Designer at a product studio. I teach design thinking, Figma and the fundamentals of beautiful interfaces.",
    specialties: ["Design", "UI/UX", "Figma"],
    rate: 55,
    courses: [
      { title: "UI Design Foundations", subject: "Design", description: "Typography, color, layout and components. Design your first polished app screens in Figma.", price: 149 },
    ],
  },
];

const students = [
  { name: "Maya Chen", email: "maya@demo.readnlearn.com" },
  { name: "Omar Haddad", email: "omar@demo.readnlearn.com" },
  { name: "Ella Novak", email: "ella@demo.readnlearn.com" },
  { name: "Jonas Weber", email: "jonas@demo.readnlearn.com" },
];

const reviewComments = [
  "Incredibly clear explanations. I finally get it!",
  "Engaging lessons and very patient with questions.",
  "Great pacing and practical examples throughout.",
  "Worth every penny. Highly recommend.",
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const studentRecords = [];
  for (const s of students) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, name: s.name, passwordHash, role: "student", status: "active", student: { create: { learningGoals: ["Build confidence"] } } },
      include: { student: true },
    });
    studentRecords.push(user.student!);
  }

  for (const [ti, t] of tutors.entries()) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        name: t.name,
        passwordHash,
        role: "tutor",
        status: "active",
        tutor: { create: { bio: t.bio, specialties: t.specialties, hourlyRate: t.rate } },
      },
      include: { tutor: true },
    });
    const tutor = user.tutor!;
    if ((await db.referralLink.count({ where: { tutorId: tutor.id } })) === 0) {
      await db.referralLink.create({ data: { tutorId: tutor.id, code: generateReferralCode(), generatedByUserId: user.id } });
    }

    for (const [ci, c] of t.courses.entries()) {
      const exists = await db.course.findFirst({ where: { tutorId: tutor.id, title: c.title } });
      if (exists) continue;
      const course = await db.course.create({
        data: {
          tutorId: tutor.id,
          title: c.title,
          subject: c.subject,
          description: c.description,
          price: c.price,
          discountPrice: c.discount ?? null,
          isFree: c.free ?? false,
          isPublished: true,
        },
      });
      const reviewers = studentRecords.slice(0, 2 + ((ti + ci) % 3));
      for (const [ri, student] of reviewers.entries()) {
        await db.courseEnrollment.create({ data: { studentId: student.id, courseId: course.id, progressPercentage: (ri * 30 + 10) % 100 } });
        await db.review.create({
          data: { courseId: course.id, tutorId: tutor.id, studentId: student.id, rating: 5 - ((ri + ci) % 2), comment: reviewComments[(ri + ti) % reviewComments.length] },
        });
      }
    }
  }

  await db.$executeRaw`
    UPDATE courses c SET rating = s.avg, total_reviews = s.cnt
    FROM (SELECT course_id, ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS cnt FROM reviews GROUP BY course_id) s
    WHERE c.id = s.course_id`;
  await db.$executeRaw`
    UPDATE tutors t SET rating = s.avg, total_reviews = s.cnt
    FROM (SELECT tutor_id, ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS cnt FROM reviews GROUP BY tutor_id) s
    WHERE t.id = s.tutor_id`;

  const pendingExamples = [
    { name: "Noah Pending", email: "noah.pending@demo.readnlearn.com", role: "student" as const },
    { name: "Grace Pending", email: "grace.pending@demo.readnlearn.com", role: "tutor" as const },
  ];
  for (const p of pendingExamples) {
    await db.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        passwordHash,
        role: p.role,
        status: "pending",
        ...(p.role === "tutor" ? { tutor: { create: {} } } : { student: { create: {} } }),
      },
    });
  }

  console.log(`Demo data seeded. Demo accounts use password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
