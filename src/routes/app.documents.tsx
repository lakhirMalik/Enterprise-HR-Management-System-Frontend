import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHR, nameOf, type DocumentItem } from "@/lib/hr/store";
import { PageHeader, StatusPill } from "@/components/hr/ui-bits";
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

export const Route = createFileRoute("/app/documents")({ component: DocumentsPage });

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentsPage() {
  const { user, documents, fetchDocuments, deleteDocument } = useHR();
  const isHR = user?.role === "hr" || user?.role === "super_admin";

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Policies, contracts and onboarding paperwork"
        actions={isHR ? <UploadDocumentDialog /> : undefined}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((d) => (
          <article key={d._id} className="surface-card flex items-start gap-4 p-5">
            <span className="rounded-lg bg-secondary p-2.5">
              <FileText className="size-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{d.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nameOf(d.owner)} · {formatSize(d.sizeBytes)} · updated {d.createdAt.slice(0, 10)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <StatusPill value={d.category} />
                <Button size="sm" variant="ghost" className="ml-auto" asChild>
                  <a href={d.fileUrl} target="_blank" rel="noreferrer">
                    <Download className="size-4" /> Download
                  </a>
                </Button>
                {isHR ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const res = await deleteDocument(d._id);
                      if (!res.ok) {
                        toast.error(res.error ?? "Failed to delete document");
                        return;
                      }
                      toast.success("Document deleted");
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        ) : null}
      </div>
    </>
  );
}

function UploadDocumentDialog() {
  const { uploadDocument } = useHR();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentItem["category"]>("policy");
  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file");
      return;
    }
    setSubmitting(true);
    try {
      const res = await uploadDocument({ name, category, file });
      if (!res.ok) {
        toast.error(res.error ?? "Upload failed");
        return;
      }
      toast.success("Document uploaded");
      setOpen(false);
      setName("");
      setFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Name</Label>
            <Input id="doc-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentItem["category"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-file">File</Label>
            <Input
              id="doc-file"
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}