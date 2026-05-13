# CDC Platform — System Overview
**Version 1.1 · Community Development Center · May 2026**

---

## Overview

The CDC Platform is a dual-purpose web application built for SPUP's Community Development Center. On one side, it serves as a **promotional website** — a public-facing window into the CDC's work. It gives community members and visitors a clear view of ongoing and completed programs.

On the other, it is a **full* internal management system**. It brings together program tracking, budget planning, geographic mapping, and an approval workflow into one cohesive tool for CDC staff.

Together, the two sides replace scattered spreadsheets and manual coordination with something more intentional: a platform that communicates the CDC's impact outward while keeping operations organized internally.

Version 1.1 builds on the core foundation established in v1.0. It introduces a fully operational admin dashboard, a restructured program component system, SDG tracker, activity types, beneficiary targeting, reach metrics, and significant content and layout updates to the promotional website. 

| | |
|---|---|
| **Framework** | Laravel |
| **Language** | PHP |
| **Version** | 1.1 |

---

## What's New in Version 1.1

**Admin Dashboard** 
A new dashboard landing page replaces the map as the default admin entry point. It provides a centralized overview of the entire system with the following: 
- **Stat cards** - includes total programs, active programs, total reach, total pins, and barangay coverage at a glance
- **Programs by Status** - donut chart with a side legend
- **Programs Added (Last 6 Months)** - line chart tracking program creation momentum
- **Programs by Component & Status** - stacked horizontal bar chart showing each component broken down by status
- **Component Overview** - radar chart normalizing reach and program count across all 7 components
- **Target Beneficiaries Distribution** - polar area cart for visual breakdown for who is being served
- **SDG Coverage** - horizontal bar chart showing how many programs are linked to each of the 17 SDGs 
- **Programs by Activity Type** - horizontal bar chart showing activity distribution across all program types
- **Upcoming Programs** and **Recently Added** tables for quick reference

**Restructured Program Components**
The six original program categories have been replaced with seven program components aligned to CDC's actual work:
- Spiritual & Values Formation
- Health & Well-Being
- Livelihood & Enterprise
- Education & Culture
- Digital Inclusion & Innovation
- Environmental Stewardship
- DRRM & Emergency Preparedness

**Activity Types**
Each program component now has a defined set of activity types. When a component is selected in the program form, the activity type dropdown auto-populates with relevant options. Examples include Medical/Dental Missions under Health, Computer Literacy under Digital Inclusion, Tree Planting under Environmental Stewardship, and Relief Operations under DRRM. 

**Reach and Target Beneficiaries**
Two new required fields have been added to programs: 
- **Reach** - a numeric count of how many individuals the program is expected to reach 
- **Target Beneficiaries** - a multi-select dropdown with the following options: Barangay Officials/Leaders, Women, Children, Person with Disability, Elderly, and Other Vulnerable Sectors. 

Both fields are visible in the program detail modal on the admin side and on the public programs calendar. 

**SDG Integration** 
Programs can now be linked to one or more of the 17 UN Sustainable Development Goals. SDGs are auto-suggested based on the selected program component when creating or editing a program, but can be manually adjusted. SDG data is stored in a dedicated sdgs table and linked via a program_sdg pivot table. SDGs are displayed as numbered colored chips in both the admin and public detail views. 

**Other Updates** 
The map's and community page's category filter have also been updated to reflect the 7 program components with correct color coding. 

**Public Website Updates** 
Significant content and layout updates were made to the public-facing website, which include but is not limited to: 
- **Navigation** - updated navbar title and subtitle
- **Home page** - updated Who We Are section with real content; refined What We Do section with new images; updated impact statistics; added hero image with adjusted object-position
- **Partners section** - added organization logos with an infinite scroll animation
- **About page** - float-based text wrap layout for the about hero section; updated with real program content, images, and links
- **Public programs calendar** - detail modal now shows activity type, reach, and target beneficiaries pulled from the admin system
- **Footer** - updated contact details, layout, and minor CSS refinements

Content for all pages has also been updated to reflect the information provided by the CDC. 

**Login** 
- Removed unused remember me paramater from the login flow
- Login now redirects to the dashboard instead of the map

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

- **Home page** — introduces the CDC and its mission with real content, images, and partner logos. 
- **About page** — provides background on the organization, its goals, and its team.
- **Programs listing** — a publicly browsable directory of CDC programs with a detail modal showing dates, location, description, activity type, reach, and target beneficiaries. 

The public website is kept in sync with the admin system automatically — programs approved and managed internally are surfaced here without any extra publishing step.

### Program Management

Programs are the heart of the system. Each program moves through a defined lifecycle from proposal to completion, with status tracked at every step.

- Programs start in a `proposed` state and move through: `proposed` → `approved` → `ongoing` → `completed` (or `cancelled`).
- Seven program components with color coding,
- Each program has an activity type, reach count, and target beneficiaries.
- Programs can be inked to SDGs (auto-suggested, manually editable).
- Programs can be linked to a specific geographic pin for location tracking.
- Key dates (start and end) are recorded per program.
- Date conflict warnings surface when a proposed program overlaps with an approved one. 

### Approval Workflow

A lightweight governance layer ensures that no program moves forward without proper review.

- Admins submit an approval request for a proposed program.
- Super Admins review pending requests and approve or reject with a recorded reason.
- Admins can withdraw a pending request before it is actioned.
- Deletion of approved programs also goes through this workflow.
- Only one pending request is allowed per program at a time.*

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
- Search and filter by name or by program component.
- The community table shows per-barangay pin counts broken down by each of the 7 program components.
- Deletion is restricted to Super Admins.

### Infrastructure & Pin Management

Pins represent physical sites or facilities in the community — from health posts to school buildings to construction areas.

- Each pin has a name, category, description, GPS coordinates, and status.
- Pin statuses: `active`, `proposed`, `under-construction`, `needs-assessment`, `inactive`.
- Pins are associated with a barangay and can be linked to programs.
- The map sidebar reflects the 7 updated program components with correct color coding.

### Account Management

Super Admins manage all admin accounts, including creation and activation.
Password changes are user-based. 

- Strong password requirements: minimum 8 characters, mixed case, at least one number.
- Accounts can be toggled active or inactive. Inactive accounts cannot log in.
- Super Admins cannot deactivate their own account. 

---

## Key Entities

| Entity | Description |
|---|---|
| **Users** | Administrators with a role (`admin` or `super_admin`) and active status. Email is the unique identifier. |
| **Programs** | The central entity. Tracks title, description, category, status, dates, and an optional pin link. |
| **Barangays** | Geographic districts. Store name, city, province, and coordinate data. |
| **Pins** | Physical infrastructure sites with GPS coordinates, status, category, and barangay association. |
| **Categories** | Seven predefined program components used for programs, pins, and community filtering (slug, label, color). |
| **SDGs** | The 17 UN Sustainable Development Goals, each with a number, title, and color. Linked to programs via pivot. |
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
- SDG data seeded via SdgSeeder; program–SDG links stored in program_sdg pivot table.
- Chart.js used for all dashboard visualizations, loaded via CDN.
- Activity types and SDG auto-suggestions are defined as static arrays on the Program model and passed to JS via window.* variables.

### Security

- Passwords are hashed using Laravel's built-in hashing facade.
- Role-based access control separates admin and super admin capabilities.
- Inactive accounts are blocked from logging in even with correct credentials.
- Request validation is applied on all endpoints.

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

## Version 1.1 Scope & Limitations

**What Version 1.1 adds**
- Admin dashboard with 8 charts and 2 summary tables
- Restructured program components (7 components replacing 6 categories)
- Activity type per program (component-specific dropdown)
- Reach and target beneficiaries fields on programs
- SDG tracking with auto-suggestion and manual selection
- Updated community table with new component columns
- Updated map filter chips to match new components
- Public programs calendar now surfaces activity type, reach, and beneficiaries
- Public website content updates across home, about, programs, partners, and footer
- Dashboard as default admin landing page

**Known limitations carried from v1.0**
- Limited location detection
- No soft deletes — deleted records are permanently removed.
- Budget line items require a full replacement on update.
- Budgets track planned allocation only — actual spending is not recorded.
- No notification system.
- No data export functionality (PDF, Excel, etc.).
- No audit logging across most entities.
- No API authentication.

---

## What Comes Next

| Feature | Description |
|---|---|
| **Soft deletes & audit logging** | Preserve deleted records and track who changed what across all entities. |
| **Actual spend tracking** | Record real expenses against budgets, not just planned allocation. |
| **Notifications** | Alert admins when requests are submitted, approved, or rejected. |
| **Data export** | Export program lists, budget reports, and analytics to PDF or Excel. |
| **Richer public pages** | Program detail pages, impact statistics, and photo/media support. |
| **Performance & pagination** | Optimize list views and enforce pagination for large datasets. |
| **Mobile field access** | A lightweight view optimized for field workers on mobile devices. |

---

## Route Reference

### Public Website

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Home page |
| `GET` | `/about` | About page |
| `GET` | `/programs` | Programs calendar (public, no login required) |

### Authentication

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/login` | Login form |
| `POST` | `/admin/login` | Login submission |
| `POST` | `/admin/logout` | Logout |

### Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Admin dashboard (default landing page) |

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

*CDC Platform · Version 1.1 · Community Development Center · May 2026*