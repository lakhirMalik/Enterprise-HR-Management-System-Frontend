import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  Users,
} from "lucide-react";
import { useHR, nameOf, initialsOf } from "@/lib/hr/store";
import { Avatar, PageHeader, StatCard, StatusPill, money } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/app/")({ component: Overview });

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function Overview() {
  const hr = useHR();
  const role = hr.user?.role;
  if (role === "candidate") return <CandidateHome />;
  if (role === "employee") return <EmployeeHome />;
  return <AdminHome manager={role === "manager"} />;
}

function AdminHome({ manager }: { manager: boolean }) {
  const {
    employees,
    myTeam,
    leaves,
    applications,
    tasks,
    attendance,
    announcements,
    fetchEmployees,
    fetchMyTeam,
    fetchAllLeaves,
    fetchMyApplications,
    fetchAllTasks,
    fetchAllAttendance,
    fetchAnnouncements,
    fetchDashboardStats,
    dashboardStats,
  } = useHR();

  useEffect(() => {
    if (manager) {
      fetchMyTeam();
    } else {
      fetchEmployees();
    }
    fetchAllLeaves();
    fetchMyApplications();
    fetchAllTasks();
    fetchAllAttendance();
    fetchAnnouncements();
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager]);

  // Turn "2026-08" style buckets into chart-friendly rows with short month labels
  const monthLabel = (ym: string) =>
    new Date(`${ym}-01T00:00:00`).toLocaleDateString(undefined, { month: "short" });

  const trendData = (() => {
    const months: string[] = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
    }
    const hiresMap = new Map((dashboardStats?.hiresByMonth ?? []).map((h) => [h._id, h.hires]));
    const exitsMap = new Map((dashboardStats?.exitsByMonth ?? []).map((e) => [e._id, e.exits]));
    let runningHeadcount = (dashboardStats?.totalEmployees ?? 0) - months.reduce(
      (sum, m) => sum + (hiresMap.get(m) ?? 0) - (exitsMap.get(m) ?? 0),
      0,
    );
    return months.map((m) => {
      const hires = hiresMap.get(m) ?? 0;
      const exits = exitsMap.get(m) ?? 0;
      runningHeadcount += hires - exits;
      return { month: monthLabel(m), headcount: runningHeadcount, hires, exits };
    });
  })();

  const hiresThisMonth = trendData[trendData.length - 1]?.hires ?? 0;

  const scope = manager ? myTeam : employees;
  const scopeUserIds = new Set(
    scope.map((e) => (typeof e.user === "string" ? e.user : e.user._id)),
  );

  const pending = leaves.filter((l) => {
    if (l.status !== "pending") return false;
    if (!manager) return true;
    const empId = typeof l.employee === "string" ? l.employee : l.employee._id;
    return scopeUserIds.has(empId);
  });

  const today = todayStr();
  const todayRecs = attendance.filter((a) => a.date.slice(0, 10) === today);
  const openTasks = tasks.filter((t) => t.status !== "completed");
  const openApplications = applications.filter(
    (a) => !["accepted", "rejected"].includes(a.status),
  );

  const byDept = Object.entries(
    scope.reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--muted-foreground)",
  ];

  return (
    <>
      <PageHeader
        title={manager ? "Team overview" : "Company overview"}
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        actions={
          <Button asChild variant="secondary">
            <Link to="/app/leave">Review approvals</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={manager ? "Team size" : "Headcount"}
          value={scope.length}
          hint={manager ? undefined : `+${hiresThisMonth} this month`}
          icon={<Users className="size-5" />}
          tone="primary"
        />
        <StatCard
          label="Present today"
          value={todayRecs.filter((a) => a.status === "present" || a.status === "remote").length}
          hint={`${todayRecs.filter((a) => a.status === "half_day").length} half-day`}
          icon={<CalendarClock className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Pending leave"
          value={pending.length}
          hint="Awaiting your decision"
          icon={<ClipboardList className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Open applications"
          value={openApplications.length}
          hint={`${openTasks.length} open tasks`}
          icon={<BriefcaseBusiness className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Headcount trend</h2>
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="size-3.5" /> Last 6 months
            </span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
                <Area type="monotone" dataKey="headcount" stroke="var(--chart-1)" strokeWidth={2} fill="url(#hc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">People by department</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byDept} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {byDept.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            {byDept.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />
                {d.name} ({d.value})
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Hiring vs attrition</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
                <Bar dataKey="hires" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="exits" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Approvals waiting on you</h2>
          <ul className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <li className="text-sm text-muted-foreground">Nothing pending. Nice.</li>
            ) : (
              pending.map((l) => (
                <li key={l._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar initials={initialsOf(nameOf(l.employee))} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{nameOf(l.employee)}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.type} · {l.days ?? "?"} day(s) · {l.startDate.slice(0, 10)}
                    </p>
                  </div>
                  <StatusPill value={l.status} />
                </li>
              ))
            )}
          </ul>
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link to="/app/leave">Open leave console</Link>
          </Button>
        </div>
      </div>

      <div className="surface-card p-6">
        <h2 className="text-lg font-semibold">Latest announcements</h2>
        <ul className="mt-4 divide-y divide-border">
          {announcements.length === 0 ? (
            <li className="py-3 text-sm text-muted-foreground">No announcements yet.</li>
          ) : (
            announcements.slice(0, 3).map((a) => (
              <li key={a._id} className="py-3">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {nameOf(a.author)} · {a.createdAt.slice(0, 10)}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

function EmployeeHome() {
  const {
    user,
    myProfile,
    myTasks,
    myLeaves,
    myAttendance,
    myPayslips,
    myReviews,
    announcements,
    fetchMyProfile,
    fetchMyTasks,
    fetchMyLeaves,
    fetchMyAttendance,
    fetchMyPayslips,
    fetchMyReviews,
    fetchAnnouncements,
    checkIn,
    checkOut,
  } = useHR();

  useEffect(() => {
    fetchMyProfile();
    fetchMyTasks();
    fetchMyLeaves();
    fetchMyAttendance();
    fetchMyPayslips();
    fetchMyReviews();
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = todayStr();
  const todayRec = myAttendance.find((a) => a.checkIn && !a.checkOut);
  const latestPayslip = myPayslips[0];
  const latestReview = myReviews[0];

  return (
    <>
      <PageHeader
        title={`Hi ${user?.name.split(" ")[0] ?? ""}`}
        subtitle={
          myProfile ? `${myProfile.position} · ${myProfile.department}` : "Loading your profile…"
        }
        actions={
          todayRec && !todayRec.checkOut ? (
            <Button
              onClick={async () => {
                const res = await checkOut();
                if (!res.ok) toast.error(res.error ?? "Failed to clock out");
              }}
            >
              Clock out
            </Button>
          ) : todayRec ? (
            <Button disabled variant="secondary">
              <CheckCircle2 className="size-4" /> Day logged
            </Button>
          ) : (
            <Button
              onClick={async () => {
                const res = await checkIn();
                if (!res.ok) toast.error(res.error ?? "Failed to clock in");
              }}
            >
              Clock in
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Leave balance"
          value={`${myProfile?.leaveBalance ?? 0} days`}
          hint="Annual entitlement"
          tone="primary"
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          label="Open tasks"
          value={myTasks.filter((t) => t.status !== "completed").length}
          hint={`${myTasks.filter((t) => t.status === "completed").length} completed`}
          icon={<CalendarClock className="size-5" />}
        />
        <StatCard
          label="Last payslip"
          value={latestPayslip ? money(latestPayslip.net) : "—"}
          hint={latestPayslip?.period}
          tone="success"
        />
        <StatCard
          label="Review rating"
          value={latestReview ? latestReview.rating.toFixed(1) : "—"}
          hint={latestReview?.cycle}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">My tasks</h2>
          <ul className="mt-4 space-y-2">
            {myTasks.length === 0 ? (
              <li className="text-sm text-muted-foreground">No tasks assigned.</li>
            ) : (
              myTasks.slice(0, 5).map((t) => (
                <li key={t._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.dueDate ? `Due ${t.dueDate.slice(0, 10)}` : "No due date"}
                    </p>
                  </div>
                  <StatusPill value={t.status} />
                </li>
              ))
            )}
          </ul>
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link to="/app/tasks">All tasks</Link>
          </Button>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">My goals</h2>
          <div className="mt-4 space-y-4">
            {(latestReview?.goals ?? []).map((g) => (
              <div key={g.title}>
                <div className="flex justify-between text-sm">
                  <span>{g.title}</span>
                  <span className="text-muted-foreground">{g.progress}%</span>
                </div>
                <Progress value={g.progress} className="mt-2" />
              </div>
            ))}
            {!latestReview ? <p className="text-sm text-muted-foreground">No active review cycle.</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Leave history</h2>
          <ul className="mt-4 space-y-2">
            {myLeaves.length === 0 ? (
              <li className="text-sm text-muted-foreground">No requests yet.</li>
            ) : (
              myLeaves.map((l) => (
                <li key={l._id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>
                    {l.type} · {l.startDate.slice(0, 10)} → {l.endDate.slice(0, 10)}
                  </span>
                  <StatusPill value={l.status} />
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Company news</h2>
          <ul className="mt-4 divide-y divide-border">
            {announcements.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">No announcements yet.</li>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <li key={a._id} className="py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.body}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

function CandidateHome() {
  const { user, myApplications, jobs, fetchMyApplications, fetchJobs } = useHR();

  useEffect(() => {
    fetchMyApplications();
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOrder = ["submitted", "reviewing", "accepted"];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name.split(" ")[0] ?? ""}`}
        subtitle="Track your applications and discover new roles"
        actions={
          <Button asChild>
            <Link to="/app/recruitment">Browse roles</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Applications" value={myApplications.length} tone="primary" />
        <StatCard
          label="Active"
          value={myApplications.filter((a) => !["accepted", "rejected"].includes(a.status)).length}
          tone="success"
        />
        <StatCard label="Open roles" value={jobs.filter((j) => j.status === "open").length} />
      </div>

      <div className="space-y-4">
        {myApplications.map((app) => {
          const job = typeof app.job === "string" ? jobs.find((j) => j._id === app.job) : app.job;
          const idx = statusOrder.indexOf(app.status);
          return (
            <div key={app._id} className="surface-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold">{job?.title ?? "Job"}</h2>
                <StatusPill value={app.status} />
                {app.createdAt ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Applied {app.createdAt.slice(0, 10)}
                  </span>
                ) : null}
              </div>
              {app.status !== "rejected" ? (
                <ol className="mt-5 flex flex-wrap gap-2">
                  {statusOrder.map((s, i) => (
                    <li
                      key={s}
                      className={
                        "rounded-full px-3 py-1 text-xs font-medium capitalize " +
                        (i <= idx ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")
                      }
                    >
                      {s}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          );
        })}
        {myApplications.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            You haven't applied yet — browse open roles to get started.
          </div>
        ) : null}
      </div>
    </>
  );
}