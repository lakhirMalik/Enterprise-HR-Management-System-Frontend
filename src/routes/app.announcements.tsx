import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, type Announcement } from "@/lib/hr/store";
import { PageHeader, StatusPill } from "@/components/hr/ui-bits";
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

export const Route = createFileRoute("/app/announcements")({ component: AnnouncementsPage });

function AnnouncementsPage() {
  const {
    announcements,
    user,
    fetchAnnouncements,
    createAnnouncement,
    toggleAnnouncementPin,
    deleteAnnouncement,
  } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "all" as Announcement["audience"],
  });
  const isHR = user?.role === "hr" || user?.role === "super_admin";

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Company-wide updates from People Ops"
        actions={
          isHR ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Megaphone className="size-4" /> New announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post an announcement</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    try {
                      const res = await createAnnouncement(form);
                      if (!res.ok) {
                        toast.error(res.error ?? "Failed to publish announcement");
                        return;
                      }
                      toast.success("Announcement published");
                      setForm({ title: "", body: "", audience: "all" });
                      setOpen(false);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="at">Title</Label>
                    <Input id="at" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ab">Message</Label>
                    <Textarea id="ab" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select
                      value={form.audience}
                      onValueChange={(v) => setForm({ ...form, audience: v as Announcement["audience"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="manager">Managers</SelectItem>
                        <SelectItem value="employee">Employees</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Publishing…" : "Publish"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {announcements.map((a) => (
          <article key={a._id} className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              {a.pinned ? <Pin className="size-4 text-primary" /> : null}
              <h2 className="font-semibold">{a.title}</h2>
              <StatusPill value={a.audience} />
              <span className="ml-auto text-xs text-muted-foreground">{a.createdAt.slice(0, 10)}</span>
              {isHR ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const res = await toggleAnnouncementPin(a._id);
                      if (!res.ok) toast.error(res.error ?? "Failed to update pin");
                    }}
                    aria-label={a.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const res = await deleteAnnouncement(a._id);
                      if (!res.ok) {
                        toast.error(res.error ?? "Failed to delete announcement");
                        return;
                      }
                      toast.success("Announcement deleted");
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            <p className="mt-3 text-xs text-muted-foreground/70">Posted by {nameOf(a.author)}</p>
          </article>
        ))}
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : null}
      </div>
    </>
  );
}