import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { db } from "@/lib/db";
import { hit, POLICIES } from "@/lib/rate-limit";

export const metadata: Metadata = { title: "Create your account" };

async function lookupReferral(code: string | undefined) {
  if (!code || !/^[a-z0-9]{4,32}$/i.test(code)) return null;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await hit(`referral-lookup:${ip}`, POLICIES.referralLookup)).allowed) return null;
  const link = await db.referralLink.findUnique({ where: { code: code.toLowerCase() }, include: { tutor: { include: { user: { select: { name: true } } } } } });
  return link ? { code: link.code, tutorName: link.tutor.user.name } : null;
}

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const ref = typeof params.ref === "string" ? params.ref : undefined;
  const referral = await lookupReferral(ref);
  const initialRole = params.role === "tutor" ? "tutor" : "student";

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Create your account</h1>
      <p className="mt-2 text-fg-muted">Join as a student or tutor. Our team reviews every new account to keep ReadnLearn safe.</p>
      <div className="mt-8">
        <SignupForm initialRole={initialRole} referral={referral} />
      </div>
      <p className="mt-8 text-center text-fg-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
