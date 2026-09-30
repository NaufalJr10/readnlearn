import "server-only";
import { sendMail } from "./email";

type Recipient = { name: string; email: string };

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
const first = (name: string) => name.split(" ")[0];

const dateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date);

async function sendToAll(recipients: Recipient[], build: (recipient: Recipient) => Parameters<typeof sendMail>[0]) {
  await Promise.allSettled(recipients.map((recipient) => sendMail(build(recipient))));
}

export const notify = {
  lessonScheduled: (recipients: Recipient[], lesson: { title: string; scheduledAt: Date; durationMinutes: number; courseTitle: string; batchName: string; changed?: boolean }) =>
    sendToAll(recipients, (r) => ({
      to: r.email,
      subject: `${lesson.changed ? "Lesson updated" : "New lesson"}: ${lesson.title}`,
      heading: lesson.changed ? "A lesson was rescheduled" : "A new lesson is scheduled",
      body: [
        `Hi ${first(r.name)}, ${lesson.courseTitle} (${lesson.batchName}) has ${lesson.changed ? "an updated" : "a new"} lesson: ${lesson.title}.`,
        `When: ${dateTime(lesson.scheduledAt)} · ${lesson.durationMinutes} minutes`,
      ],
      cta: { label: "View your courses", url: `${appUrl()}/student/courses` },
    })),

  lessonCancelled: (recipients: Recipient[], lesson: { title: string; scheduledAt: Date; courseTitle: string }) =>
    sendToAll(recipients, (r) => ({
      to: r.email,
      subject: `Lesson cancelled: ${lesson.title}`,
      heading: "A lesson was cancelled",
      body: [`Hi ${first(r.name)}, the lesson "${lesson.title}" in ${lesson.courseTitle} planned for ${dateTime(lesson.scheduledAt)} has been cancelled.`],
      cta: { label: "View your courses", url: `${appUrl()}/student/courses` },
    })),

  announcement: (recipients: Recipient[], announcement: { title: string; content: string; courseTitle: string; tutorName: string }) =>
    sendToAll(recipients, (r) => ({
      to: r.email,
      subject: `[${announcement.courseTitle}] ${announcement.title}`,
      heading: announcement.title,
      body: [`From ${announcement.tutorName} in ${announcement.courseTitle}:`, announcement.content],
      cta: { label: "Read on ReadnLearn", url: `${appUrl()}/student/announcements` },
    })),

  assignmentGraded: (recipient: Recipient, graded: { assignmentTitle: string; courseTitle: string; score: number; maxScore: number; feedback: string }) =>
    sendMail({
      to: recipient.email,
      subject: `Graded: ${graded.assignmentTitle}`,
      heading: `You scored ${graded.score}/${graded.maxScore}`,
      body: [
        `Hi ${first(recipient.name)}, your submission for "${graded.assignmentTitle}" in ${graded.courseTitle} has been graded.`,
        graded.feedback ? `Feedback: ${graded.feedback}` : "Your tutor didn't leave written feedback this time.",
      ],
      cta: { label: "See your results", url: `${appUrl()}/student/courses` },
    }),

  newMessage: (recipient: Recipient, message: { fromName: string; preview: string; inboxPath: string }) =>
    sendMail({
      to: recipient.email,
      subject: `New message from ${message.fromName}`,
      heading: `${message.fromName} sent you a message`,
      body: [message.preview.length > 240 ? `${message.preview.slice(0, 237)}…` : message.preview],
      cta: { label: "Open conversation", url: `${appUrl()}${message.inboxPath}` },
    }),
};
