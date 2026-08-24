import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enterprise HR Management System" },
      {
        name: "description",
        content:
          "One workspace for people data, attendance, leave, payroll, recruitment, performance and compliance. Role-based access for HR, managers, employees and candidates.",
      },
      { property: "og:title", content: "HR — Modern Enterprise HR Management" },
      {
        property: "og:description",
        content:
          "Attendance, leave, payroll, recruitment, performance and audit trails in one beautifully fast HR platform.",
      },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: Users, title: "People & org", body: "Employee records, org chart, documents, lifecycle status and onboarding." },
  { icon: CalendarClock, title: "Time & attendance", body: "Clock in/out, remote days, timesheets and late-arrival insights." },
  { icon: BriefcaseBusiness, title: "Recruitment", body: "Job postings, public careers page and a candidate pipeline from applied to hired." },
  { icon: Wallet, title: "Payroll", body: "Salary structures, payslips, bonuses and payroll run history." },
  { icon: Gauge, title: "Performance", body: "Review cycles, goal tracking, ratings and calibration-ready summaries." },
  { icon: ShieldCheck, title: "Compliance", body: "Role-based permissions, audit log and security event monitoring." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
            HR
          </span>
          <span className="font-display text-lg font-semibold">Enterprise HR Management System</span>
          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/careers"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Careers
            </Link>
            <Button asChild size="sm">
              <Link to="/login">
                Sign in <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="hero-surface relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-current/20 bg-current/10 px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" /> Four roles. One source of truth.
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              The HR platform your whole company actually enjoys using.
            </h1>
            <p className="mt-5 max-w-xl text-base/7 opacity-80">
              HR brings people records, attendance, leave, payroll, hiring, performance and
              audit trails into a single fast workspace — with tailored views for HR managers,
              team managers, employees and candidates.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">
                  Open the workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/careers">Browse open roles</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["78", "people managed"],
                ["12", "HR modules"],
                ["4", "role dashboards"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold">{v}</dt>
                  <dd className="text-xs uppercase tracking-wider opacity-70">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="sheen absolute -inset-6 rounded-3xl blur-2xl" aria-hidden />
            <img
              src={heroImage}
              alt="HR analytics dashboard showing headcount, attendance and team activity"
              width={1600}
              height={1008}
              className="relative rounded-2xl border border-current/15 shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-semibold">Everything an HR team runs on</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Modules are permission-aware: people only ever see the data their role allows.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <article key={m.title} className="surface-card p-6 transition-shadow hover:shadow-lg">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <m.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{m.title}</h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">{m.body}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-10 text-sm text-muted-foreground">
        <span className="font-display font-semibold text-foreground">HR</span>
        <span>Enterprise HR Management System</span>
        <Link to="/careers" className="ml-auto hover:text-foreground">
          Careers
        </Link>
        <Link to="/login" className="hover:text-foreground">
          Sign in
        </Link>
      </footer>
    </div>
  );
}
