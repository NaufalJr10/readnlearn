import { CalendarClock, CheckCircle2, MessageCircle, TrendingUp } from "lucide-react";
import { Avatar } from "../ui/Avatar";

/** Decorative product preview for the hero; purely presentational. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg sm:pb-32 lg:max-w-none" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />

      <div className="animate-fade-up rounded-3xl border border-border bg-surface p-5 shadow-lift [animation-delay:150ms] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Your progress</p>
            <p className="mt-1 font-display text-2xl font-extrabold">Calculus Made Clear</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success">
            <TrendingUp className="size-5" />
          </span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <div className="mt-2 flex justify-between text-sm text-fg-muted">
          <span>17 of 25 lessons</span>
          <span className="font-semibold text-fg">68%</span>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { title: "Derivatives: chain rule", time: "Today · 5:00 PM", done: false },
            { title: "Limits practice set", time: "Graded · 18/20", done: true },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-border bg-bg p-3.5">
              <span className={`flex size-10 items-center justify-center rounded-xl ${item.done ? "bg-success-soft text-success" : "bg-primary-soft text-primary"}`}>
                {item.done ? <CheckCircle2 className="size-5" /> : <CalendarClock className="size-5" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-fg-subtle">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-up absolute bottom-0 -left-4 hidden w-64 rounded-2xl border border-border bg-surface p-4 shadow-lift [animation-delay:350ms] sm:block lg:-left-10">
        <div className="flex items-center gap-3">
          <Avatar name="Amara Okafor" className="size-10 text-sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Amara Okafor</p>
            <p className="text-xs text-fg-subtle">Your tutor · online</p>
          </div>
          <MessageCircle className="ml-auto size-4 text-primary" />
        </div>
        <p className="mt-3 rounded-xl rounded-tl-sm bg-primary-soft px-3 py-2 text-sm text-primary-soft-fg">Great work on the practice set! 🎉</p>
      </div>

      <div className="animate-fade-up absolute -right-3 top-[44%] hidden rounded-2xl border border-border bg-surface px-4 py-3 shadow-lift [animation-delay:450ms] sm:block lg:-right-8">
        <p className="text-xs text-fg-subtle">Assignment score</p>
        <p className="font-display text-xl font-extrabold text-success">A+</p>
      </div>
    </div>
  );
}
