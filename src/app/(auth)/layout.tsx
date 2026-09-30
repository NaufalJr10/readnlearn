import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const points = ["Learn from reviewed, expert tutors", "Small batches with live lessons", "Feedback on every assignment"];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-white/10 blur-sm" aria-hidden />
        <div className="absolute -bottom-24 -right-16 size-96 rounded-full bg-violet-400/20" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.12)_1px,transparent_0)] bg-[length:22px_22px]" aria-hidden />
        <Logo className="relative [&_span]:text-white" />
        <div className="relative my-auto max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Your learning journey starts with one great tutor.</h2>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-lg text-indigo-100">
                <CheckCircle2 className="size-6 shrink-0 text-emerald-300" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-indigo-200">© {new Date().getFullYear()} ReadnLearn</p>
      </aside>
      <main id="main" className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
