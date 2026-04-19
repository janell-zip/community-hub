# CDC Platform — System Overview
**Version 1.0 · Community Development Center · April 2026**

---

## Overview

The CDC Platform is a dual-purpose web application built for SPUP's Community Development Center. On one side, it serves as a **promotional website** — a public-facing window into the CDC's work. It gives community members and visitors a clear view of ongoing and completed programs.

On the other, it is a **full* internal management system**. It brings together program tracking, budget planning, geographic mapping, and an approval workflow into one cohesive tool for CDC staff.

Together, the two sides replace scattered spreadsheets and manual coordination with something more intentional: a platform that communicates the CDC's impact outward while keeping operations organized internally.

Version 1.0 establishes the core foundation: the data models, user roles, public pages, and key workflows that the CDC will build on. It is designed to be practical and immediately useful, while leaving room to grow as needs evolve.

| | |
|---|---|
| **Framework** | Laravel |
| **Language** | PHP |
| **Version** | 1.0 |

---

## Who Uses It

The platform serves two distinct audiences — the public and internal CDC staff — each with their own dedicated experience.

| Role | Responsibilities |
|---|---|
| **Super Admin** | Full system access. Manages admin accounts, reviews and approves program requests, and handles sensitive operations like budget deletion. |
| **Admin** | Day-to-day operations: creating and updating programs, managing budgets, barangay records, and infrastructure pins. |
| **Public Visitor** | Browses the promotional website — home, about, and programs pages with no account required. |

---

## Core Features

The platform is organized into two layers: a public-facing website for community visibility, and an internal management system for CDC staff.

### Public Website

The public side of the platform is the CDC's face to the community. It is designed to be accessible to anyone — no account, no friction.

- **Home page** — introduces the CDC and its mission.
- **About page** — provides background on the organization, its goals, and its team.
- **Programs listing** — a publicly browsable directory of CDC programs, giving community members visibility into what is being done and where.

The public website is kept in sync with the admin system automatically — programs approved and managed internally are surfaced here without any extra publishing step.

### Program Management

Programs are the heart of the system. Each program moves through a defined lifecycle from proposal to completion, with status tracked at every step.

- Programs start in a `proposed` state and move through: `proposed` → `approved` → `ongoing` → `completed` (or `cancelled`).
- Six categories with color coding: Health, Education, Infrastructure, Livelihood, Disaster Risk Reduction, and Social Services.
- Programs can be linked to a specific geographic pin for location tracking.
- Key dates (start and end) are recorded per program.

### Approval Workflow

A lightweight governance layer ensures that no program moves forward without proper review.

- Admins submit an approval request for a proposed program.
- Super Admins review pending requests and approve or reject with a recorded reason.
- Admins can withdraw a pending request before it is actioned.
- Deletion of approved programs also goes through this workflow.
- Only one pending request is allowed per program at a time.

### Budget Management

Budgets can only be created for approved programs, linking financial planning directly to the governance workflow.

- Each approved program can have one budget with a defined allocated amount.
- Budgets support multiple line items (name, quantity, unit price) with automatic total calculation.
- Remaining balance is tracked as: `allocated amount − sum of line items`.
- Budget records include an audit trail: who last updated it and when.
- Only Super Admins can delete budgets.

### Barangay & Community Management

The system organizes geographic coverage by barangay, reflecting the CDC's area-based approach to community work.

- Create and manage barangay records with name, city, province, and geographic coordinates.
- Search and filter by name, city, or province.
- Each barangay can have multiple infrastructure pins associated with it.
- Deletion is restricted to Super Admins.

### Infrastructure & Pin Management

Pins represent physical sites or facilities in the community — from health posts to school buildings to construction areas.

- Each pin has a name, category, description, GPS coordinates, and status.
- Pin statuses: `active`, `proposed`, `under-construction`, `needs-assessment`, `inactive`.
- Pins are associated with a barangay and can be linked to programs.

### Account Management

Super Admins manage all admin accounts, including creation and activation.
Password changes are user-based. 

- Strong password requirements: minimum 8 characters, mixed case, at least one number.
- Accounts can be toggled active or inactive. Inactive accounts cannot log in.
- Super Admins cannot deactivate their own account or other Super Admin accounts.

---

## Key Entities

| Entity | Description |
|---|---|
| **Users** | Administrators with a role (`admin` or `super_admin`) and active status. Email is the unique identifier. |
| **Programs** | The central entity. Tracks title, description, category, status, dates, and an optional pin link. |
| **Barangays** | Geographic districts. Store name, city, province, and coordinate data. |
| **Pins** | Physical infrastructure sites with GPS coordinates, status, category, and barangay association. |
| **Categories** | Six predefined classifications used for both programs and pins (with slug, label, and color). |
| **Budgets** | One-to-one with Program. Stores allocated amount; totals are derived from line items. |
| **Budget Items** | Expense line items belonging to a budget. Each has name, quantity, unit price, and auto-calculated total. |
| **Program Requests** | Workflow records for approval or deletion requests. Tracks requester, actioner, status, and rejection reason. |

---

## Technical Architecture

### Patterns & Approach

- MVC architecture via Laravel (Eloquent models, controllers, Blade views).
- Role-based middleware for route protection.
- PHP native enums for status field validation and type safety.
- Cascade deletes at the database level (e.g., deleting a program removes its budget and requests).
- Geographic coordinates stored as JSON.
- Budget amounts use `decimal(12,2)` for financial precision.

### Security

- Passwords are hashed using Laravel's built-in hashing facade.
- Role-based access control separates admin and super admin capabilities.
- Inactive accounts are blocked from logging in even with correct credentials.
- Request validation is applied on all endpoints.
- Enum validation prevents invalid status values from being stored.

---

## Program Status Lifecycle

```
PROPOSED
   │
   │  Admin submits approval request
   ▼
PENDING REQUEST
   │
   ├── Super Admin rejects → back to PROPOSED (reason recorded)
   │
   └── Super Admin approves
            │
            ▼
         APPROVED
            │
            ├──→ ONGOING
            ├──→ COMPLETED
            └──→ CANCELLED
```

---

## Version 1.0 Scope & Limitations

Version 1.0 is a strong, working foundation. The list below is an honest picture of what this version covers and where it stops — so the team can plan accordingly.

**What Version 1.0 covers**

- Public-facing promotional website (home, about, programs)
- Full CRUD for programs, barangays, pins, and budgets
- Program approval and deletion workflows
- Role-based access control (admin and super admin)
- Budget line item management with automatic totals
- Account management by Super Admins

**Known limitations**

- No soft deletes — deleted records are permanently removed. Recovery requires a database backup.
- Budget line items require a full replacement on update; individual items cannot be edited in isolation.
- Budgets track planned allocation only — actual spending is not recorded.
- No notification system — status changes are only visible on the next page load.
- Map views are present in the interface but are not fully implemented in this version.
- No data export functionality (PDF, Excel, etc.).
- Reporting views exist but analytics depth is limited in v1.
- No audit logging across most entities — budgets track who last updated, but other records do not.
- Single-tenant design — no separation of data between multiple organizations.
- No API authentication — the platform is designed for internal use via the web interface.

---

## What Comes Next

| Feature | Description |
|---|---|
| **Richer public pages** | Expand the public website with program detail pages, impact statistics, and photo/media support. |
| **Soft deletes & audit logging** | Preserve deleted records and track who changed what across all entities. |
| **Actual spend tracking** | Record real expenses against budgets, not just planned allocation. |
| **Notifications** | Alert admins when requests are submitted, approved, or rejected. |
| **Data export** | Export program lists, budget reports, and analytics to PDF or Excel. |
| **Full map implementation** | Complete geographic views with pin layers, barangay boundaries, and filtering. |
| **Performance & pagination** | Optimize list views and enforce pagination for large datasets. |
| **Mobile field access** | A lightweight view optimized for field workers on mobile devices. |

---

## Route Reference

### Public Website

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Home page |
| `GET` | `/about` | About page |
| `GET` | `/programs` | Programs listing (read-only, no login required) |

### Authentication

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/login` | Login form |
| `POST` | `/admin/login` | Login submission |
| `POST` | `/admin/logout` | Logout |

### Programs

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/programs` | List all programs |
| `POST` | `/admin/programs` | Create a program |
| `PUT` | `/admin/programs/{id}` | Update a program |
| `DELETE` | `/admin/programs/{id}` | Delete a program |

### Approval Workflow

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/program-requests` | Submit approval or deletion request |
| `POST` | `/admin/program-requests/{id}/withdraw` | Withdraw a pending request |
| `PATCH` | `/admin/program-requests/{id}/action` | Approve or reject a request |
| `GET` | `/admin/program-requests/pending` | View all pending requests |

### Barangays

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/community` | List with search and filter |
| `GET` | `/admin/community/{id}` | View barangay details |
| `POST` | `/admin/community` | Create a barangay |
| `PUT` | `/admin/community/{id}` | Update a barangay |
| `DELETE` | `/admin/community/{id}` | Delete (Super Admin only) |

### Budgets

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/budget` | List budgets |
| `POST` | `/admin/budget` | Create a budget |
| `PUT` | `/admin/budget/{id}` | Update budget and line items |
| `DELETE` | `/admin/budget/{id}` | Delete (Super Admin only) |

### Pins

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/pins` | List all pins |
| `POST` | `/admin/pins` | Create a pin |
| `PUT` | `/admin/pins/{id}` | Update a pin |
| `DELETE` | `/admin/pins/{id}` | Delete a pin |

### Accounts *(Super Admin only)*

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/accounts` | List all admin accounts |
| `POST` | `/admin/accounts` | Create a new admin account |
| `PATCH` | `/admin/accounts/{id}/toggle` | Activate or deactivate an account |
| `PATCH` | `/admin/accounts/password` | Change a password |

---

*CDC Platform · Version 1.0 · Community Development Center · April 2026*