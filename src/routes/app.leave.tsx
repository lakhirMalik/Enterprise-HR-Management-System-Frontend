import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarPlus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, initialsOf, type LeaveRequest } from "@/lib/hr/store";
import { Avatar, PageHeader, StatCard, StatusPill } from "@/components/hr/ui-bits";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/leave")({ component: LeavePage });

const TYPES = ["annual", "sick", "unpaid", "parental", "bereavement"] as const;

function leaveEmployeeId(l: LeaveRequest): string {
  return typeof l.employee === "string" ? l.employee : l.employee._id;
}

function LeavePage() {
  const {
    user,
    leaves,
    myLeaves,
    myTeam,
    employees,
    myProfile,
    decideLeave,
    fetchAllLeaves,
    fetchMyLeaves,
    fetchMyTeam,
    fetchEmployees,
    fetchMyProfile,
  } = useHR();

  const role = user?.role;
  const isHR = role === "hr" || role === "super_admin";
  const isManager = role === "manager";
  const canDecide = isHR || isManager;

  useEffect(() => {
    if (role === "employee") {
      fetchMyLeaves();
      fetchMyProfile();
    } else if (isManager) {
      fetchAllLeaves();
      fetchMyTeam();
    } else if (isHR) {
      fetchAllLeaves();
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const teamUserIds = new Set(
    myTeam.map((e) => (typeof e.user === "string" ? e.user : e.user._id)),
  );

  const rows =
    role === "employee"
      ? myLeaves
      : isManager
        ? leaves.filter((l) => teamUserIds.has(leaveEmployeeId(l)))
        : leaves;

  const pending = rows.filter((l) => l.status === "pending");

  const avgBalanceSource = isManager ? myTeam : employees;
  const avgBalance =
    avgBalanceSource.length === 0
      ? 0
      : Math.round(
          avgBalanceSource.reduce((s, e) => s + (e.leaveBalance ?? 0), 0) / avgBalanceSource.length,
        );

  const List = ({ items }: { items: typeof rows }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </div>
      ) : (
        items.map((l) => (
          <div key={l._id} className="surface-card flex flex-wrap items-center gap-4 p-5">
            <Avatar initials={initialsOf(nameOf(l.employee))} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{nameOf(l.employee)}</p>
                <StatusPill value={l.type} />
                <StatusPill value={l.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {l.startDate.slice(0, 10)} → {l.endDate.slice(0, 10)} · {l.days ?? "?"} day(s) · {l.reason}
              </p>
              {l.approvedBy ? (
                <p className="text-xs text-muted-foreground/70">Decided by {nameOf(l.approvedBy)}</p>
              ) : null}
            </div>
            {canDecide && l.status === "pending" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    const res = await decideLeave(l._id, "approved");
                    if (!res.ok) {
                      toast.error(res.error ?? "Failed to approve leave");
                      return;
                    }
                    toast.success("Leave approved");
                  }}
                >
                  <Check className="size-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const res = await decideLeave(l._id, "rejected");
                    if (!res.ok) {
                      toast.error(res.error ?? "Failed to reject leave");
                      return;
                    }
                    toast("Leave rejected");
                  }}
                >
                  <X className="size-4" /> Reject
                </Button>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Leave management"
        subtitle={canDecide ? "Approve time off and track balances" : "Request time off and follow your requests"}
        actions={role === "candidate" ? undefined : <RequestLeaveDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Pending" value={pending.length} tone="warning" />
        <StatCard label="Approved" value={rows.filter((l) => l.status === "approved").length} tone="success" />
        <StatCard label="Rejected" value={rows.filter((l) => l.status === "rejected").length} />
        <StatCard
          label={role === "employee" ? "My balance" : "Avg. balance"}
          value={role === "employee" ? `${myProfile?.leaveBalance ?? 0} d` : `${avgBalance} d`}
          tone="primary"
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All requests ({rows.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <List items={pending} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <List items={rows} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function RequestLeaveDialog() {
  const { requestLeave } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<(typeof TYPES)[number]>("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus className="size-4" /> Request leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New leave request</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (endDate < startDate) {
              toast.error("End date can't be before the start date");
              return;
            }
            const today = new Date().toISOString().slice(0, 10);
            if (startDate < today) {
              toast.error("Start date can't be in the past");
              return;
            }
            setSubmitting(true);
            try {
              const res = await requestLeave({ type, startDate, endDate, reason });
              if (!res.ok) {
                toast.error(res.error ?? "Failed to submit leave request");
                return;
              }
              toast.success("Request submitted for approval");
              setOpen(false);
              setStartDate("");
              setEndDate("");
              setReason("");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as (typeof TYPES)[number])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">From</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">To</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}