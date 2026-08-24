import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHR } from "@/lib/hr/store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — HR" },
      { name: "description", content: "Create a candidate account to apply for open roles." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { register, login, user, ready } = useHR();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/app", replace: true });
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({ name, email, password, role: "candidate" });
      if (!res.ok) {
        setError(res.error ?? "Failed to create account");
        return;
      }

      // Sign them straight in so they land on the candidate portal immediately.
      const loginRes = await login(email, password);
      if (loginRes.twoFactorRequired) {
        // Very unlikely for a brand-new account, but handle it just in case.
        navigate({ to: "/login" });
        return;
      }
      if (!loginRes.ok) {
        // Account was created but auto-login failed — send them to sign in manually.
        navigate({ to: "/login" });
        return;
      }
      navigate({ to: "/app", replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-surface hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-current/15 font-display text-sm font-bold">
            N
          </span>
          <span className="font-display text-lg font-semibold">HR</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Find your next role, and track it every step of the way.
          </h2>
          <p className="mt-4 max-w-md opacity-80">
            Create a candidate account to apply for open roles and follow your application status
            in one place.
          </p>
        </div>
        <p className="text-sm opacity-60">Enterprise HR Management System</p>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to apply for roles and track your applications.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"} <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}