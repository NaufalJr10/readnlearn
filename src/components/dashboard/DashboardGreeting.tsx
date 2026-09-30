export function DashboardGreeting({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="animate-fade-up">
      <p className="text-sm font-bold uppercase tracking-wider text-primary">Dashboard</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Hi {name.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-lg text-fg-muted">{subtitle}</p>
    </div>
  );
}
