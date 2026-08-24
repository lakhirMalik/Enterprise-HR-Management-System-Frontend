import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHR } from "@/lib/hr/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — HR" },
      { name: "description", content: "Sign in to the HR workspace as HR, manager, employee or candidate." },
      { property: "og:title", content: "Sign in — HR" },
      { property: "og:description", content: "Role-based access to the HR workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, verifyTwoFactor, user, ready } = useHR();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set once the backend tells us this account needs a second factor.
  const [twoFactor, setTwoFactor] = useState<{ userId: string; method?: string | undefined } | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: "/app", replace: true });
  }, [ready, user, navigate]);

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.twoFactorRequired && res.userId) {
        setTwoFactor({ userId: res.userId, method: res.twoFactorMethod });
        return;
      }
      if (!res.ok) {
        setError(res.error ?? "Sign in failed");
        return;
      }
      navigate({ to: "/app", replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactor) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await verifyTwoFactor(twoFactor.userId, code);
      if (!res.ok) {
        setError(res.error ?? "Invalid verification code");
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
            HR
          </span>
          <span className="font-display text-lg font-semibold">HR</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">
            One workspace for every part of the employee lifecycle.
          </h2>
          <p className="mt-4 max-w-md opacity-80">
            Hiring, onboarding, attendance, leave, payroll, performance and compliance — with
            role-based access baked in.
          </p>
        </div>
        <p className="text-sm opacity-60">Enterprise HR Management System</p>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          {!twoFactor ? (
            <>
              <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue to your workspace.
              </p>

              <form onSubmit={submitCredentials} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"} <ArrowRight className="size-4" />
                </Button>
              </form>

              <p className="mt-8 text-sm text-muted-foreground">
                Looking for a job?{" "}
                <Link to="/careers" className="font-medium text-primary hover:underline">
                  See open roles
                </Link>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                New candidate?{" "}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-semibold">Verify it's you</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {twoFactor.method === "email"
                  ? "Enter the 6-digit code we emailed you."
                  : "Enter the code from your authenticator app."}
              </p>

              <form onSubmit={submitCode} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    autoFocus
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Verifying…" : "Verify"} <ArrowRight className="size-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactor(null);
                    setCode("");
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}