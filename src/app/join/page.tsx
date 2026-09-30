import { redirect } from "next/navigation";

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const { ref } = await searchParams;
  redirect(typeof ref === "string" ? `/signup?ref=${encodeURIComponent(ref)}` : "/signup");
}
