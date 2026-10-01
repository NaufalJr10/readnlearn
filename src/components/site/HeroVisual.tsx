import type { CSSProperties } from "react";
import { CalendarClock, CheckCircle2, Flame, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { Avatar } from "../ui/Avatar";

const PROGRESS = 68;

const lessons = [
  { title: "Derivatives: chain rule", time: "Today · 5:00 PM", done: false },
  { title: "Limits practice set", time: "Graded · 18/20", done: true },
];

/** Decorative product preview for the hero; purely presentational. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg sm:pb-32 lg:max-w-none" aria-hidden>
      {/* Ambient glow, slowly drifting */}
      <div className="absolute -inset-6 -z-10 overflow-hidden rounded-[2.5rem] blur-2xl">
        <div className="animate-drift absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-transparent" />
        <div className="animate-drift absolute -right-10 -bottom-10 size-56 rounded-full bg-accent/20 [animation-delay:-7s]" />
      </div>

      {/* Streak chip */}
      <div className="animate-fade-up absolute -top-4 left-6 z-10 hidden [animation-delay:600ms] sm:block">
        <div className="animate-float flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-lift [animation-delay:-2s]">
          <Flame className="size-3.5 text-warning" />
          7-day streak
        </div>
      </div>

      {/* Main progress card */}
      <div className="group animate-fade-up rounded-3xl border border-border bg-surface p-5 shadow-lift transition-[transform,box-shadow,border-color] duration-500 ease-out [animation-delay:150ms] hover:-translate-y-1 hover:border-primary/30 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Your progress</p>
            <p className="mt-1 font-display text-2xl font-extrabold">Calculus Made Clear</p>
          </div>
          <span className="animate-pop flex size-11 items-center justify-center rounded-2xl bg-success-soft text-success transition-transform duration-300 [animation-delay:500ms] group-hover:-rotate-6 group-hover:scale-110">
            <TrendingUp className="size-5" />
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full overflow-hidden rounded-full" style={{ width: `${PROGRESS}%` }}>
            <div className="animate-grow-x relative h-full origin-left rounded-full bg-gradient-to-r from-primary to-accent [animation-delay:450ms]">
              <div className="animate-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent [animation-delay:1.9s]" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-fg-muted">
          <span>17 of 25 lessons</span>
          <span
            className="count-up font-semibold text-fg [animation-delay:450ms]"
            style={{ "--count-to": PROGRESS } as CSSProperties}
          />
        </div>

        <div className="mt-6 space-y-3">
          {lessons.map((item, i) => (
            <div
              key={item.title}
              className="animate-fade-up flex items-center gap-3 rounded-2xl border border-border bg-bg p-3.5 transition-colors duration-300 hover:border-primary/40"
              style={{ animationDelay: `${550 + i * 120}ms` }}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.done ? "bg-success-soft text-success" : "bg-primary-soft text-primary"}`}>
                {item.done ? (
                  <CheckCircle2 className="animate-pop size-5" style={{ animationDelay: `${900 + i * 120}ms` }} />
                ) : (
                  <CalendarClock className="size-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-fg-subtle">{item.time}</p>
              </div>
              {!item.done && (
                <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-soft-fg">
                  <span className="relative flex size-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary" />
                    <span className="relative size-1.5 rounded-full bg-primary" />
                  </span>
                  Up next
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tutor message: typing indicator, then the message lands */}
      <div className="animate-fade-up absolute bottom-0 -left-4 hidden w-64 [animation-delay:350ms] sm:block lg:-left-10">
        <div className="animate-float rounded-2xl border border-border bg-surface p-4 shadow-lift [animation-delay:-4s]">
          <div className="flex items-center gap-3">
            <span className="relative">
              <Avatar name="Amara Okafor" className="size-10 text-sm" />
              <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface bg-success" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Amara Okafor</p>
              <p className="text-xs text-fg-subtle">Your tutor · online</p>
            </div>
            <MessageCircle className="ml-auto size-4 text-primary" />
          </div>
          <div className="mt-3 grid">
            <div className="animate-fade-out flex items-center gap-1 self-start justify-self-start rounded-xl rounded-tl-sm bg-primary-soft px-3 py-3 [grid-area:1/1] [animation-delay:2.4s]">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="animate-typing size-1.5 rounded-full bg-primary-soft-fg" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
            <p className="animate-scale-in origin-top-left rounded-xl rounded-tl-sm bg-primary-soft px-3 py-2 text-sm text-primary-soft-fg [grid-area:1/1] [animation-delay:2.5s]">
              Great work on the practice set! 🎉
            </p>
          </div>
        </div>
      </div>

      {/* Score badge */}
      <div className="animate-pop absolute -right-3 top-[58%] hidden [animation-delay:1.1s] sm:block lg:-right-8">
        <div className="animate-float relative rounded-2xl border border-border bg-surface px-4 py-3 shadow-lift">
          <Sparkles className="absolute -top-2 -right-2 size-5 animate-pulse text-warning" />
          <p className="text-xs text-fg-subtle">Assignment score</p>
          <p className="bg-gradient-to-r from-success to-teal-500 bg-clip-text font-display text-xl font-extrabold text-transparent">A+</p>
        </div>
      </div>
    </div>
  );
}
