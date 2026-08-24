import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, type Employee, type Payslip } from "@/lib/hr/store";
import { PageHeader, StatCard, StatusPill, money } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/payroll")({ component: PayrollPage });

function employeeUserId(e: Employee): string {
  return typeof e.user === "string" ? e.user : e.user._id;
}

function PayrollPage() {
  const {
    user,
    employees,
    myPayslips,
    fetchEmployees,
    fetchMyPayslips,
    fetchEmployeePayslips,
    markPayslipPaid,
  } = useHR();
  const isHR = user?.role === "hr" || user?.role === "super_admin";
  const [companyRows, setCompanyRows] = useState<Payslip[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(false);

  const refreshCompanyRows = useCallback(async () => {
    if (employees.length === 0) {
      setCompanyRows([]);
      return;
    }
    setLoadingCompany(true);
    try {
      const results = await Promise.all(employees.map((e) => fetchEmployeePayslips(employeeUserId(e))));
      setCompanyRows(results.flat());
    } finally {
      setLoadingCompany(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.map(employeeUserId).join(",")]);

  useEffect(() => {
    if (isHR) {
      fetchEmployees();
    } else {
      fetchMyPayslips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR]);

  useEffect(() => {
    if (isHR) refreshCompanyRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCompanyRows, isHR]);

  const rows = isHR ? companyRows : myPayslips;
  const gross = rows.reduce((s, p) => s + p.gross, 0);
  const net = rows.reduce((s, p) => s + p.net, 0);
  const annualPayroll = employees.reduce((s, e) => s + (e.salary ?? 0), 0);

  const markPaid = async (id: string) => {
    const res = await markPayslipPaid(id);
    if (!res.ok) {
      toast.error(res.error ?? "Failed to mark as paid");
      return;
    }
    toast.success("Marked as paid");
    refreshCompanyRows();
  };

  return (
    <>
      <PageHeader
        title="Payroll"
        subtitle={isHR ? "Company payroll runs and payslips" : "Your payslips and compensation"}
        actions={isHR ? <GeneratePayslipDialog onGenerated={refreshCompanyRows} /> : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Payslips" value={rows.length} tone="primary" />
        <StatCard label="Gross total" value={money(gross)} />
        <StatCard label="Net total" value={money(net)} tone="success" />
        <StatCard label={isHR ? "Annual payroll" : "Payslips"} value={isHR ? money(annualPayroll) : rows.length} />
      </div>

      {isHR && loadingCompany ? (
        <p className="text-sm text-muted-foreground">Loading company payslips…</p>
      ) : null}

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {isHR ? <TableHead>Employee</TableHead> : null}
              <TableHead>Period</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Benefits</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              {isHR ? <TableHead className="text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p._id}>
                {isHR ? <TableCell>{nameOf(p.employee)}</TableCell> : null}
                <TableCell>{p.period}</TableCell>
                <TableCell>{money(p.gross)}</TableCell>
                <TableCell>{money(p.tax)}</TableCell>
                <TableCell>{money(p.benefits)}</TableCell>
                <TableCell>{money(p.bonus)}</TableCell>
                <TableCell className="font-medium">{money(p.net)}</TableCell>
                <TableCell>
                  <StatusPill value={p.status} />
                </TableCell>
                {isHR ? (
                  <TableCell className="text-right">
                    {p.status === "processing" ? (
                      <Button size="sm" variant="secondary" onClick={() => markPaid(p._id)}>
                        Mark as paid
                      </Button>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHR ? 9 : 7} className="text-center text-sm text-muted-foreground">
                  No payslips yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function GeneratePayslipDialog({ onGenerated }: { onGenerated: () => void }) {
  const { employees, generatePayslip } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeUserId: "",
    period: "",
    gross: "",
    tax: "0",
    benefits: "0",
    bonus: "0",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeUserId) {
      toast.error("Choose an employee");
      return;
    }
    if (Number(form.gross) <= 0 || Number.isNaN(Number(form.gross))) {
      toast.error("Gross must be a positive number");
      return;
    }
    if ([form.tax, form.benefits, form.bonus].some((v) => Number(v) < 0 || Number.isNaN(Number(v)))) {
      toast.error("Tax, benefits and bonus can't be negative");
      return;
    }
    setSubmitting(true);
    try {
      const res = await generatePayslip({
        employee: form.employeeUserId,
        period: form.period,
        gross: Number(form.gross),
        tax: Number(form.tax),
        benefits: Number(form.benefits),
        bonus: Number(form.bonus),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to generate payslip");
        return;
      }
      toast.success("Payslip generated");
      setOpen(false);
      setForm({ employeeUserId: "", period: "", gross: "", tax: "0", benefits: "0", bonus: "0" });
      onGenerated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Generate payslip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate a payslip</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              placeholder="e.g. August 2026"
              required
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gross">Gross</Label>
            <Input
              id="gross"
              type="number"
              required
              value={form.gross}
              onChange={(e) => setForm({ ...form, gross: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Tax</Label>
            <Input id="tax" type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Input
              id="benefits"
              type="number"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus">Bonus</Label>
            <Input
              id="bonus"
              type="number"
              value={form.bonus}
              onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}