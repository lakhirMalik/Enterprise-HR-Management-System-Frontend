import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, initialsOf, type AttendanceRecord } from "@/lib/hr/store";
import { Avatar, PageHeader, StatCard, StatusPill } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/attendance")({ component: AttendancePage });

function recordHours(r: AttendanceRecord): number {
  if (!r.checkIn || !r.checkOut) return 0;
  const ms = new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime();
  return Math.max(0, ms / 3600000);
}

function AttendancePage() {
  const {
    user,
    attendance,
    myAttendance,
    myTeam,
    checkIn,
    checkOut: doCheckOut,
    fetchAllAttendance,
    fetchMyAttendance,
    fetchMyTeam,
  } = useHR();
  const [date, setDate] = useState("");
  const role = user?.role;
  const isHR = role === "hr" || role === "super_admin";
  const isManager = role === "manager";

  useEffect(() => {
    fetchMyAttendance();
    if (isManager) {
      fetchAllAttendance();
      fetchMyTeam();
    } else if (isHR) {
      fetchAllAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const teamUserIds = new Set(
    myTeam.map((e) => (typeof e.user === "string" ? e.user : e.user._id)),
  );

  const scopedRecords =
    role === "employee"
      ? myAttendance
      : isManager
        ? attendance.filter((a) => {
            const id = typeof a.employee === "string" ? a.employee : a.employee._id;
            return id === user?.id || teamUserIds.has(id);
          })
        : attendance;

  const rows = useMemo(
    () =>
      [...scopedRecords]
        .filter((a) => !date || a.date.slice(0, 10) === date)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [scopedRecords, date],
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const myToday = myAttendance.find((a) => a.checkIn && !a.checkOut);
  const totalHours = rows.reduce((s, r) => s + recordHours(r), 0);

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Clock records, remote days and worked hours"
        actions={
          role !== "candidate" ? (
            myToday && !myToday.checkOut ? (
              <Button
                onClick={async () => {
                  const res = await doCheckOut();
                  if (!res.ok) {
                    toast.error(res.error ?? "Failed to clock out");
                    return;
                  }
                  toast.success("Clocked out");
                }}
              >
                <LogOut className="size-4" /> Clock out
              </Button>
            ) : myToday ? (
              <Button variant="secondary" disabled>
                Today logged
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  const res = await checkIn();
                  if (!res.ok) {
                    toast.error(res.error ?? "Failed to clock in");
                    return;
                  }
                  toast.success("Clocked in");
                }}
              >
                <LogIn className="size-4" /> Clock in
              </Button>
            )
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Records" value={rows.length} tone="primary" />
        <StatCard label="Hours logged" value={totalHours.toFixed(1)} />
        <StatCard label="Half-day" value={rows.filter((r) => r.status === "half_day").length} tone="warning" />
        <StatCard label="Remote days" value={rows.filter((r) => r.status === "remote").length} tone="success" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        {date ? (
          <Button variant="ghost" onClick={() => setDate("")}>
            Clear filter
          </Button>
        ) : null}
      </div>

      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Clock in</TableHead>
              <TableHead>Clock out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const hours = recordHours(r);
              return (
                <TableRow key={r._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar initials={initialsOf(nameOf(r.employee))} />
                      <span className="font-medium">{nameOf(r.employee)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.date.slice(0, 10)}</TableCell>
                  <TableCell>
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </TableCell>
                  <TableCell>
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </TableCell>
                  <TableCell>{hours ? hours.toFixed(1) : "—"}</TableCell>
                  <TableCell>
                    <StatusPill value={r.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}