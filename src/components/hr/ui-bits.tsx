import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
  icon?: ReactNode | undefined;
  tone?: "default" | "primary" | "warning" | "success";
}) {
  const toneRing = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success",
  }[tone];

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? (
          <span className={cn("grid size-10 place-items-center rounded-xl", toneRing)}>{icon}</span>
        ) : null}
      </div>
    </div>
  );
}

const statusTones: Record<string, string> = {
  active: "bg-success/12 text-success border-success/25",
  approved: "bg-success/12 text-success border-success/25",
  present: "bg-success/12 text-success border-success/25",
  done: "bg-success/12 text-success border-success/25",
  paid: "bg-success/12 text-success border-success/25",
  hired: "bg-success/12 text-success border-success/25",
  open: "bg-success/12 text-success border-success/25",
  acknowledged: "bg-success/12 text-success border-success/25",
  pending: "bg-warning/15 text-warning-foreground border-warning/35",
  probation: "bg-warning/15 text-warning-foreground border-warning/35",
  late: "bg-warning/15 text-warning-foreground border-warning/35",
  review: "bg-warning/15 text-warning-foreground border-warning/35",
  processing: "bg-warning/15 text-warning-foreground border-warning/35",
  paused: "bg-warning/15 text-warning-foreground border-warning/35",
  screening: "bg-warning/15 text-warning-foreground border-warning/35",
  warning: "bg-warning/15 text-warning-foreground border-warning/35",
  rejected: "bg-destructive/10 text-destructive border-destructive/25",
  absent: "bg-destructive/10 text-destructive border-destructive/25",
  offboarded: "bg-destructive/10 text-destructive border-destructive/25",
  closed: "bg-destructive/10 text-destructive border-destructive/25",
  critical: "bg-destructive/10 text-destructive border-destructive/25",
  high: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusPill({ value }: { value: string }) {
  const tone = statusTones[value] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tone,
      )}
    >
      {value.replace(/-/g, " ")}
    </span>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-semibold text-primary",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="surface-card grid place-items-center px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "PKR", maximumFractionDigits: 0 })
    .format(n);
