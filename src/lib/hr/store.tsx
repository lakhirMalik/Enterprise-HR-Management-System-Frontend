import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api from "@/lib/api";

// ============================================================
// TYPES — shaped to match the real backend models exactly.
// ============================================================

export type Role = "employee" | "manager" | "hr" | "super_admin" | "candidate";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  portfolioUrl?: string;
  resumeUrl?: string | null;
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  role?: Role;
}

export interface Employee {
  _id: string;
  user: PopulatedUser | string;
  department: string;
  position: string;
  salary?: number;
  hireDate?: string;
  manager?: PopulatedUser | string | null;
  phone?: string;
  location?: string;
  employmentStatus?: "active" | "probation" | "on_leave" | "offboarded";
  employmentType?: "full_time" | "part_time" | "contract";
  leaveBalance?: number;
  isDeleted?: boolean;
}

export interface AttendanceRecord {
  _id: string;
  employee: PopulatedUser | string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: "present" | "absent" | "half_day" | "on_leave" | "remote";
}

export interface LeaveRequest {
  _id: string;
  employee: PopulatedUser | string;
  type: "annual" | "sick" | "unpaid" | "parental" | "bereavement";
  startDate: string;
  endDate: string;
  days?: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: PopulatedUser | string | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: PopulatedUser | string;
  assignedBy: PopulatedUser | string;
  dueDate?: string;
  status: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  requirements?: string[];
  status: "open" | "closed";
  postedBy?: string;
  createdAt?: string;
}

export interface Application {
  _id: string;
  job: string | { _id: string; title: string; department: string; location: string; status: string };
  candidate: string | { _id: string; name: string; email: string };
  coverLetter?: string;
  phone?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  status: "submitted" | "reviewing" | "rejected" | "accepted";
  createdAt?: string;
}

export interface AppNotification {
  _id: string;
  recipient: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditEntry {
  _id: string;
  actor: PopulatedUser | string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface ReviewGoal {
  title: string;
  progress: number;
}

export interface Review {
  _id: string;
  employee: PopulatedUser | string;
  cycle: string;
  reviewer: PopulatedUser | string;
  rating: number;
  goals: ReviewGoal[];
  summary: string;
  status: "draft" | "shared" | "acknowledged";
}

export interface Payslip {
  _id: string;
  employee: PopulatedUser | string;
  period: string;
  gross: number;
  tax: number;
  benefits: number;
  bonus: number;
  net: number;
  status: "processing" | "paid";
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  author: PopulatedUser | string;
  audience: "all" | "manager" | "employee" | "hr";
  pinned: boolean;
  createdAt: string;
}

export interface DocumentItem {
  _id: string;
  name: string;
  category: "policy" | "contract" | "payroll" | "onboarding";
  owner: PopulatedUser | string;
  fileUrl: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  openJobs: number;
  pendingLeaves: number;
  tasksInProgress: number;
  hiresByMonth: { _id: string; hires: number }[];
  exitsByMonth: { _id: string; exits: number }[];
}

export interface LoginResult {
  ok: boolean;
  twoFactorRequired?: boolean;
  twoFactorMethod?: string | undefined;
  userId?: string;
  error?: string;
}

interface State {
  employees: Employee[];
  myTeam: Employee[];
  myProfile: Employee | null;
  attendance: AttendanceRecord[];
  myAttendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  myLeaves: LeaveRequest[];
  tasks: Task[];
  myTasks: Task[];
  jobs: Job[];
  applications: Application[];
  myApplications: Application[];
  notifications: AppNotification[];
  auditLog: AuditEntry[];
  reviews: Review[];
  myReviews: Review[];
  payslips: Payslip[];
  myPayslips: Payslip[];
  announcements: Announcement[];
  dashboardStats: DashboardStats | null;
  documents: DocumentItem[];
}

function emptyState(): State {
  return {
    employees: [],
    myTeam: [],
    myProfile: null,
    attendance: [],
    myAttendance: [],
    leaves: [],
    myLeaves: [],
    tasks: [],
    myTasks: [],
    jobs: [],
    applications: [],
    myApplications: [],
    notifications: [],
    auditLog: [],
    reviews: [],
    myReviews: [],
    payslips: [],
    myPayslips: [],
    announcements: [],
    dashboardStats: null,
    documents: [],
  };
}

interface HRContextValue extends State {
  user: AuthUser | null;
  ready: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (userId: string, token: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (input: {
    name?: string;
    email?: string;
    phone?: string;
    portfolioUrl?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  uploadProfileResume: (file: File) => Promise<{ ok: boolean; error?: string }>;

  fetchEmployees: () => Promise<{ ok: boolean; error?: string }>;
  fetchMyTeam: () => Promise<{ ok: boolean; error?: string }>;
  fetchMyProfile: () => Promise<{ ok: boolean; error?: string }>;
  onboardEmployee: (input: {
    name: string;
    email: string;
    role?: Role;
    department: string;
    position: string;
    salary?: number;
  }) => Promise<{ ok: boolean; tempPassword?: string; employee?: Employee; error?: string }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<{ ok: boolean; error?: string }>;
  deleteEmployee: (id: string) => Promise<{ ok: boolean; error?: string }>;
  updateSalary: (id: string, salary: number) => Promise<{ ok: boolean; error?: string }>;

  fetchMyAttendance: () => Promise<{ ok: boolean; error?: string }>;
  fetchAllAttendance: () => Promise<{ ok: boolean; error?: string }>;
  checkIn: () => Promise<{ ok: boolean; error?: string }>;
  checkOut: () => Promise<{ ok: boolean; error?: string }>;

  fetchMyLeaves: () => Promise<{ ok: boolean; error?: string }>;
  fetchAllLeaves: () => Promise<{ ok: boolean; error?: string }>;
  requestLeave: (input: {
    type: LeaveRequest["type"];
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  decideLeave: (id: string, status: "approved" | "rejected") => Promise<{ ok: boolean; error?: string }>;

  fetchMyTasks: () => Promise<{ ok: boolean; error?: string }>;
  fetchAllTasks: () => Promise<{ ok: boolean; error?: string }>;
  assignTask: (input: {
    title: string;
    description: string;
    assignedTo: string;
    dueDate?: string;
    priority?: Task["priority"];
  }) => Promise<{ ok: boolean; error?: string }>;
  setTaskStatus: (id: string, status: Task["status"]) => Promise<{ ok: boolean; error?: string }>;

  fetchJobs: () => Promise<{ ok: boolean; error?: string }>;
  createJob: (input: {
    title: string;
    description: string;
    department: string;
    location: string;
    employmentType: string;
    minSalary?: number;
    maxSalary?: number;
    requirements?: string[];
  }) => Promise<{ ok: boolean; error?: string }>;
  closeJob: (id: string) => Promise<{ ok: boolean; error?: string }>;
  fetchMyApplications: () => Promise<{ ok: boolean; error?: string }>;
  fetchJobApplications: (jobId: string) => Promise<Application[]>;
  applyToJob: (
    jobId: string,
    input: {
      coverLetter?: string | undefined;
      phone?: string | undefined;
      portfolioUrl?: string | undefined;
      resume?: File | undefined;
    },
  ) => Promise<{ ok: boolean; error?: string }>;
  updateApplicationStatus: (
    id: string,
    status: "reviewing" | "rejected" | "accepted",
  ) => Promise<{ ok: boolean; error?: string }>;

  fetchNotifications: () => Promise<{ ok: boolean; error?: string }>;
  markNotificationRead: (id: string) => Promise<{ ok: boolean; error?: string }>;

  fetchAuditLog: () => Promise<{ ok: boolean; error?: string }>;

  fetchMyReviews: () => Promise<{ ok: boolean; error?: string }>;
  fetchReviewsForEmployee: (employeeId: string) => Promise<Review[]>;
  createReview: (input: {
    employee: string;
    cycle: string;
    rating?: number;
    goals?: ReviewGoal[];
    summary?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  updateReview: (
    id: string,
    updates: Partial<Pick<Review, "rating" | "goals" | "summary" | "status">>,
  ) => Promise<{ ok: boolean; error?: string }>;
  acknowledgeReview: (id: string) => Promise<{ ok: boolean; error?: string }>;

  fetchMyPayslips: () => Promise<{ ok: boolean; error?: string }>;
  fetchEmployeePayslips: (employeeId: string) => Promise<Payslip[]>;
  generatePayslip: (input: {
    employee: string;
    period: string;
    gross: number;
    tax?: number;
    benefits?: number;
    bonus?: number;
  }) => Promise<{ ok: boolean; error?: string }>;
  markPayslipPaid: (id: string) => Promise<{ ok: boolean; error?: string }>;

  fetchAnnouncements: () => Promise<{ ok: boolean; error?: string }>;
  createAnnouncement: (input: {
    title: string;
    body: string;
    audience?: Announcement["audience"];
    pinned?: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  toggleAnnouncementPin: (id: string) => Promise<{ ok: boolean; error?: string }>;
  deleteAnnouncement: (id: string) => Promise<{ ok: boolean; error?: string }>;

  fetchDashboardStats: () => Promise<{ ok: boolean; error?: string }>;

  fetchDocuments: () => Promise<{ ok: boolean; error?: string }>;
  uploadDocument: (input: {
    name: string;
    category: DocumentItem["category"];
    file: File;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteDocument: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const HRContext = createContext<HRContextValue | null>(null);

function errMsg(e: unknown, fallback: string) {
  const anyErr = e as { response?: { data?: { message?: string } } };
  return anyErr?.response?.data?.message ?? fallback;
}

export function HRProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(emptyState);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.twoFactorRequired) {
        return {
          ok: false,
          twoFactorRequired: true,
          twoFactorMethod: res.data.twoFactorMethod,
          userId: res.data.userId,
        };
      }
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "Sign in failed") };
    }
  }, []);

  const verifyTwoFactor = useCallback(async (userId: string, token: string): Promise<LoginResult> => {
    try {
      const res = await api.post("/auth/2fa/login", { userId, token });
      setUser(res.data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "Invalid verification code") };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setState(emptyState());
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "Failed to change password") };
    }
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; role?: Role }) => {
      try {
        await api.post("/auth/register", input);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "Failed to create account") };
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async (input: { name?: string; email?: string; phone?: string; portfolioUrl?: string }) => {
      try {
        const res = await api.patch("/auth/profile", input);
        setUser(res.data.user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "Failed to update profile") };
      }
    },
    [],
  );

  const uploadProfileResume = useCallback(async (file: File) => {
    try {
      const form = new FormData();
      form.append("resume", file);
      const res = await api.post("/auth/profile/resume", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((u) => (u ? { ...u, resumeUrl: res.data.resumeUrl } : u));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e, "Failed to upload resume") };
    }
  }, []);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<
    { ok: true; data: T } | { ok: false; error: string }
  > => {
    setLoading(true);
    try {
      const data = await fn();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: errMsg(e, "Request failed") };
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- employees ----------
  const fetchEmployees = useCallback(async () => {
    const res = await run(() => api.get("/employees"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, employees: res.data.data.employees }));
    return { ok: true as const };
  }, [run]);

  const fetchMyTeam = useCallback(async () => {
    const res = await run(() => api.get("/employees/team"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myTeam: res.data.data.team }));
    return { ok: true as const };
  }, [run]);

  const fetchMyProfile = useCallback(async () => {
    const res = await run(() => api.get("/employees/me"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myProfile: res.data.data.employee }));
    return { ok: true as const };
  }, [run]);

  const onboardEmployee = useCallback(
    async (input: {
      name: string;
      email: string;
      role?: Role;
      department: string;
      position: string;
      salary?: number;
    }) => {
      try {
        const res = await api.post("/employees/onboard", input);
        setState((s) => ({ ...s, employees: [res.data.employee, ...s.employees] }));
        return { ok: true, tempPassword: res.data.tempPassword as string, employee: res.data.employee as Employee };
      } catch (e) {
        return { ok: false, error: errMsg(e, "Failed to onboard employee") };
      }
    },
    [],
  );

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    const res = await run(() => api.patch(`/employees/${id}`, updates));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) => (e._id === id ? res.data.data.employee : e)),
    }));
    return { ok: true as const };
  }, [run]);

  const deleteEmployee = useCallback(async (id: string) => {
    const res = await run(() => api.delete(`/employees/${id}`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, employees: s.employees.filter((e) => e._id !== id) }));
    return { ok: true as const };
  }, [run]);

  const updateSalary = useCallback(async (id: string, salary: number) => {
    const res = await run(() => api.patch(`/employees/${id}/salary`, { salary }));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      employees: s.employees.map((e) => (e._id === id ? res.data.data.employee : e)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- attendance ----------
  const fetchMyAttendance = useCallback(async () => {
    const res = await run(() => api.get("/attendance/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myAttendance: res.data.data.records }));
    return { ok: true as const };
  }, [run]);

  const fetchAllAttendance = useCallback(async () => {
    const res = await run(() => api.get("/attendance"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, attendance: res.data.data.records }));
    return { ok: true as const };
  }, [run]);

  const checkIn = useCallback(async () => {
    const res = await run(() => api.post("/attendance/check-in"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myAttendance: [res.data.data.attendance, ...s.myAttendance] }));
    return { ok: true as const };
  }, [run]);

  const checkOut = useCallback(async () => {
    const res = await run(() => api.post("/attendance/check-out"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      myAttendance: s.myAttendance.map((a) =>
        a._id === res.data.data.attendance._id ? res.data.data.attendance : a,
      ),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- leave ----------
  const fetchMyLeaves = useCallback(async () => {
    const res = await run(() => api.get("/leaves/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myLeaves: res.data.data.leaves }));
    return { ok: true as const };
  }, [run]);

  const fetchAllLeaves = useCallback(async () => {
    const res = await run(() => api.get("/leaves"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, leaves: res.data.data.leaves }));
    return { ok: true as const };
  }, [run]);

  const requestLeave = useCallback(
    async (input: { type: LeaveRequest["type"]; startDate: string; endDate: string; reason: string }) => {
      const res = await run(() => api.post("/leaves", input));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, myLeaves: [res.data.data.leave, ...s.myLeaves] }));
      return { ok: true as const };
    },
    [run],
  );

  const decideLeave = useCallback(async (id: string, status: "approved" | "rejected") => {
    const res = await run(() => api.patch(`/leaves/${id}`, { status }));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      leaves: s.leaves.map((l) => (l._id === id ? res.data.data.leave : l)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- tasks ----------
  const fetchMyTasks = useCallback(async () => {
    const res = await run(() => api.get("/tasks/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myTasks: res.data.data.tasks }));
    return { ok: true as const };
  }, [run]);

  const fetchAllTasks = useCallback(async () => {
    const res = await run(() => api.get("/tasks"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, tasks: res.data.data.tasks }));
    return { ok: true as const };
  }, [run]);

  const assignTask = useCallback(
    async (input: {
      title: string;
      description: string;
      assignedTo: string;
      dueDate?: string;
      priority?: Task["priority"];
    }) => {
      const res = await run(() => api.post("/tasks", input));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, tasks: [res.data.data.task, ...s.tasks] }));
      return { ok: true as const };
    },
    [run],
  );

  const setTaskStatus = useCallback(async (id: string, status: Task["status"]) => {
    const res = await run(() => api.patch(`/tasks/${id}`, { status }));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t._id === id ? res.data.data.task : t)),
      myTasks: s.myTasks.map((t) => (t._id === id ? res.data.data.task : t)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- jobs & applications ----------
  const fetchJobs = useCallback(async () => {
    const res = await run(() => api.get("/jobs"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, jobs: res.data.data.jobs }));
    return { ok: true as const };
  }, [run]);

  const createJob = useCallback(
    async (input: {
      title: string;
      description: string;
      department: string;
      location: string;
      employmentType: string;
      minSalary?: number;
      maxSalary?: number;
      requirements?: string[];
    }) => {
      const res = await run(() => api.post("/jobs", input));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, jobs: [res.data.data.job, ...s.jobs] }));
      return { ok: true as const };
    },
    [run],
  );

  const closeJob = useCallback(async (id: string) => {
    const res = await run(() => api.patch(`/jobs/${id}/close`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, jobs: s.jobs.map((j) => (j._id === id ? res.data.data.job : j)) }));
    return { ok: true as const };
  }, [run]);

  const fetchMyApplications = useCallback(async () => {
    const res = await run(() => api.get("/jobs/applications/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myApplications: res.data.data.applications }));
    return { ok: true as const };
  }, [run]);

  const fetchJobApplications = useCallback(async (jobId: string) => {
    const res = await run(() => api.get(`/jobs/${jobId}/applications`));
    return res.ok ? (res.data.data.applications as Application[]) : [];
  }, [run]);

  const applyToJob = useCallback(
    async (
      jobId: string,
      input: {
        coverLetter?: string | undefined;
        phone?: string | undefined;
        portfolioUrl?: string | undefined;
        resume?: File | undefined;
      },
    ) => {
      const form = new FormData();
      if (input.coverLetter) form.append("coverLetter", input.coverLetter);
      if (input.phone) form.append("phone", input.phone);
      if (input.portfolioUrl) form.append("portfolioUrl", input.portfolioUrl);
      if (input.resume) form.append("resume", input.resume);

      const res = await run(() =>
        api.post(`/jobs/${jobId}/apply`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      );
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, myApplications: [res.data.data.application, ...s.myApplications] }));
      return { ok: true as const };
    },
    [run],
  );

  const updateApplicationStatus = useCallback(
    async (id: string, status: "reviewing" | "rejected" | "accepted") => {
      const res = await run(() => api.patch(`/jobs/applications/${id}`, { status }));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) => (a._id === id ? res.data.data.application : a)),
      }));
      return { ok: true as const };
    },
    [run],
  );

  // ---------- notifications ----------
  const fetchNotifications = useCallback(async () => {
    const res = await run(() => api.get("/notifications"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, notifications: res.data.data.notifications }));
    return { ok: true as const };
  }, [run]);

  const markNotificationRead = useCallback(async (id: string) => {
    const res = await run(() => api.patch(`/notifications/${id}/read`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n._id === id ? res.data.data.notification : n)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- audit log ----------
  const fetchAuditLog = useCallback(async () => {
    const res = await run(() => api.get("/audit-logs"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, auditLog: res.data.data.logs }));
    return { ok: true as const };
  }, [run]);

  // ---------- reviews ----------
  const fetchMyReviews = useCallback(async () => {
    const res = await run(() => api.get("/reviews/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myReviews: res.data.data.reviews }));
    return { ok: true as const };
  }, [run]);

  const fetchReviewsForEmployee = useCallback(async (employeeId: string) => {
    const res = await run(() => api.get(`/reviews/employee/${employeeId}`));
    return res.ok ? (res.data.data.reviews as Review[]) : [];
  }, [run]);

  const createReview = useCallback(
    async (input: { employee: string; cycle: string; rating?: number; goals?: ReviewGoal[]; summary?: string }) => {
      const res = await run(() => api.post("/reviews", input));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, reviews: [res.data.data.review, ...s.reviews] }));
      return { ok: true as const };
    },
    [run],
  );

  const updateReview = useCallback(
    async (id: string, updates: Partial<Pick<Review, "rating" | "goals" | "summary" | "status">>) => {
      const res = await run(() => api.patch(`/reviews/${id}`, updates));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({
        ...s,
        reviews: s.reviews.map((r) => (r._id === id ? res.data.data.review : r)),
      }));
      return { ok: true as const };
    },
    [run],
  );

  const acknowledgeReview = useCallback(async (id: string) => {
    const res = await run(() => api.patch(`/reviews/${id}/acknowledge`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      myReviews: s.myReviews.map((r) => (r._id === id ? res.data.data.review : r)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- payroll ----------
  const fetchMyPayslips = useCallback(async () => {
    const res = await run(() => api.get("/payroll/my"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, myPayslips: res.data.data.payslips }));
    return { ok: true as const };
  }, [run]);

  const fetchEmployeePayslips = useCallback(async (employeeId: string) => {
    const res = await run(() => api.get(`/payroll/${employeeId}`));
    return res.ok ? (res.data.data.payslips as Payslip[]) : [];
  }, [run]);

  const generatePayslip = useCallback(
    async (input: { employee: string; period: string; gross: number; tax?: number; benefits?: number; bonus?: number }) => {
      try {
        const res = await api.post("/payroll", input);
        setState((s) => ({ ...s, payslips: [res.data.payslip, ...s.payslips] }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "Failed to generate payslip") };
      }
    },
    [],
  );

  const markPayslipPaid = useCallback(async (id: string) => {
    const res = await run(() => api.patch(`/payroll/${id}/pay`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      payslips: s.payslips.map((p) => (p._id === id ? res.data.data.payslip : p)),
    }));
    return { ok: true as const };
  }, [run]);

  // ---------- announcements ----------
  const fetchAnnouncements = useCallback(async () => {
    const res = await run(() => api.get("/announcements"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, announcements: res.data.data.announcements }));
    return { ok: true as const };
  }, [run]);

  const createAnnouncement = useCallback(
    async (input: { title: string; body: string; audience?: Announcement["audience"]; pinned?: boolean }) => {
      const res = await run(() => api.post("/announcements", input));
      if (!res.ok) return { ok: false as const, error: res.error };
      setState((s) => ({ ...s, announcements: [res.data.data.announcement, ...s.announcements] }));
      return { ok: true as const };
    },
    [run],
  );

  const toggleAnnouncementPin = useCallback(async (id: string) => {
    const res = await run(() => api.patch(`/announcements/${id}/pin`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({
      ...s,
      announcements: s.announcements.map((a) => (a._id === id ? res.data.data.announcement : a)),
    }));
    return { ok: true as const };
  }, [run]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    const res = await run(() => api.delete(`/announcements/${id}`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a._id !== id) }));
    return { ok: true as const };
  }, [run]);

  // ---------- documents ----------
  const fetchDocuments = useCallback(async () => {
    const res = await run(() => api.get("/documents"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, documents: res.data.data.documents }));
    return { ok: true as const };
  }, [run]);

  const uploadDocument = useCallback(
    async (input: { name: string; category: DocumentItem["category"]; file: File }) => {
      try {
        const form = new FormData();
        form.append("name", input.name);
        form.append("category", input.category);
        form.append("file", input.file);
        const res = await api.post("/documents", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setState((s) => ({ ...s, documents: [res.data.document, ...s.documents] }));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e, "Failed to upload document") };
      }
    },
    [],
  );

  const deleteDocument = useCallback(async (id: string) => {
    const res = await run(() => api.delete(`/documents/${id}`));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d._id !== id) }));
    return { ok: true as const };
  }, [run]);

  // ---------- dashboard stats ----------
  const fetchDashboardStats = useCallback(async () => {
    const res = await run(() => api.get("/dashboard/stats"));
    if (!res.ok) return { ok: false as const, error: res.error };
    setState((s) => ({ ...s, dashboardStats: res.data.data }));
    return { ok: true as const };
  }, [run]);

  const value = useMemo<HRContextValue>(
    () => ({
      ...state,
      user,
      ready,
      loading,
      login,
      verifyTwoFactor,
      logout,
      changePassword,
      register,
      updateProfile,
      uploadProfileResume,
      fetchEmployees,
      fetchMyTeam,
      fetchMyProfile,
      onboardEmployee,
      updateEmployee,
      deleteEmployee,
      updateSalary,
      fetchMyAttendance,
      fetchAllAttendance,
      checkIn,
      checkOut,
      fetchMyLeaves,
      fetchAllLeaves,
      requestLeave,
      decideLeave,
      fetchMyTasks,
      fetchAllTasks,
      assignTask,
      setTaskStatus,
      fetchJobs,
      createJob,
      closeJob,
      fetchMyApplications,
      fetchJobApplications,
      applyToJob,
      updateApplicationStatus,
      fetchNotifications,
      markNotificationRead,
      fetchAuditLog,
      fetchMyReviews,
      fetchReviewsForEmployee,
      createReview,
      updateReview,
      acknowledgeReview,
      fetchMyPayslips,
      fetchEmployeePayslips,
      generatePayslip,
      markPayslipPaid,
      fetchAnnouncements,
      createAnnouncement,
      toggleAnnouncementPin,
      deleteAnnouncement,
      fetchDashboardStats,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
    }),
    [
      state,
      user,
      ready,
      loading,
      login,
      verifyTwoFactor,
      logout,
      changePassword,
      register,
      updateProfile,
      uploadProfileResume,
      fetchEmployees,
      fetchMyTeam,
      fetchMyProfile,
      onboardEmployee,
      updateEmployee,
      deleteEmployee,
      updateSalary,
      fetchMyAttendance,
      fetchAllAttendance,
      checkIn,
      checkOut,
      fetchMyLeaves,
      fetchAllLeaves,
      requestLeave,
      decideLeave,
      fetchMyTasks,
      fetchAllTasks,
      assignTask,
      setTaskStatus,
      fetchJobs,
      createJob,
      closeJob,
      fetchMyApplications,
      fetchJobApplications,
      applyToJob,
      updateApplicationStatus,
      fetchNotifications,
      markNotificationRead,
      fetchAuditLog,
      fetchMyReviews,
      fetchReviewsForEmployee,
      createReview,
      updateReview,
      acknowledgeReview,
      fetchMyPayslips,
      fetchEmployeePayslips,
      generatePayslip,
      markPayslipPaid,
      fetchAnnouncements,
      createAnnouncement,
      toggleAnnouncementPin,
      deleteAnnouncement,
      fetchDashboardStats,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
    ],
  );

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const ctx = useContext(HRContext);
  if (!ctx) throw new Error("useHR must be used inside HRProvider");
  return ctx;
}

export const roleLabel: Record<Role, string> = {
  hr: "HR Manager",
  manager: "Manager",
  employee: "Employee",
  super_admin: "Super Admin",
  candidate: "Candidate",
};

// Helper: get initials from a name, since the backend no longer sends
// pre-computed avatarInitials like the old mock did.
export function initialsOf(name: string | undefined | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Helper: safely pull a display name off a field that may be a populated
// object or just a raw ObjectId string (depending on which endpoint sent it).
export function nameOf(ref: PopulatedUser | string | undefined | null): string {
  if (!ref) return "Unknown";
  return typeof ref === "string" ? ref : ref.name;
}