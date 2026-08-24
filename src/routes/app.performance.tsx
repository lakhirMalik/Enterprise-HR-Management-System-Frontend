import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, type Employee, type Review } from "@/lib/hr/store";
import { PageHeader, StatCard, StatusPill } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/performance")({ component: PerformancePage });

function employeeUserId(e: Employee): string {
  return typeof e.user === "string" ? e.user : e.user._id;
}

function PerformancePage() {
  const {
    user,
    myReviews,
    employees,
    myTeam,
    fetchMyReviews,
    fetchReviewsForEmployee,
    fetchEmployees,
    fetchMyTeam,
    acknowledgeReview,
    updateReview,
  } = useHR();
  const role = user?.role;
  const canManage = role === "manager" || role === "hr" || role === "super_admin";
  const [teamRows, setTeamRows] = useState<Review[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const scopeEmployees = role === "manager" ? myTeam : employees;

  const refreshTeamReviews = useCallback(async () => {
    if (scopeEmployees.length === 0) {
      setTeamRows([]);
      return;
    }
    setLoadingTeam(true);
    try {
      const results = await Promise.all(
        scopeEmployees.map((e) => fetchReviewsForEmployee(employeeUserId(e))),
      );
      setTeamRows(results.flat());
    } finally {
      setLoadingTeam(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeEmployees.map(employeeUserId).join(",")]);

  useEffect(() => {
    if (role === "employee") {
      fetchMyReviews();
    } else if (role === "manager") {
      fetchMyTeam();
    } else if (canManage) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role !== "employee") refreshTeamReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTeamReviews, role]);

  const scope = role === "employee" ? myReviews : teamRows;
  const avg = scope.length ? scope.reduce((s, r) => s + r.rating, 0) / scope.length : 0;

  const publish = async (id: string) => {
    const res = await updateReview(id, { status: "shared" });
    if (!res.ok) {
      toast.error(res.error ?? "Failed to publish review");
      return;
    }
    toast.success("Review shared with the employee");
    refreshTeamReviews();
  };

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle="Review cycles, ratings and goal progress"
        actions={
          canManage ? (
            <NewReviewDialog employees={scopeEmployees} onCreated={refreshTeamReviews} />
          ) : undefined
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Reviews" value={scope.length} tone="primary" />
        <StatCard label="Average rating" value={avg.toFixed(1)} tone="success" />
        <StatCard
          label="Awaiting acknowledgement"
          value={scope.filter((r) => r.status === "shared").length}
          tone="warning"
        />
      </div>

      {canManage && loadingTeam ? <p className="text-sm text-muted-foreground">Loading reviews…</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {scope.map((r) => (
          <article key={r._id} className="surface-card space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{nameOf(r.employee)}</h2>
              <StatusPill value={r.status} />
              <span className="ml-auto text-sm text-muted-foreground">{r.cycle}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.summary}</p>
            <div className="text-sm">
              Rating <span className="font-semibold text-foreground">{r.rating.toFixed(1)}</span> / 5
            </div>
            <div className="space-y-3">
              {r.goals.map((g) => (
                <div key={g.title} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>{g.title}</span>
                    <span className="text-muted-foreground">{g.progress}%</span>
                  </div>
                  <Progress value={g.progress} />
                </div>
              ))}
            </div>
            {canManage && r.status === "draft" ? (
              <Button size="sm" onClick={() => publish(r._id)}>
                Publish to employee
              </Button>
            ) : null}
            {r.status === "shared" && role === "employee" ? (
              <Button
                size="sm"
                onClick={async () => {
                  const res = await acknowledgeReview(r._id);
                  if (!res.ok) {
                    toast.error(res.error ?? "Failed to acknowledge review");
                    return;
                  }
                  toast.success("Review acknowledged");
                }}
              >
                Acknowledge review
              </Button>
            ) : null}
          </article>
        ))}
        {scope.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : null}
      </div>
    </>
  );
}

function NewReviewDialog({ employees, onCreated }: { employees: Employee[]; onCreated: () => void }) {
  const { createReview } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ employeeUserId: "", cycle: "", rating: "4", summary: "" });
  const [goals, setGoals] = useState<{ title: string; progress: string }[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeUserId) {
      toast.error("Choose an employee");
      return;
    }
    const rating = Number(form.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      toast.error("Rating must be between 0 and 5");
      return;
    }
    const cleanGoals = goals
      .filter((g) => g.title.trim())
      .map((g) => ({
        title: g.title.trim(),
        progress: Math.min(100, Math.max(0, Number(g.progress) || 0)),
      }));
    setSubmitting(true);
    try {
      const res = await createReview({
        employee: form.employeeUserId,
        cycle: form.cycle,
        rating: Number(form.rating),
        summary: form.summary,
        goals: cleanGoals,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to create review");
        return;
      }
      toast.success("Review created as a draft");
      setOpen(false);
      setForm({ employeeUserId: "", cycle: "", rating: "4", summary: "" });
      setGoals([]);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a review</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={form.employeeUserId} onValueChange={(v) => setForm({ ...form, employeeUserId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => {
                  const userId = employeeUserId(e);
                  return (
                    <SelectItem key={e._id} value={userId}>
                      {nameOf(e.user)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cycle">Cycle</Label>
              <Input
                id="cycle"
                placeholder="e.g. H2 2026"
                required
                value={form.cycle}
                onChange={(e) => setForm({ ...form, cycle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0–5)</Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Goals</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setGoals([...goals, { title: "", progress: "0" }])}
              >
                <Plus className="size-3.5" /> Add goal
              </Button>
            </div>
            {goals.length === 0 ? (
              <p className="text-xs text-muted-foreground">No goals added yet.</p>
            ) : (
              <div className="space-y-2">
                {goals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder="Goal title"
                      value={g.title}
                      onChange={(e) => {
                        const next = [...goals];
                        next[i] = { ...next[i]!, title: e.target.value };
                        setGoals(next);
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="%"
                      value={g.progress}
                      onChange={(e) => {
                        const next = [...goals];
                        next[i] = { ...next[i]!, progress: e.target.value };
                        setGoals(next);
                      }}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setGoals(goals.filter((_, gi) => gi !== i))}
                      aria-label="Remove goal"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}