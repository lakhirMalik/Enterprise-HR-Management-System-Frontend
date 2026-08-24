import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useHR, nameOf, initialsOf, type Task } from "@/lib/hr/store";
import { Avatar, PageHeader, StatusPill } from "@/components/hr/ui-bits";
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

export const Route = createFileRoute("/app/tasks")({ component: TasksPage });

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function taskAssigneeId(t: Task): string {
  return typeof t.assignedTo === "string" ? t.assignedTo : t.assignedTo._id;
}

function TasksPage() {
  const {
    user,
    tasks,
    myTasks,
    myTeam,
    setTaskStatus,
    fetchAllTasks,
    fetchMyTasks,
    fetchMyTeam,
  } = useHR();
  const role = user?.role;
  const canAssign = role === "hr" || role === "manager" || role === "super_admin";

  useEffect(() => {
    if (role === "employee") {
      fetchMyTasks();
    } else {
      fetchAllTasks();
      if (role === "manager") fetchMyTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const teamUserIds = new Set(
    myTeam.map((e) => (typeof e.user === "string" ? e.user : e.user._id)),
  );

  const rows =
    role === "employee"
      ? myTasks
      : role === "manager"
        ? tasks.filter((t) => teamUserIds.has(taskAssigneeId(t)) || taskAssigneeId(t) === user?.id)
        : tasks;

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Task["status"];

    const res = await setTaskStatus(draggableId, newStatus);
    if (!res.ok) {
      toast.error(res.error ?? "Failed to move task");
    }
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Onboarding steps, compliance items and team to-dos"
        actions={canAssign ? <NewTaskDialog /> : undefined}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = rows.filter((t) => t.status === col.key);
            return (
              <Droppable droppableId={col.key} key={col.key}>
                {(provided, snapshot) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="rounded-xl bg-secondary/60 p-3"
                    style={{
                      background: snapshot.isDraggingOver ? "hsl(var(--accent))" : undefined,
                      transition: "background 0.15s",
                    }}
                  >
                    <header className="flex items-center justify-between px-1 pb-3">
                      <h2 className="text-sm font-semibold">{col.label}</h2>
                      <span className="text-xs text-muted-foreground">{items.length}</span>
                    </header>
                    <div className="space-y-3">
                      {items.map((t, index) => (
                        <Draggable draggableId={t._id} index={index} key={t._id}>
                          {(dragProvided, dragSnapshot) => (
                            <article
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className="surface-card space-y-3 p-4"
                              style={{
                                ...dragProvided.draggableProps.style,
                                boxShadow: dragSnapshot.isDragging
                                  ? "0 8px 24px rgba(0,0,0,0.15)"
                                  : undefined,
                                cursor: "grab",
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{t.title}</p>
                                {t.priority ? <StatusPill value={t.priority} /> : null}
                              </div>
                              <p className="text-xs text-muted-foreground">{t.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Avatar initials={initialsOf(nameOf(t.assignedTo))} className="size-6 text-[10px]" />
                                <span className="truncate">{nameOf(t.assignedTo)}</span>
                                <span className="ml-auto">{t.dueDate ? t.dueDate.slice(0, 10) : "No due date"}</span>
                              </div>
                            </article>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 ? (
                        <p className="px-1 py-6 text-center text-xs text-muted-foreground">Empty</p>
                      ) : null}
                    </div>
                  </section>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}

function NewTaskDialog() {
  const { assignTask, employees, myTeam, user, fetchEmployees } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const assignees = user?.role === "manager" ? myTeam : employees;

  useEffect(() => {
    if (user?.role !== "manager") fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium" as NonNullable<Task["priority"]>,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a task</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!form.assignedTo) {
              toast.error("Choose an assignee");
              return;
            }
            setSubmitting(true);
            try {
              const res = await assignTask(form);
              if (!res.ok) {
                toast.error(res.error ?? "Failed to assign task");
                return;
              }
              toast.success("Task assigned");
              setOpen(false);
              setForm({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Assignee</Label>
              <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((e) => {
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
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as NonNullable<Task["priority"]> })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}