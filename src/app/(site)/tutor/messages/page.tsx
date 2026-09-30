import type { Metadata } from "next";
import { MessagesComingSoon } from "@/components/dashboard/ComingSoon";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Messages" };

export default async function TutorMessagesPage() {
  await requireRole("tutor", "/tutor/messages");
  return <MessagesComingSoon backHref="/tutor" />;
}
