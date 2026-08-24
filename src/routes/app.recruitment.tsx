import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useHR, type Application, type Job } from "@/lib/hr/store";
import { PageHeader, StatCard, StatusPill, money } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/recruitment")({ component: RecruitmentPage });

const STAGES: Application["status"][] = ["submitted", "reviewing", "accepted", "rejected"];
const DEPARTMENTS = ["Engineering", "Design", "People Ops", "Sales", "Finance", "Support"];

function jobTitle(a: Application, jobs: Job[]): string {
  if (typeof a.job !== "string") return a.job.title;
  return jobs.find((j) => j._id === a.job)?.title ?? "Job";
}

function candidateName(a: Application): string {
  return typeof a.candidate === "string" ? a.candidate : a.candidate.name;
}

function RecruitmentPage() {
  const { user } = useHR();
  if (user?.role === "candidate") return <CandidateView />;
  return <RecruiterView />;
}

function RecruiterView() {
  const { user, jobs, fetchJobs, fetchJobApplications, closeJob, updateApplicationStatus } = useHR();
  const isHR = user?.role === "hr" || user?.role === "super_admin";
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // There's no single "all applications" endpoint — only per-job. HR/super_admin
  // has application:review permission, so we fetch each job's applicants and merge.
  useEffect(() => {
    if (!isHR || jobs.length === 0) return;
    setLoading(true);
    Promise.all(jobs.map((j) => fetchJobApplications(j._id)))
      .then((results) => setAllApplications(results.flat()))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR, jobs.length]);

  return (
    <>
      <PageHeader
        title="Recruitment"
        subtitle="Job postings and the candidate pipeline"
        actions={isHR ? <NewJobDialog /> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open roles" value={jobs.filter((j) => j.status === "open").length} tone="primary" />
        <StatCard label="Candidates" value={allApplications.length} />
        <StatCard label="Reviewing" value={allApplications.filter((a) => a.status === "reviewing").length} tone="warning" />
        <StatCard label="Accepted" value={allApplications.filter((a) => a.status === "accepted").length} tone="success" />
      </div>

      {!isHR ? (
        <p className="surface-card p-6 text-sm text-muted-foreground">
          Applicant details are only visible to HR. You can still view and manage job postings below.
        </p>
      ) : null}

      <Tabs defaultValue={isHR ? "pipeline" : "jobs"}>
        <TabsList>
          {isHR ? <TabsTrigger value="pipeline">Pipeline</TabsTrigger> : null}
          <TabsTrigger value="jobs">Job postings</TabsTrigger>
        </TabsList>

        {isHR ? (
          <TabsContent value="pipeline" className="mt-4">
            {loading ? <p className="text-sm text-muted-foreground">Loading applicants…</p> : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STAGES.map((stage) => {
                const items = allApplications.filter((a) => a.status === stage);
                return (
                  <section key={stage} className="rounded-xl bg-secondary/60 p-3">
                    <header className="flex items-center justify-between px-1 pb-3">
                      <h2 className="text-sm font-semibold capitalize">{stage}</h2>
                      <span className="text-xs text-muted-foreground">{items.length}</span>
                    </header>
                    <div className="space-y-3">
                      {items.map((a) => (
                        <article key={a._id} className="surface-card space-y-2 p-3">
                          <p className="text-sm font-medium">{candidateName(a)}</p>
                          <p className="text-xs text-muted-foreground">{jobTitle(a, jobs)}</p>
                          {a.coverLetter ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{a.coverLetter}</p>
                          ) : null}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {a.resumeUrl ? (
                              <a
                                href={a.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary hover:underline"
                              >
                                View resume
                              </a>
                            ) : (
                              <span className="text-muted-foreground/60">No resume</span>
                            )}
                            {a.portfolioUrl ? (
                              <a
                                href={a.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary hover:underline"
                              >
                                Portfolio
                              </a>
                            ) : null}
                            {a.phone ? <span className="text-muted-foreground">{a.phone}</span> : null}
                          </div>
                          {stage !== "rejected" && stage !== "accepted" ? (
                            <Select
                              value={a.status}
                              onValueChange={async (v) => {
                                if (v === "submitted") return;
                                const newStatus = v as "reviewing" | "rejected" | "accepted";
                                const res = await updateApplicationStatus(a._id, newStatus);
                                if (!res.ok) {
                                  toast.error(res.error ?? "Failed to update application status");
                                  return;
                                }
                                setAllApplications((prev) =>
                                  prev.map((app) =>
                                    app._id === a._id ? { ...app, status: newStatus } : app,
                                  ),
                                );
                                toast.success(`${candidateName(a)} moved to ${v}`);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STAGES.map((s) => (
                                  <SelectItem key={s} value={s} disabled={s === "submitted"}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </article>
                      ))}
                      {items.length === 0 ? (
                        <p className="px-1 py-6 text-center text-xs text-muted-foreground">Empty</p>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="jobs" className="mt-4 space-y-3">
          {jobs.map((job) => (
            <article key={job._id} className="surface-card flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  <StatusPill value={job.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.department} · {job.location}
                  {job.minSalary && job.maxSalary ? ` · ${money(job.minSalary)}–${money(job.maxSalary)}` : ""}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Posted {job.createdAt ? job.createdAt.slice(0, 10) : "—"}
                </p>
              </div>
              {isHR && job.status === "open" ? (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const res = await closeJob(job._id);
                    if (!res.ok) {
                      toast.error(res.error ?? "Failed to close role");
                      return;
                    }
                    toast.success(`${job.title} closed`);
                  }}
                >
                  Close role
                </Button>
              ) : null}
            </article>
          ))}
          {jobs.length === 0 ? <p className="text-sm text-muted-foreground">No job postings yet.</p> : null}
        </TabsContent>
      </Tabs>
    </>
  );
}

function CandidateView() {
  const { jobs, myApplications, applyToJob, fetchJobs, fetchMyApplications } = useHR();

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appliedJobIds = new Set(
    myApplications.map((a) => (typeof a.job === "string" ? a.job : a.job._id)),
  );

  return (
    <>
      <PageHeader title="Open roles" subtitle="Apply and track your progress in one place" />

      {myApplications.length > 0 ? (
        <div className="surface-card p-6">
          <h2 className="text-sm font-semibold">Your applications</h2>
          <div className="mt-4 space-y-3">
            {myApplications.map((a) => (
              <div key={a._id} className="flex flex-wrap items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="font-medium">{jobTitle(a, jobs)}</p>
                <StatusPill value={a.status} />
                {a.createdAt ? (
                  <span className="ml-auto text-xs text-muted-foreground">Applied {a.createdAt.slice(0, 10)}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {jobs
          .filter((j) => j.status === "open")
          .map((job) => (
            <article key={job._id} className="surface-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <StatusPill value={job.employmentType} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.requirements.map((r) => (
                    <li key={r} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {job.location}
                </span>
                {job.createdAt ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> Posted {job.createdAt.slice(0, 10)}
                  </span>
                ) : null}
                {job.minSalary && job.maxSalary ? (
                  <span>
                    {money(job.minSalary)} – {money(job.maxSalary)}
                  </span>
                ) : null}
                <ApplyDialog jobId={job._id} disabled={appliedJobIds.has(job._id)} />
              </div>
            </article>
          ))}
        {jobs.filter((j) => j.status === "open").length === 0 ? (
          <p className="text-sm text-muted-foreground">No open roles right now.</p>
        ) : null}
      </div>
    </>
  );
}

function ApplyDialog({ jobId, disabled }: { jobId: string; disabled: boolean }) {
  const { user, applyToJob } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl ?? "");
  const [resume, setResume] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await applyToJob(jobId, {
        coverLetter: coverLetter || undefined,
        phone: phone || undefined,
        portfolioUrl: portfolioUrl || undefined,
        resume: resume ?? undefined,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to submit application");
        return;
      }
      toast.success("Application submitted");
      setOpen(false);
      setCoverLetter("");
      setResume(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto" disabled={disabled}>
          {disabled ? "Applied" : "Apply now"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for this role</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio / LinkedIn URL</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://…"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover letter</Label>
            <Textarea
              id="cover-letter"
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            {user?.resumeUrl ? (
              <p className="text-xs text-muted-foreground">
                You have a saved resume on file — it'll be used automatically unless you upload a
                new one below.{" "}
                <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  View saved resume
                </a>
              </p>
            ) : null}
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewJobDialog() {
  const { createJob } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    location: "",
    employmentType: "full_time" as Job["employmentType"],
    minSalary: "80000",
    maxSalary: "120000",
    description: "",
    requirements: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number(form.minSalary);
    const max = Number(form.maxSalary);
    if (min <= 0 || max <= 0 || Number.isNaN(min) || Number.isNaN(max)) {
      toast.error("Salary range must be positive numbers");
      return;
    }
    if (min > max) {
      toast.error("Min salary can't be higher than max salary");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createJob({
        title: form.title,
        department: form.department,
        location: form.location,
        employmentType: form.employmentType,
        minSalary: Number(form.minSalary),
        maxSalary: Number(form.maxSalary),
        description: form.description,
        requirements: form.requirements.split(",").map((r) => r.trim()).filter(Boolean),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to publish job");
        return;
      }
      toast.success("Job published to the careers page");
      setOpen(false);
      setForm({
        title: "",
        department: "Engineering",
        location: "",
        employmentType: "full_time",
        minSalary: "80000",
        maxSalary: "120000",
        description: "",
        requirements: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Post a job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New job posting</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="jt">Title</Label>
            <Input id="jt" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={form.employmentType}
              onValueChange={(v) => setForm({ ...form, employmentType: v as Job["employmentType"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["full_time", "part_time", "contract", "internship"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input id="loc" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="min">Min salary</Label>
              <Input id="min" type="number" value={form.minSalary} onChange={(e) => setForm({ ...form, minSalary: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max salary</Label>
              <Input id="max" type="number" value={form.maxSalary} onChange={(e) => setForm({ ...form, maxSalary: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="jd">Description</Label>
            <Textarea id="jd" required minLength={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="req">Requirements (comma separated)</Label>
            <Input id="req" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}