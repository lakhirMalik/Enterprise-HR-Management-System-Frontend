import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  FileText,
  Gauge,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useHR, roleLabel, initialsOf, type Role } from "@/lib/hr/store";
import { Avatar } from "./ui-bits";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: "/app", label: "Overview", icon: LayoutGrid, roles: ["hr", "manager", "employee", "candidate"] },
  { to: "/app/employees", label: "People", icon: Users, roles: ["hr", "manager"] },
  { to: "/app/attendance", label: "Attendance", icon: CalendarClock, roles: ["hr", "manager", "employee"] },
  { to: "/app/leave", label: "Leave", icon: ClipboardList, roles: ["hr", "manager", "employee"] },
  { to: "/app/tasks", label: "Tasks", icon: ScrollText, roles: ["hr", "manager", "employee"] },
  { to: "/app/recruitment", label: "Recruitment", icon: BriefcaseBusiness, roles: ["hr", "manager", "candidate"] },
  { to: "/app/payroll", label: "Payroll", icon: Wallet, roles: ["hr", "employee", "manager"] },
  { to: "/app/performance", label: "Performance", icon: Gauge, roles: ["hr", "manager", "employee"] },
  { to: "/app/announcements", label: "Announcements", icon: Megaphone, roles: ["hr", "manager", "employee", "candidate"] },
  { to: "/app/documents", label: "Documents", icon: FileText, roles: ["hr", "manager", "employee"] },
  { to: "/app/audit", label: "Audit & security", icon: ShieldCheck, roles: ["hr"] },
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["hr", "manager", "employee", "candidate"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, logout, notifications, fetchNotifications, markNotificationRead } = useHR();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    );
  }

  const items = NAV.filter((i) => i.roles.includes(user.role));
  // The backend already scopes /notifications to the current user, so no
  // role/audience filtering is needed here — just unread vs read.
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
            HR
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">HR</span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {items.map((item) => {
            const active = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar initials={initialsOf(user.name)} className="bg-sidebar-accent text-sidebar-accent-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{roleLabel[user.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {roleLabel[user.role]} workspace
          </p>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu
              onOpenChange={(o) => {
                if (o) unread.forEach((n) => markNotificationRead(n._id));
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="size-5" />
                  {unread.length > 0 ? (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div key={n._id} className="px-2 py-2">
                      <p className="text-sm font-medium">{n.message}</p>
                      <p className="text-xs capitalize text-muted-foreground">{n.type}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {n.createdAt.slice(0, 10)}
                      </p>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 transition-colors hover:bg-secondary">
                  <Avatar initials={initialsOf(user.name)} className="size-7" />
                  <span className="hidden pr-1 text-sm font-medium sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings" })}>
                  <Settings className="mr-2 size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    logout();
                    navigate({ to: "/login", replace: true });
                  }}
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}