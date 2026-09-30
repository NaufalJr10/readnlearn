import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Welcome back</h1>
      <p className="mt-2 text-fg-muted">Log in to continue learning. We&apos;ll take you to the right dashboard automatically.</p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-8 text-center text-fg-muted">
        New to ReadnLearn?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
