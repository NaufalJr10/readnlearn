import type { Metadata } from "next";
import { MessagesScreen } from "@/components/messages/MessagesScreen";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function TutorMessagesPage({ searchParams }: PageProps<"/tutor/messages">) {
  const { with: withId } = await searchParams;
  return <MessagesScreen role="tutor" withId={typeof withId === "string" ? withId : undefined} />;
}
