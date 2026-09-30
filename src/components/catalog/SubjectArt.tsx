import { BookOpen, Calculator, Code2, FlaskConical, Languages, Palette, PenLine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects: Record<string, { icon: LucideIcon; gradient: string }> = {
  Mathematics: { icon: Calculator, gradient: "from-indigo-500 via-indigo-600 to-violet-600" },
  Programming: { icon: Code2, gradient: "from-slate-700 via-indigo-800 to-indigo-600" },
  Languages: { icon: Languages, gradient: "from-sky-500 via-sky-600 to-indigo-600" },
  Science: { icon: FlaskConical, gradient: "from-emerald-500 via-teal-600 to-cyan-700" },
  Writing: { icon: PenLine, gradient: "from-rose-500 via-fuchsia-600 to-purple-700" },
  Design: { icon: Palette, gradient: "from-amber-500 via-orange-500 to-rose-500" },
};

const fallback = { icon: BookOpen, gradient: "from-violet-500 via-purple-600 to-indigo-700" };

export function SubjectArt({ subject, className }: { subject: string; className?: string }) {
  const { icon: Icon, gradient } = subjects[subject] ?? fallback;
  return (
    <div className={cn("relative h-36 overflow-hidden bg-gradient-to-br", gradient, className)} aria-hidden>
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute -bottom-12 left-6 size-32 rounded-full bg-white/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.18)_1px,transparent_0)] bg-[length:18px_18px]" />
      <Icon className="absolute bottom-5 right-5 size-12 text-white/90 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.6} />
    </div>
  );
}
