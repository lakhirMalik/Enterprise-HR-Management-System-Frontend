import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHR } from "@/lib/hr/store";
import { StatusPill, money } from "@/components/hr/ui-bits";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at — Open roles" },
      {
        name: "description",
        content: "Explore open roles at across engineering, design, people ops, finance and support.",
      },
      { property: "og:title", content: "Careers at — Open roles" },
      { property: "og:description", content: "Join a team building the modern HR platform. See every open role." },
    ],
  }),
  component: Careers,
});

function Careers() {
  const { jobs, fetchJobs } = useHR();

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = jobs.filter((j) => j.status !== "closed");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
              N
            </span>
            <span className="font-display text-lg font-semibold">HR</span>
          </Link>
          <Button asChild size="sm" className="ml-auto">
            <Link to="/login">Candidate sign in</Link>
          </Button>
        </div>
      </header>

      <section className="hero-surface">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">Build the future of work</h1>
          <p className="mt-4 max-w-xl opacity-80">
            We are hiring across six departments, remote-friendly and globally distributed. Apply
            once, track your progress in the candidate portal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-display text-2xl font-semibold">{open.length} open roles</h2>
        <div className="mt-6 space-y-3">
          {open.map((job) => (
            <article key={job._id} className="surface-card flex flex-wrap items-center gap-4 p-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <StatusPill value={job.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {job.employmentType}
                  </span>
                  <span>{job.department}</span>
                  {job.minSalary != null && job.maxSalary != null ? (
                    <span>
                      {money(job.minSalary)} – {money(job.maxSalary)}
                    </span>
                  ) : null}
                </div>
              </div>
              <Button asChild variant="secondary">
                <Link to="/signup">
                  Apply <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
        {open.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No open roles right now — check back soon.</p>
        ) : null}
      </section>
    </div>
  );
}