# Nimbus HR — Enterprise HR Management System (Frontend)

A full-featured HR management platform frontend, built with React, TypeScript, and TanStack Start, wired to a custom Node.js/Express/MongoDB backend.

## Features

- **Authentication** — email/password login, two-factor authentication (email or authenticator app), candidate self-signup
- **People management** — employee directory, onboarding, role assignment, manager reporting lines, soft-delete/restore
- **Attendance** — clock in/out, attendance history and filtering
- **Leave management** — request, approve, and reject leave with type and balance tracking
- **Tasks** — assign and track tasks with drag-and-drop status columns
- **Recruitment** — job postings, public careers page, candidate application pipeline with resume uploads and candidate profiles
- **Payroll** — payslip generation and payment tracking
- **Performance** — review cycles, ratings, and goal tracking
- **Announcements** — company-wide and audience-targeted announcements
- **Documents** — company document storage with role-based access
- **Audit log** — tracked history of sensitive actions
- **Role-based access control** — super admin, HR, manager, employee, and candidate roles with distinct permissions throughout

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React framework)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com/) components
- Axios for API communication

The backend for this project lives in a separate repository: [Enterprise-HR-Management-System-Backend](https://github.com/lakhirMalik/Enterprise-HR-Management-System-Backend).

## Getting started

Requires [Node.js](https://nodejs.org/) and npm.

```sh
git clone https://github.com/lakhirMalik/Enterprise-HR-Management-System-Frontend.git
cd Enterprise-HR-Management-System-Frontend
npm install
npm run dev
```

The app expects the backend API to be running locally (see the backend repo for setup) and proxied via `/api` and `/uploads`, configured in `vite.config.ts`.

## Project structure

```
src/
  components/    Reusable UI components (shadcn/ui + custom HR components)
  lib/hr/        Central data store (React Context) wired to the backend API
  routes/        File-based routes (TanStack Router) — one file per page
```