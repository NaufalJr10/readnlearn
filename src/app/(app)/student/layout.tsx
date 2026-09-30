import { AppShell } from "@/components/dashboard/AppShell";
import { UnreadProvider } from "@/components/dashboard/UnreadProvider";
import { requireRole } from "@/lib/auth";
import { getStudentByUserId, unreadAnnouncementCount, unreadMessageCount } from "@/lib/student-data";

export default async function StudentLayout({ children }: LayoutProps<"/student">) {
  const user = await requireRole("student", "/student");
  const messages = await unreadMessageCount(user.id);
  const student = "student" === "student" ? await getStudentByUserId(user.id) : null;
  const announcements = student ? await unreadAnnouncementCount(user.id, student.id) : 0;

  return (
    <UnreadProvider initial={{ messages, announcements }}>
      <AppShell role="student" name={user.name ?? "Account"}>
        {children}
      </AppShell>
    </UnreadProvider>
  );
}
