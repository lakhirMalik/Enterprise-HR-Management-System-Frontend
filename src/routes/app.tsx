import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/hr/AppShell";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Workspace — HR" },
      { name: "description", content: "Your role-based HR workspace." },
      { property: "og:title", content: "Workspace — HR" },
      { property: "og:description", content: "Your role-based HR workspace." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
