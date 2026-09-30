"use client";

import { BarChart3, Table2 } from "lucide-react";
import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

type Datum = { label: string; value: number };
type MetricChartProps = {
  title: string;
  description: string;
  kind: "bar" | "line";
  data: Datum[];
  valueLabel: string;
  unit?: string;
  max?: number;
  ticks?: number[];
  integer?: boolean;
};

const axisTick = { fill: "var(--fg-muted)", fontSize: 12 };

function ChartTooltip({ active, payload, label, valueLabel, unit }: { active?: boolean; payload?: { value?: number }[]; label?: string; valueLabel: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-lift">
      <p className="font-semibold text-fg">{label}</p>
      <p className="text-fg-muted">
        {valueLabel}: <span className="font-semibold text-fg">{payload[0]!.value}{unit}</span>
      </p>
    </div>
  );
}

export function MetricChart({ title, description, kind, data, valueLabel, unit = "", max, ticks, integer }: MetricChartProps) {
  const [table, setTable] = useState(false);
  const headingId = useId();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const summary = `${title}. ${data.map((d) => `${d.label}: ${d.value}${unit}`).join("; ")}.`;

  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={headingId} className="text-lg font-bold">
            {title}
          </h3>
          <p className="text-sm text-fg-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setTable((v) => !v)}
          aria-pressed={table}
          className={cn(
            "flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border-strong px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary",
            table && "border-primary bg-primary-soft text-primary-soft-fg",
          )}
        >
          {table ? <BarChart3 className="size-4" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
          {table ? "Chart" : "Table"}
        </button>
      </div>

      {data.length === 0 || (total === 0 && kind === "bar") ? (
        <p className="mt-6 rounded-xl bg-surface-muted p-6 text-center text-sm text-fg-muted">No data yet. It will appear here as your students get going.</p>
      ) : table ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-fg-subtle">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {kind === "line" ? "Day" : "Name"}
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  {valueLabel}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((d) => (
                <tr key={d.label}>
                  <th scope="row" className="py-2 pr-4 font-medium">
                    {d.label}
                  </th>
                  <td className="py-2 text-right tabular-nums">
                    {d.value}
                    {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 h-64" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            {kind === "bar" ? (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border-strong)" }} interval={0} tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={!integer} domain={[0, max ?? "auto"]} ticks={ticks} unit={unit} />
                <Tooltip cursor={{ fill: "var(--surface-muted)" }} content={<ChartTooltip valueLabel={valueLabel} unit={unit} />} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border-strong)" }} minTickGap={16} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ stroke: "var(--border-strong)" }} content={<ChartTooltip valueLabel={valueLabel} unit={unit} />} />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
