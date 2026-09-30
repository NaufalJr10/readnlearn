import { BarChart3, CalendarCheck, LogIn, Star, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { StatCard } from "@/components/admin/StatCard";
import { Page, Section } from "@/components/dashboard/Page";
import { PageHeading } from "@/components/dashboard/PageHeading";
import { MetricChart } from "@/components/tutor/MetricChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorAnalytics } from "@/lib/tutor-data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const shortDay = (day: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));

export default async function TutorAnalyticsPage() {
  const user = await requireRole("tutor", "/tutor/analytics");
  const tutor = await db.tutor.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } });
  const { courses, batches, totals, engagement } = await getTutorAnalytics(tutor.id);

  if (courses.length === 0) {
    return (
      <Page>
        <PageHeading eyebrow="Insights" title="Analytics" />
        <EmptyState icon={BarChart3} title="No data yet" description="Create and publish a course. Enrollment, attendance and engagement numbers show up here as students join." />
      </Page>
    );
  }

  const batchLabel = (b: (typeof batches)[number]) => `${b.name}`;

  return (
    <Page>
      <PageHeading eyebrow="Insights" title="Analytics" description="How your courses, batches and students are doing." />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Enrollments" value={totals.enrollments} icon={Users} tone="primary" />
        <StatCard label="Est. revenue" value={formatPrice(totals.revenue) === "Free" ? "$0" : formatPrice(totals.revenue)} icon={Wallet} tone="success" delayMs={40} />
        <StatCard label="Avg. rating" value={totals.averageRating === null ? "New" : totals.averageRating.toFixed(1)} icon={Star} tone="warning" delayMs={80} />
        <StatCard label="Lesson completion" value={engagement.lessonCompletionRate === null ? "n/a" : `${engagement.lessonCompletionRate}%`} icon={CalendarCheck} tone="success" delayMs={120} />
        <StatCard label="Active (7 days)" value={`${engagement.activeLast7Days}/${engagement.students}`} icon={Users} tone="primary" delayMs={160} />
        <StatCard label="Avg logins (30d)" value={engagement.loginsPerStudent30d} icon={LogIn} tone="primary" delayMs={200} />
      </dl>
      <p className="-mt-6 text-sm text-fg-subtle">
        Revenue is estimated from current prices and enrollment counts. Paid checkout is not enabled yet, so no payments are recorded.
      </p>

      <Section title="Course performance">
        <div className="grid gap-6 xl:grid-cols-2">
          <MetricChart title="Enrollments by course" description="Students enrolled in each course." kind="bar" data={courses.map((c) => ({ label: c.title, value: c.enrollments }))} valueLabel="Students" integer />
          <MetricChart title="Average rating by course" description="Mean of student reviews, out of 5." kind="bar" data={courses.filter((c) => c.reviews > 0).map((c) => ({ label: c.title, value: c.rating }))} valueLabel="Rating" max={5} ticks={[0, 1, 2, 3, 4, 5]} />
        </div>
      </Section>

      <Section title="Batch performance">
        <div className="grid gap-6 xl:grid-cols-2">
          <MetricChart title="Attendance rate by batch" description="Share of marked attendance that was present or late." kind="bar" data={batches.filter((b) => b.attendanceRate !== null).map((b) => ({ label: batchLabel(b), value: b.attendanceRate! }))} valueLabel="Attendance" unit="%" max={100} />
          <MetricChart title="Average assignment score by batch" description="Mean graded score as a percentage of the maximum." kind="bar" data={batches.filter((b) => b.avgScore !== null).map((b) => ({ label: batchLabel(b), value: b.avgScore! }))} valueLabel="Avg score" unit="%" max={100} />
        </div>
      </Section>

      <Section title="Student engagement">
        <MetricChart title="Student logins, last 14 days" description="Sign-ins by students enrolled in your courses." kind="line" data={engagement.dailyLogins.map((d) => ({ label: shortDay(d.day), value: d.logins }))} valueLabel="Logins" integer />
      </Section>
    </Page>
  );
}
