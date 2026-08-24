import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Copy, Check, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, initialsOf, type Employee } from "@/lib/hr/store";
import { DEPARTMENTS } from "@/lib/hr/seed";
import { Avatar, PageHeader, StatusPill, money } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/employees")({ component: EmployeesPage });

function employeeEmail(e: Employee): string {
  return typeof e.user === "string" ? "" : e.user.email;
}

function EmployeesPage() {
  const { employees, myTeam, user, updateEmployee, deleteEmployee, fetchEmployees, fetchMyTeam } = useHR();
  const isHR = user?.role === "hr" || user?.role === "super_admin";
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  useEffect(() => {
    if (isHR) {
      fetchEmployees();
    } else {
      fetchMyTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR]);

  const scope = isHR ? employees : myTeam;

  const rows = useMemo(
    () =>
      scope.filter(
        (e) =>
          (dept === "all" || e.department === dept) &&
          (nameOf(e.user).toLowerCase().includes(query.toLowerCase()) ||
            e.position.toLowerCase().includes(query.toLowerCase()) ||
            employeeEmail(e).toLowerCase().includes(query.toLowerCase())),
      ),
    [scope, dept, query],
  );

  return (
    <>
      <PageHeader
        title={isHR ? "People directory" : "My team"}
        subtitle={`${rows.length} of ${scope.length} people`}
        actions={isHR ? <AddEmployeeDialog /> : undefined}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role or email"
            className="pl-9"
          />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {rows.map((e) => (
          <div key={e._id} className="surface-card space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar initials={initialsOf(nameOf(e.user))} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{nameOf(e.user)}</p>
                <p className="truncate text-xs text-muted-foreground">{e.position}</p>
              </div>
              <StatusPill value={e.employmentStatus ?? "active"} />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Department</dt>
                <dd>{e.department}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Manager</dt>
                <dd>{e.manager ? nameOf(e.manager) : "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Location</dt>
                <dd>{e.location || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Joined</dt>
                <dd>{e.hireDate ? e.hireDate.slice(0, 10) : "—"}</dd>
              </div>
              {isHR ? (
                <div>
                  <dt className="font-medium text-foreground">Salary</dt>
                  <dd>{money(e.salary ?? 0)}</dd>
                </div>
              ) : null}
            </dl>
            {isHR ? (
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Select
                  value={e.employmentStatus ?? "active"}
                  onValueChange={async (v) => {
                    const res = await updateEmployee(e._id, { employmentStatus: v as NonNullable<Employee["employmentStatus"]> });
                    if (!res.ok) {
                      toast.error(res.error ?? "Failed to update status");
                      return;
                    }
                    toast.success(`${nameOf(e.user)} marked ${v}`);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["active", "probation", "on_leave", "offboarded"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EditEmployeeDialog employee={e} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete employee">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {nameOf(e.user)}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes them from the active directory. Their record can be restored
                        later if needed — it isn't permanently erased.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const res = await deleteEmployee(e._id);
                          if (!res.ok) {
                            toast.error(res.error ?? "Failed to delete employee");
                            return;
                          }
                          toast.success(`${nameOf(e.user)} removed`);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No people match your filters.</p>
        ) : null}
      </div>

      {/* Desktop: full table */}
      <div className="surface-card hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Joined</TableHead>
              {isHR ? <TableHead>Salary</TableHead> : null}
              <TableHead>Status</TableHead>
              {isHR ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar initials={initialsOf(nameOf(e.user))} />
                    <div>
                      <p className="font-medium">{nameOf(e.user)}</p>
                      <p className="text-xs text-muted-foreground">{e.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell className="text-muted-foreground">
                  {e.manager ? nameOf(e.manager) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{e.location || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {e.hireDate ? e.hireDate.slice(0, 10) : "—"}
                </TableCell>
                {isHR ? <TableCell>{money(e.salary ?? 0)}</TableCell> : null}
                <TableCell>
                  <StatusPill value={e.employmentStatus ?? "active"} />
                </TableCell>
                {isHR ? (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={e.employmentStatus ?? "active"}
                        onValueChange={async (v) => {
                          const res = await updateEmployee(e._id, { employmentStatus: v as NonNullable<Employee["employmentStatus"]> });
                          if (!res.ok) {
                            toast.error(res.error ?? "Failed to update status");
                            return;
                          }
                          toast.success(`${nameOf(e.user)} marked ${v}`);
                        }}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["active", "probation", "on_leave", "offboarded"].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <EditEmployeeDialog employee={e} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete employee">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {nameOf(e.user)}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes them from the active directory. Their record can be restored
                              later if needed — it isn't permanently erased.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                const res = await deleteEmployee(e._id);
                                if (!res.ok) {
                                  toast.error(res.error ?? "Failed to delete employee");
                                  return;
                                }
                                toast.success(`${nameOf(e.user)} removed`);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function EditEmployeeDialog({ employee }: { employee: Employee }) {
  const { updateEmployee, employees } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currentManagerId =
    employee.manager && typeof employee.manager !== "string" ? employee.manager._id : "";
  const [form, setForm] = useState({
    position: employee.position,
    department: employee.department,
    salary: String(employee.salary ?? 0),
    phone: employee.phone ?? "",
    location: employee.location ?? "",
    managerUserId: currentManagerId,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.salary) <= 0 || Number.isNaN(Number(form.salary))) {
      toast.error("Salary must be a positive number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateEmployee(employee._id, {
        position: form.position,
        department: form.department,
        salary: Number(form.salary),
        phone: form.phone,
        location: form.location,
        manager: form.managerUserId || null,
      } as Partial<Employee>);
      if (!res.ok) {
        toast.error(res.error ?? "Failed to update employee");
        return;
      }
      toast.success(`${nameOf(employee.user)} updated`);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit employee">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {nameOf(employee.user)}</DialogTitle>
          <DialogDescription>Update their role details on record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-position">Job title</Label>
            <Input
              id="edit-position"
              required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
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
            <Label htmlFor="edit-salary">Annual salary</Label>
            <Input
              id="edit-salary"
              type="number"
              required
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Reports to</Label>
            <Select
              value={form.managerUserId || "none"}
              onValueChange={(v) => setForm({ ...form, managerUserId: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No manager assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No manager</SelectItem>
                {employees
                  .filter((e) => e._id !== employee._id)
                  .map((e) => {
                    const userId = typeof e.user === "string" ? e.user : e.user._id;
                    return (
                      <SelectItem key={e._id} value={userId}>
                        {nameOf(e.user)}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddEmployeeDialog() {
  const { employees, onboardEmployee, updateEmployee } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; tempPassword: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    position: "",
    managerId: "",
    location: "",
    salary: "90000",
    role: "employee" as "employee" | "manager" | "hr",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.salary) <= 0 || Number.isNaN(Number(form.salary))) {
      toast.error("Salary must be a positive number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await onboardEmployee({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        position: form.position,
        salary: Number(form.salary),
      });

      if (!res.ok || !res.employee) {
        toast.error(res.error ?? "Failed to onboard employee");
        return;
      }

      // Manager assignment isn't part of the onboard step on the backend,
      // so it's set with a follow-up update once the employee record exists.
      if (form.managerId) {
        const managerUserId =
          typeof employees.find((emp) => emp._id === form.managerId)?.user === "string"
            ? (employees.find((emp) => emp._id === form.managerId)?.user as string)
            : (employees.find((emp) => emp._id === form.managerId)?.user as { _id: string } | undefined)?._id;
        if (managerUserId) {
          const managerRes = await updateEmployee(res.employee._id, { manager: managerUserId } as Partial<Employee>);
          if (!managerRes.ok) {
            toast.error(`Employee created, but assigning a manager failed: ${managerRes.error ?? "unknown error"}`);
          }
        }
      }
      if (form.phone || form.location) {
        const detailsRes = await updateEmployee(res.employee._id, { phone: form.phone, location: form.location });
        if (!detailsRes.ok) {
          toast.error(`Employee created, but saving phone/location failed: ${detailsRes.error ?? "unknown error"}`);
        }
      }

      toast.success("Employee onboarded");
      setOpen(false);
      if (res.tempPassword) {
        setCredentials({ email: form.email, tempPassword: res.tempPassword });
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "Engineering",
        position: "",
        managerId: "",
        location: "",
        salary: "90000",
        role: "employee",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(credentials.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="size-4" /> Add employee
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onboard a new employee</DialogTitle>
            <DialogDescription>They start on probation and get a 20-day leave balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Full name"],
                ["email", "Work email"],
                ["phone", "Phone"],
                ["position", "Job title"],
                ["location", "Location"],
                ["salary", "Annual salary"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  required={key !== "phone" && key !== "location"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
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
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as "employee" | "manager" | "hr" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reports to</Label>
              <Select value={form.managerId} onValueChange={(v) => setForm({ ...form, managerId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {nameOf(e.user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee created</DialogTitle>
            <DialogDescription>
              Share this temporary password with them securely — it won't be shown again.
            </DialogDescription>
          </DialogHeader>
          {credentials ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
                  {credentials.email}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Temporary password</Label>
                <div className="flex items-center gap-2">
                  <p className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 font-mono text-sm">
                    {credentials.tempPassword}
                  </p>
                  <Button type="button" variant="secondary" size="icon" onClick={copyPassword}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}