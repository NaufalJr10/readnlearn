import { AppShell } from "@/components/dashboard/AppShell";
import { UnreadProvider } from "@/components/dashboard/UnreadProvider";
import { requireRole } from "@/lib/auth";
import { unreadMessageCount } from "@/lib/student-data";

export default async function TutorLayout({ children }: LayoutProps<"/tutor">) {
  const user = await requireRole("tutor", "/tutor");
  const messages = await unreadMessageCount(user.id);

  return (
    <UnreadProvider initial={{ messages, announcements: 0 }}>
      <AppShell role="tutor" name={user.name ?? "Account"}>
        {children}
      </AppShell>
    </UnreadProvider>
  );
}
