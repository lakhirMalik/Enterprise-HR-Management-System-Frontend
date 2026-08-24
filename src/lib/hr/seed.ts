export type Role = "hr" | "manager" | "employee" | "candidate";

export interface Account {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  employeeId?: string;
  avatarInitials: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  managerId: string | null;
  status: "active" | "probation" | "on-leave" | "offboarded";
  location: string;
  joinedAt: string;
  salary: number;
  leaveBalance: number;
  avatarInitials: string;
  employmentType: "full-time" | "part-time" | "contract";
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "present" | "late" | "absent" | "remote" | "leave";
  hours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "annual" | "sick" | "unpaid" | "parental" | "bereavement";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  decidedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assignedBy: string;
  due: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  minSalary: number;
  maxSalary: number;
  description: string;
  requirements: string[];
  status: "open" | "paused" | "closed";
  postedAt: string;
}

export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  appliedAt: string;
  stage: ApplicationStage;
  experienceYears: number;
  note: string;
  interviewAt?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string;
  gross: number;
  tax: number;
  benefits: number;
  bonus: number;
  net: number;
  status: "paid" | "processing";
}

export interface Review {
  id: string;
  employeeId: string;
  cycle: string;
  reviewerId: string;
  rating: number;
  goals: { title: string; progress: number }[];
  summary: string;
  status: "draft" | "shared" | "acknowledged";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  postedAt: string;
  audience: "all" | "managers" | "engineering";
  pinned: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: "policy" | "contract" | "payroll" | "onboarding";
  owner: string;
  updatedAt: string;
  size: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  severity: "info" | "warning" | "critical";
}

export interface AppNotification {
  id: string;
  to: Role | "all";
  title: string;
  body: string;
  at: string;
  read: boolean;
}

export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "People Ops",
  "Sales",
  "Finance",
  "Support",
];

export const accounts: Account[] = [
  {
    id: "u-hr",
    email: "hr@nimbus.hr",
    password: "hr12345",
    role: "hr",
    name: "Ayesha Karim",
    employeeId: "e-1",
    avatarInitials: "AK",
  },
  {
    id: "u-mgr",
    email: "manager@nimbus.hr",
    password: "manager12345",
    role: "manager",
    name: "Daniel Okafor",
    employeeId: "e-2",
    avatarInitials: "DO",
  },
  {
    id: "u-emp",
    email: "employee@nimbus.hr",
    password: "employee12345",
    role: "employee",
    name: "Mira Solberg",
    employeeId: "e-4",
    avatarInitials: "MS",
  },
  {
    id: "u-cand",
    email: "candidate@nimbus.hr",
    password: "candidate12345",
    role: "candidate",
    name: "Luis Fernández",
    avatarInitials: "LF",
  },
];

export const employees: Employee[] = [
  {
    id: "e-1",
    name: "Ayesha Karim",
    email: "hr@nimbus.hr",
    phone: "+1 415 220 8841",
    department: "People Ops",
    title: "Head of People",
    managerId: null,
    status: "active",
    location: "San Francisco",
    joinedAt: "2019-03-11",
    salary: 148000,
    leaveBalance: 17,
    avatarInitials: "AK",
    employmentType: "full-time",
  },
  {
    id: "e-2",
    name: "Daniel Okafor",
    email: "manager@nimbus.hr",
    phone: "+1 415 220 1190",
    department: "Engineering",
    title: "Engineering Manager",
    managerId: "e-1",
    status: "active",
    location: "Remote — Lagos",
    joinedAt: "2020-07-01",
    salary: 162000,
    leaveBalance: 12,
    avatarInitials: "DO",
    employmentType: "full-time",
  },
  {
    id: "e-3",
    name: "Priya Raman",
    email: "priya@nimbus.hr",
    phone: "+1 628 771 0032",
    department: "Engineering",
    title: "Senior Backend Engineer",
    managerId: "e-2",
    status: "active",
    location: "Bengaluru",
    joinedAt: "2021-01-18",
    salary: 134000,
    leaveBalance: 9,
    avatarInitials: "PR",
    employmentType: "full-time",
  },
  {
    id: "e-4",
    name: "Mira Solberg",
    email: "employee@nimbus.hr",
    phone: "+47 900 22 118",
    department: "Engineering",
    title: "Frontend Engineer",
    managerId: "e-2",
    status: "active",
    location: "Oslo",
    joinedAt: "2022-09-05",
    salary: 112000,
    leaveBalance: 14,
    avatarInitials: "MS",
    employmentType: "full-time",
  },
  {
    id: "e-5",
    name: "Tomás Vieira",
    email: "tomas@nimbus.hr",
    phone: "+351 913 887 210",
    department: "Design",
    title: "Product Designer",
    managerId: "e-1",
    status: "probation",
    location: "Lisbon",
    joinedAt: "2026-05-04",
    salary: 96000,
    leaveBalance: 6,
    avatarInitials: "TV",
    employmentType: "full-time",
  },
  {
    id: "e-6",
    name: "Hana Yoshida",
    email: "hana@nimbus.hr",
    phone: "+81 90 4412 8873",
    department: "Sales",
    title: "Account Executive",
    managerId: "e-1",
    status: "active",
    location: "Tokyo",
    joinedAt: "2023-02-20",
    salary: 104000,
    leaveBalance: 11,
    avatarInitials: "HY",
    employmentType: "full-time",
  },
  {
    id: "e-7",
    name: "Grace Mbeki",
    email: "grace@nimbus.hr",
    phone: "+27 82 551 9007",
    department: "Finance",
    title: "Payroll Specialist",
    managerId: "e-1",
    status: "active",
    location: "Cape Town",
    joinedAt: "2021-11-15",
    salary: 89000,
    leaveBalance: 15,
    avatarInitials: "GM",
    employmentType: "full-time",
  },
  {
    id: "e-8",
    name: "Owen Blake",
    email: "owen@nimbus.hr",
    phone: "+44 7700 900 651",
    department: "Support",
    title: "Support Lead",
    managerId: "e-1",
    status: "on-leave",
    location: "Manchester",
    joinedAt: "2020-04-27",
    salary: 78000,
    leaveBalance: 3,
    avatarInitials: "OB",
    employmentType: "full-time",
  },
];

export const attendance: AttendanceRecord[] = [
  { id: "a-1", employeeId: "e-4", date: "2026-08-10", clockIn: "09:04", clockOut: null, status: "present", hours: 0 },
  { id: "a-2", employeeId: "e-3", date: "2026-08-10", clockIn: "08:51", clockOut: null, status: "remote", hours: 0 },
  { id: "a-3", employeeId: "e-2", date: "2026-08-10", clockIn: "09:31", clockOut: null, status: "late", hours: 0 },
  { id: "a-4", employeeId: "e-8", date: "2026-08-10", clockIn: null, clockOut: null, status: "leave", hours: 0 },
  { id: "a-5", employeeId: "e-4", date: "2026-08-07", clockIn: "08:58", clockOut: "17:32", status: "present", hours: 8.5 },
  { id: "a-6", employeeId: "e-4", date: "2026-08-06", clockIn: "09:12", clockOut: "17:44", status: "remote", hours: 8.5 },
  { id: "a-7", employeeId: "e-4", date: "2026-08-05", clockIn: "09:41", clockOut: "18:02", status: "late", hours: 8.3 },
  { id: "a-8", employeeId: "e-3", date: "2026-08-07", clockIn: "08:47", clockOut: "17:20", status: "present", hours: 8.5 },
];

export const leaves: LeaveRequest[] = [
  {
    id: "l-1",
    employeeId: "e-4",
    type: "annual",
    from: "2026-08-24",
    to: "2026-08-28",
    days: 5,
    reason: "Family trip to the fjords",
    status: "pending",
  },
  {
    id: "l-2",
    employeeId: "e-3",
    type: "sick",
    from: "2026-08-03",
    to: "2026-08-04",
    days: 2,
    reason: "Flu recovery",
    status: "approved",
    decidedBy: "Daniel Okafor",
  },
  {
    id: "l-3",
    employeeId: "e-8",
    type: "parental",
    from: "2026-07-20",
    to: "2026-09-20",
    days: 45,
    reason: "Parental leave",
    status: "approved",
    decidedBy: "Ayesha Karim",
  },
  {
    id: "l-4",
    employeeId: "e-6",
    type: "unpaid",
    from: "2026-09-01",
    to: "2026-09-03",
    days: 3,
    reason: "Personal matters",
    status: "pending",
  },
];

export const tasks: Task[] = [
  {
    id: "t-1",
    title: "Complete Q3 security training",
    description: "Mandatory compliance module, 40 minutes.",
    assigneeId: "e-4",
    assignedBy: "Ayesha Karim",
    due: "2026-08-15",
    priority: "high",
    status: "in-progress",
  },
  {
    id: "t-2",
    title: "Submit expense report — July",
    description: "Upload receipts for the Berlin conference.",
    assigneeId: "e-4",
    assignedBy: "Grace Mbeki",
    due: "2026-08-12",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t-3",
    title: "Onboarding buddy check-in",
    description: "30-minute sync with Tomás on week-2 goals.",
    assigneeId: "e-2",
    assignedBy: "Ayesha Karim",
    due: "2026-08-11",
    priority: "medium",
    status: "todo",
  },
  {
    id: "t-4",
    title: "Finalise headcount plan",
    description: "Engineering hiring plan for Q4.",
    assigneeId: "e-2",
    assignedBy: "Ayesha Karim",
    due: "2026-08-20",
    priority: "high",
    status: "review",
  },
  {
    id: "t-5",
    title: "Publish updated leave policy",
    description: "Reflect new carry-over rules.",
    assigneeId: "e-1",
    assignedBy: "Board",
    due: "2026-08-09",
    priority: "high",
    status: "done",
  },
];

export const jobs: Job[] = [
  {
    id: "j-1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote — Europe",
    type: "full-time",
    minSalary: 110000,
    maxSalary: 145000,
    description:
      "Own the customer-facing surface of our platform, from design systems to performance budgets.",
    requirements: ["5+ years React", "TypeScript fluency", "Design system experience"],
    status: "open",
    postedAt: "2026-07-28",
  },
  {
    id: "j-2",
    title: "People Operations Partner",
    department: "People Ops",
    location: "San Francisco",
    type: "full-time",
    minSalary: 92000,
    maxSalary: 118000,
    description: "Partner with department leads on hiring, performance cycles and retention.",
    requirements: ["3+ years HRBP", "Employment law basics", "Analytics mindset"],
    status: "open",
    postedAt: "2026-08-01",
  },
  {
    id: "j-3",
    title: "Data Analyst — People Analytics",
    department: "Finance",
    location: "Hybrid — Cape Town",
    type: "contract",
    minSalary: 60000,
    maxSalary: 80000,
    description: "Build attrition, comp and headcount dashboards that leadership actually uses.",
    requirements: ["SQL", "Dashboarding", "Statistics"],
    status: "open",
    postedAt: "2026-08-05",
  },
  {
    id: "j-4",
    title: "Support Specialist",
    department: "Support",
    location: "Manchester",
    type: "part-time",
    minSalary: 34000,
    maxSalary: 42000,
    description: "First line of care for our enterprise customers.",
    requirements: ["Customer empathy", "Zendesk", "Shift flexibility"],
    status: "paused",
    postedAt: "2026-06-19",
  },
];

export const applications: Application[] = [
  {
    id: "ap-1",
    jobId: "j-1",
    candidateName: "Luis Fernández",
    candidateEmail: "candidate@nimbus.hr",
    appliedAt: "2026-08-02",
    stage: "interview",
    experienceYears: 6,
    note: "Strong design-systems portfolio.",
    interviewAt: "2026-08-14 14:00",
  },
  {
    id: "ap-2",
    jobId: "j-1",
    candidateName: "Nora Petrova",
    candidateEmail: "nora.p@example.com",
    appliedAt: "2026-08-03",
    stage: "screening",
    experienceYears: 4,
    note: "Referred by Priya.",
  },
  {
    id: "ap-3",
    jobId: "j-2",
    candidateName: "Samuel Adeyemi",
    candidateEmail: "sam.a@example.com",
    appliedAt: "2026-08-04",
    stage: "applied",
    experienceYears: 3,
    note: "",
  },
  {
    id: "ap-4",
    jobId: "j-3",
    candidateName: "Chen Wei",
    candidateEmail: "chen.w@example.com",
    appliedAt: "2026-07-30",
    stage: "offer",
    experienceYears: 5,
    note: "Offer sent 2026-08-08.",
  },
  {
    id: "ap-5",
    jobId: "j-2",
    candidateName: "Ivy Donnelly",
    candidateEmail: "ivy.d@example.com",
    appliedAt: "2026-07-22",
    stage: "rejected",
    experienceYears: 2,
    note: "Not enough HRBP exposure.",
  },
];

export const payslips: Payslip[] = [
  { id: "p-1", employeeId: "e-4", period: "July 2026", gross: 9333, tax: 2613, benefits: 420, bonus: 0, net: 6300, status: "paid" },
  { id: "p-2", employeeId: "e-4", period: "June 2026", gross: 9333, tax: 2613, benefits: 420, bonus: 800, net: 7100, status: "paid" },
  { id: "p-3", employeeId: "e-3", period: "July 2026", gross: 11166, tax: 3238, benefits: 500, bonus: 0, net: 7428, status: "paid" },
  { id: "p-4", employeeId: "e-2", period: "July 2026", gross: 13500, tax: 4185, benefits: 620, bonus: 1500, net: 10195, status: "paid" },
  { id: "p-5", employeeId: "e-4", period: "August 2026", gross: 9333, tax: 2613, benefits: 420, bonus: 0, net: 6300, status: "processing" },
];

export const reviews: Review[] = [
  {
    id: "r-1",
    employeeId: "e-4",
    cycle: "H1 2026",
    reviewerId: "e-2",
    rating: 4.4,
    goals: [
      { title: "Ship design system v2", progress: 80 },
      { title: "Reduce bundle size 20%", progress: 55 },
      { title: "Mentor one junior engineer", progress: 100 },
    ],
    summary: "Consistently raises the quality bar on the frontend platform.",
    status: "shared",
  },
  {
    id: "r-2",
    employeeId: "e-3",
    cycle: "H1 2026",
    reviewerId: "e-2",
    rating: 4.7,
    goals: [
      { title: "Migrate billing service", progress: 95 },
      { title: "On-call runbook coverage", progress: 70 },
    ],
    summary: "Outstanding ownership during the billing migration.",
    status: "acknowledged",
  },
  {
    id: "r-3",
    employeeId: "e-5",
    cycle: "Probation 30-day",
    reviewerId: "e-1",
    rating: 3.9,
    goals: [{ title: "Complete onboarding track", progress: 60 }],
    summary: "Settling in well; needs more exposure to research practice.",
    status: "draft",
  },
];

export const announcements: Announcement[] = [
  {
    id: "an-1",
    title: "New carry-over rules for annual leave",
    body: "From September, up to 10 unused annual leave days can be carried into the next year. Anything above expires on 31 December.",
    author: "Ayesha Karim",
    postedAt: "2026-08-06",
    audience: "all",
    pinned: true,
  },
  {
    id: "an-2",
    title: "Q3 performance cycle opens Monday",
    body: "Managers: self-reviews are due 22 August, calibration sessions run the following week.",
    author: "Ayesha Karim",
    postedAt: "2026-08-04",
    audience: "managers",
    pinned: false,
  },
  {
    id: "an-3",
    title: "Office closed 15 August",
    body: "The San Francisco office is closed for building maintenance. Remote day for everyone on site.",
    author: "Facilities",
    postedAt: "2026-08-01",
    audience: "all",
    pinned: false,
  },
];

export const documents: DocumentItem[] = [
  { id: "d-1", name: "Employee Handbook 2026.pdf", category: "policy", owner: "People Ops", updatedAt: "2026-07-30", size: "2.4 MB" },
  { id: "d-2", name: "Remote Work Policy.pdf", category: "policy", owner: "People Ops", updatedAt: "2026-06-11", size: "640 KB" },
  { id: "d-3", name: "Employment Contract — Template.docx", category: "contract", owner: "Legal", updatedAt: "2026-05-02", size: "180 KB" },
  { id: "d-4", name: "Payroll Calendar 2026.xlsx", category: "payroll", owner: "Finance", updatedAt: "2026-01-09", size: "96 KB" },
  { id: "d-5", name: "Onboarding Checklist.pdf", category: "onboarding", owner: "People Ops", updatedAt: "2026-08-05", size: "310 KB" },
];

export const auditLog: AuditEntry[] = [
  { id: "au-1", actor: "Ayesha Karim", action: "Approved leave request", target: "Owen Blake — parental", at: "2026-08-09 16:22", severity: "info" },
  { id: "au-2", actor: "Daniel Okafor", action: "Updated salary band", target: "Engineering L4", at: "2026-08-08 11:04", severity: "warning" },
  { id: "au-3", actor: "system", action: "Failed login attempts (5)", target: "grace@nimbus.hr", at: "2026-08-08 03:41", severity: "critical" },
  { id: "au-4", actor: "Grace Mbeki", action: "Ran payroll", target: "July 2026 cycle", at: "2026-07-28 09:15", severity: "info" },
  { id: "au-5", actor: "Ayesha Karim", action: "Created job posting", target: "Senior Frontend Engineer", at: "2026-07-28 08:52", severity: "info" },
];

export const notifications: AppNotification[] = [
  { id: "n-1", to: "hr", title: "2 leave requests waiting", body: "Mira Solberg and Hana Yoshida need a decision.", at: "2026-08-10 08:10", read: false },
  { id: "n-2", to: "manager", title: "Interview today", body: "Luis Fernández — Senior Frontend Engineer, 14:00.", at: "2026-08-10 07:40", read: false },
  { id: "n-3", to: "employee", title: "Payslip available", body: "Your July payslip is ready to download.", at: "2026-08-01 06:00", read: true },
  { id: "n-4", to: "candidate", title: "Interview scheduled", body: "Panel interview on 14 Aug at 14:00 (CET).", at: "2026-08-08 12:30", read: false },
];

export const headcountTrend = [
  { month: "Mar", headcount: 62, hires: 4, exits: 1 },
  { month: "Apr", headcount: 65, hires: 5, exits: 2 },
  { month: "May", headcount: 68, hires: 4, exits: 1 },
  { month: "Jun", headcount: 71, hires: 5, exits: 2 },
  { month: "Jul", headcount: 74, hires: 6, exits: 3 },
  { month: "Aug", headcount: 78, hires: 5, exits: 1 },
];
