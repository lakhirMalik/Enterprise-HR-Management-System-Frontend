import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useHR, nameOf } from "@/lib/hr/store";
import { PageHeader, StatCard } from "@/components/hr/ui-bits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/audit")({ component: AuditPage });

// Actions that touch sensitive data — used to surface a "sensitive actions"
// count since the backend doesn't track a severity level per entry.
const SENSITIVE_ACTIONS = ["salary:update", "employee:delete", "employee:restore"];

function AuditPage() {
  const { auditLog, fetchAuditLog } = useHR();

  useEffect(() => {
    fetchAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensitiveCount = auditLog.filter((a) => SENSITIVE_ACTIONS.includes(a.action)).length;

  return (
    <>
      <PageHeader title="Audit & security" subtitle="Every privileged action recorded for compliance" />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Events" value={auditLog.length} tone="primary" />
        <StatCard label="Sensitive actions" value={sensitiveCount} tone="warning" />
      </div>
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLog.map((a) => (
              <TableRow key={a._id}>
                <TableCell className="font-medium">{nameOf(a.actor)}</TableCell>
                <TableCell>{a.action}</TableCell>
                <TableCell className="text-muted-foreground">
                  {a.targetType} · {a.targetId}
                </TableCell>
                <TableCell className="text-muted-foreground">{a.createdAt.slice(0, 19).replace("T", " ")}</TableCell>
              </TableRow>
            ))}
            {auditLog.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}