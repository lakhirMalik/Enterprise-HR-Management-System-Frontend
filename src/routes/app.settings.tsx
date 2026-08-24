import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useHR } from "@/lib/hr/store";
import { PageHeader, StatusPill } from "@/components/hr/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const {
    user,
    myProfile,
    fetchMyProfile,
    logout,
    changePassword,
    updateProfile,
    uploadProfileResume,
  } = useHR();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCandidate = user?.role === "candidate";
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (!isCandidate) fetchMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCandidate]);

  useEffect(() => {
    setPhone(user?.phone ?? "");
    setPortfolioUrl(user?.portfolioUrl ?? "");
  }, [user?.phone, user?.portfolioUrl]);

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (!res.ok) {
        toast.error(res.error ?? "Failed to change password");
        return;
      }
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCandidateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({ phone, portfolioUrl });
      if (!res.ok) {
        toast.error(res.error ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true);
    try {
      const res = await uploadProfileResume(file);
      if (!res.ok) {
        toast.error(res.error ?? "Failed to upload resume");
        return;
      }
      toast.success("Resume saved");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile and workspace preferences" />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card space-y-4 p-6">
          <h2 className="font-semibold">Profile</h2>
          <div className="space-y-2">
            <Label htmlFor="n">Name</Label>
            <Input id="n" defaultValue={user?.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e">Email</Label>
            <Input id="e" defaultValue={user?.email ?? ""} readOnly />
          </div>
          <div className="flex items-center gap-2 text-sm">
            Role <StatusPill value={user?.role ?? ""} />
          </div>
        </section>

        {isCandidate ? (
          <section className="surface-card space-y-4 p-6">
            <h2 className="font-semibold">Candidate details</h2>
            <p className="text-sm text-muted-foreground">
              Saved here so you don't have to re-enter it every time you apply.
            </p>
            <form onSubmit={submitCandidateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cand-phone">Phone</Label>
                <Input id="cand-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cand-portfolio">Portfolio / LinkedIn URL</Label>
                <Input
                  id="cand-portfolio"
                  type="url"
                  placeholder="https://…"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={savingProfile} size="sm">
                {savingProfile ? "Saving…" : "Save details"}
              </Button>
            </form>
            <div className="space-y-2 border-t border-border pt-4">
              <Label htmlFor="cand-resume">Resume</Label>
              {user?.resumeUrl ? (
                <p className="text-xs text-muted-foreground">
                  <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    View current resume
                  </a>{" "}
                  — upload a new file below to replace it.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No resume on file yet.</p>
              )}
              <Input
                id="cand-resume"
                type="file"
                accept=".pdf,.doc,.docx"
                disabled={uploadingResume}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleResumeUpload(file);
                }}
              />
            </div>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </section>
        ) : (
          <section className="surface-card space-y-4 p-6">
            <h2 className="font-semibold">Employment</h2>
            {myProfile ? (
              <dl className="space-y-2 text-sm">
                {[
                  ["Job title", myProfile.position],
                  ["Department", myProfile.department],
                  ["Location", myProfile.location || "—"],
                  ["Joined", myProfile.hireDate ? myProfile.hireDate.slice(0, 10) : "—"],
                  ["Leave balance", `${myProfile.leaveBalance ?? 0} days`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No employment record linked to this account.</p>
            )}
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </section>
        )}

        <section className="surface-card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold">Change password</h2>
          <form onSubmit={submitPasswordChange} className="grid gap-4 sm:max-w-sm">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-fit">
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}