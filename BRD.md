# Employee Refreshment Quota System — Complete Project Document

> Give this entire file to Cursor AI. It contains everything: what to build, how to build it, the database, the API, the screens, and the rules.

---

## 1. Project Overview

**What is this?**
A company management portal for a Software House where a Super Admin can create monthly refreshment quotas (Lunch, Green Tea, Chocolates, Cans, etc.) and assign them to employees. Employees can view and use their quota from a mobile app (Flutter) or web. The system sends notifications via email, push, and in-app bell when quotas are assigned, used, running low, or exhausted.

**One-line summary:**

> Super Admin creates quota plans → assigns to employees → employees use quota on mobile/web → system tracks everything and sends smart notifications.

---

## 2. Tech Stack

| Layer              | Technology                                                    |
| ------------------ | ------------------------------------------------------------- |
| Backend API        | Laravel 12                                                    |
| Web Frontend       | Laravel 12 + React (Starter Kit)                              |
| Mobile App         | Flutter                                                       |
| Database           | MySQL 8.0                                                     |
| Cache & Queues     | Redis                                                         |
| Authentication     | Laravel Sanctum (token-based, works for both web and Flutter) |
| Push Notifications | Firebase Cloud Messaging (FCM)                                |
| Email              | Laravel Mail (SMTP / Mailgun)                                 |
| File Storage       | Laravel Storage (local for dev, S3 for production)            |
| Job Queue          | Laravel Horizon (Redis-backed)                                |

---

## 3. User Roles

There are only **2 roles** in this system right now:

### Super Admin

- Full access to everything
- Creates and manages items (Lunch, Green Tea, etc.)
- Creates quota plans and sets what items + quantities are in each plan
- Assigns plans to all employees or specific employees
- Views reports and usage history
- Sends manual notifications/announcements
- Manages employee accounts

### Employee

- Can only see their own quota
- Can use (redeem) their quota items
- Receives notifications
- Cannot see other employees' data
- Cannot change anything in the admin

---

## 4. Database Design (MySQL)

> Copy the DBML code below directly into https://dbdiagram.io/d/ to visualize it.

### Tables Overview

| #   | Table              | Purpose                                       |
| --- | ------------------ | --------------------------------------------- |
| 1   | `users`            | Every person's login account                  |
| 2   | `employees`        | Employee-specific profile info                |
| 3   | `items`            | Master list of items (Lunch, Green Tea, etc.) |
| 4   | `quota_plans`      | Monthly/weekly quota containers               |
| 5   | `quota_plan_items` | What items + how many are in each plan        |
| 6   | `employee_quotas`  | Each employee's personal quota tracker        |
| 7   | `quota_usages`     | Every time an employee uses a quota item      |
| 8   | `notifications`    | In-app notification records                   |

### DBML Code (paste into dbdiagram.io)

```dbml
// ================================================
//  EMPLOYEE REFRESHMENT QUOTA SYSTEM
//  Database: MySQL 8.0
//  Stack: Laravel 12 + React (Web) + Flutter (App)
// ================================================

// TABLE 1: USERS
// Every person in the system — super admin and employee both.
// The role column tells who is who.

Table users {
  id                  int           [pk, increment]
  name                varchar(100)  [not null]
  email               varchar(150)  [unique, not null]
  password            varchar(255)  [not null]
  role                enum('super_admin', 'employee') [default: 'employee']
  avatar              varchar(255)  [null]
  phone               varchar(20)   [null]
  is_active           tinyint(1)    [default: 1]
  email_verified_at   datetime      [null]
  remember_token      varchar(100)  [null]
  created_at          datetime      [not null]
  updated_at          datetime      [not null]

  Note: 'Core login table. One row per person. Role determines access level.'
}


// TABLE 2: EMPLOYEES
// Extra work-related info for employees.
// Not every user is an employee (super admin may not be).
// fcm_token is saved when employee logs into Flutter app.

Table employees {
  id              int           [pk, increment]
  user_id         int           [not null, ref: - users.id]
  employee_code   varchar(50)   [unique, not null, note: 'e.g. EMP-001']
  department      varchar(100)  [null, note: 'Engineering, Design, HR etc']
  designation     varchar(100)  [null, note: 'Flutter Dev, Designer etc']
  joining_date    date          [null]
  fcm_token       varchar(255)  [null, note: 'Firebase push token — updated on each Flutter login']
  created_at      datetime      [not null]
  updated_at      datetime      [not null]

  Note: 'Employee profile. Separate from users for clean separation of concerns.'
}


// TABLE 3: ITEMS
// Master list of everything that can be put in a quota.
// Super admin manages this. Lunch, Green Tea, Chocolate, Cans etc.

Table items {
  id          int           [pk, increment]
  name        varchar(100)  [not null, note: 'e.g. Lunch, Green Tea, Chocolate, Can']
  category    enum('food', 'beverage', 'snack', 'other') [default: 'other']
  description varchar(255)  [null]
  image_url   varchar(255)  [null]
  is_active   tinyint(1)    [default: 1]
  created_at  datetime      [not null]
  updated_at  datetime      [not null]

  Note: 'Master item list. Super admin adds/edits here. Reused across plans.'
}


// TABLE 4: QUOTA PLANS
// A plan is a container like "July 2025 Monthly Refreshment".
// Super admin creates plans and sets the time period.

Table quota_plans {
  id            int           [pk, increment]
  title         varchar(150)  [not null, note: 'e.g. July 2025 Monthly Refreshment Plan']
  description   text          [null]
  period_type   enum('monthly', 'weekly', 'custom') [default: 'monthly']
  starts_at     date          [not null]
  ends_at       date          [not null]
  is_active     tinyint(1)    [default: 1]
  created_by    int           [not null, ref: > users.id]
  created_at    datetime      [not null]
  updated_at    datetime      [not null]

  Note: 'The quota container. Add items to it via quota_plan_items, then assign to employees.'
}


// TABLE 5: QUOTA PLAN ITEMS
// Defines what is inside a plan and how many of each item.
// e.g. July Plan has: Lunch x2, Green Tea x4, Chocolate x3

Table quota_plan_items {
  id          int       [pk, increment]
  plan_id     int       [not null, ref: > quota_plans.id]
  item_id     int       [not null, ref: > items.id]
  quantity    int       [not null, note: 'How many of this item per employee. e.g. 4 green teas']
  created_at  datetime  [not null]
  updated_at  datetime  [not null]

  Note: 'Defines the contents of a plan. Lunch=2, GreenTea=4, Chocolate=3 etc.'
}


// TABLE 6: EMPLOYEE QUOTAS
// When a plan is assigned to employees, one row is created
// per employee per item. This tracks how much is left.
// used_qty goes up every time employee uses an item.
// remaining_qty = total_qty - used_qty

Table employee_quotas {
  id              int       [pk, increment]
  employee_id     int       [not null, ref: > employees.id]
  plan_id         int       [not null, ref: > quota_plans.id]
  item_id         int       [not null, ref: > items.id]
  total_qty       int       [not null, note: 'Copied from plan at time of assignment. e.g. 4']
  used_qty        int       [default: 0, note: 'Increases every time employee uses this item']
  remaining_qty   int       [not null, note: 'total_qty - used_qty. Updated on every usage.']
  status          enum('active', 'exhausted', 'expired') [default: 'active']
  created_at      datetime  [not null]
  updated_at      datetime  [not null]

  indexes {
    (employee_id, plan_id, item_id) [unique]
  }

  Note: 'The main tracker. One row = one item for one employee in one plan.'
}


// TABLE 7: QUOTA USAGES
// Every single time an employee uses a quota item, write here.
// This is the audit log. Employee can use everything in one day — no restriction.
// used_at records the exact moment.

Table quota_usages {
  id                  int       [pk, increment]
  employee_id         int       [not null, ref: > employees.id]
  employee_quota_id   int       [not null, ref: > employee_quotas.id]
  item_id             int       [not null, ref: > items.id]
  quantity_used       int       [not null, default: 1]
  used_at             datetime  [not null, note: 'Exact timestamp of usage']
  note                varchar(255) [null, note: 'Optional: reason or location']
  created_at          datetime  [not null]

  indexes {
    employee_id
    item_id
    used_at
  }

  Note: 'Immutable usage log. Never delete. Recomputing gives you used_qty on employee_quotas.'
}


// TABLE 8: NOTIFICATIONS
// In-app bell notification records.
// Email is sent via Laravel Mail (no DB record needed).
// Push is sent via FCM (no DB record needed).
// This table only stores in-app notifications.

Table notifications {
  id          int           [pk, increment]
  user_id     int           [not null, ref: > users.id]
  title       varchar(255)  [not null]
  message     text          [not null]
  type        enum('quota_assigned', 'quota_used', 'quota_low', 'quota_exhausted', 'quota_expired', 'general') [not null]
  is_read     tinyint(1)    [default: 0]
  related_id  int           [null, note: 'e.g. employee_quota_id or plan_id for deep linking']
  created_at  datetime      [not null]

  indexes {
    user_id
    is_read
    type
  }

  Note: 'In-app bell notifications only. Email and push go through separate Laravel channels.'
}
```

### How the Tables Connect

```
users (1) ──────── (1) employees
                        │
quota_plans (1) ──── (many) quota_plan_items ──── (many) items
      │
      └──── (triggers creation of) ────────────────────────┐
                                                           ▼
employees (1) ──── (many) employee_quotas ──── (1) items
                               │
                               └──── (many) quota_usages

users (1) ──── (many) notifications
```

---

## 5. Laravel Project Structure

```
my-project/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── EmployeeController.php
│   │   │   │   ├── ItemController.php
│   │   │   │   ├── QuotaPlanController.php
│   │   │   │   ├── QuotaController.php        ← assign + use quota
│   │   │   │   └── NotificationController.php
│   │   │   └── Web/
│   │   │       └── DashboardController.php
│   │   ├── Middleware/
│   │   │   ├── IsSuperAdmin.php
│   │   │   └── IsEmployee.php
│   │   └── Resources/                          ← API response formatting
│   │       ├── UserResource.php
│   │       ├── QuotaPlanResource.php
│   │       └── EmployeeQuotaResource.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Employee.php
│   │   ├── Item.php
│   │   ├── QuotaPlan.php
│   │   ├── QuotaPlanItem.php
│   │   ├── EmployeeQuota.php
│   │   ├── QuotaUsage.php
│   │   └── Notification.php
│   │
│   ├── Services/
│   │   ├── QuotaService.php                   ← all quota business logic here
│   │   └── NotificationService.php            ← sends email + push + in-app
│   │
│   ├── Jobs/
│   │   ├── AssignQuotaToEmployees.php          ← runs in background queue
│   │   └── ExpireQuotas.php                   ← scheduled daily
│   │
│   └── Notifications/
│       ├── QuotaAssigned.php                  ← Laravel notification class
│       ├── QuotaLow.php
│       └── QuotaExhausted.php
│
├── database/
│   └── migrations/
│       ├── create_users_table.php
│       ├── create_employees_table.php
│       ├── create_items_table.php
│       ├── create_quota_plans_table.php
│       ├── create_quota_plan_items_table.php
│       ├── create_employee_quotas_table.php
│       ├── create_quota_usages_table.php
│       └── create_notifications_table.php
│
├── routes/
│   ├── api.php                                ← all API routes here
│   └── web.php                                ← React web routes
│
└── resources/
    └── js/                                    ← React frontend lives here
        ├── pages/
        │   ├── admin/
        │   │   ├── Dashboard.jsx
        │   │   ├── Items.jsx
        │   │   ├── Plans.jsx
        │   │   ├── Employees.jsx
        │   │   └── Reports.jsx
        │   └── employee/
        │       ├── MyQuota.jsx
        │       └── History.jsx
        └── components/
            ├── QuotaCard.jsx
            └── NotificationBell.jsx
```

---

## 6. API Endpoints

All API routes are prefixed with `/api/v1/`. All protected routes require `Authorization: Bearer {token}` header.

### Auth Routes (Public)

```
POST   /api/v1/auth/login           → returns token
POST   /api/v1/auth/logout          → invalidates token
GET    /api/v1/auth/me              → returns logged-in user info
```

### Super Admin Routes (requires role: super_admin)

```
// Employee Management
GET    /api/v1/admin/employees              → list all employees
POST   /api/v1/admin/employees              → create employee + user account
GET    /api/v1/admin/employees/{id}         → single employee detail
PUT    /api/v1/admin/employees/{id}         → update employee
DELETE /api/v1/admin/employees/{id}         → deactivate employee

// Item Management
GET    /api/v1/admin/items                  → list all items
POST   /api/v1/admin/items                  → create new item (Lunch, Green Tea etc)
PUT    /api/v1/admin/items/{id}             → update item
DELETE /api/v1/admin/items/{id}             → delete/deactivate item

// Quota Plan Management
GET    /api/v1/admin/plans                  → list all plans
POST   /api/v1/admin/plans                  → create plan with items
GET    /api/v1/admin/plans/{id}             → plan detail with items
PUT    /api/v1/admin/plans/{id}             → update plan
POST   /api/v1/admin/plans/{id}/assign      → assign plan to employees
GET    /api/v1/admin/plans/{id}/report      → usage report for this plan

// Reports
GET    /api/v1/admin/reports/usage          → overall usage report
GET    /api/v1/admin/reports/employees      → per-employee report

// Notifications
POST   /api/v1/admin/notifications/send     → send manual announcement
```

### Employee Routes (requires role: employee)

```
// My Quota
GET    /api/v1/employee/quota               → my current active quota (all items)
GET    /api/v1/employee/quota/{item_id}     → single item quota detail
POST   /api/v1/employee/quota/{id}/use      → use quota (body: { quantity: 1 })
GET    /api/v1/employee/history             → my usage history

// Notifications
GET    /api/v1/employee/notifications       → my notifications list
POST   /api/v1/employee/notifications/{id}/read   → mark as read
POST   /api/v1/employee/notifications/read-all    → mark all as read

// Profile
PUT    /api/v1/employee/fcm-token           → update FCM push token (called on Flutter app launch)
```

---

## 7. Business Logic Rules

These rules must be implemented in `QuotaService.php`:

### Quota Assignment

1. When admin assigns a plan, loop through all selected employees
2. For each employee, for each item in the plan, create one `employee_quotas` row
3. Set `total_qty` from `quota_plan_items.quantity`
4. Set `remaining_qty = total_qty`, `used_qty = 0`, `status = active`
5. After creating all rows, dispatch `AssignQuotaToEmployees` job in queue
6. Job sends email + push + in-app notification to each employee

### Quota Usage

1. Employee calls `POST /employee/quota/{id}/use` with `{ quantity: 1 }`
2. Check: `employee_quota.remaining_qty >= requested quantity` → if not, return error
3. Check: `employee_quota.status == 'active'` → if expired/exhausted, return error
4. Increment `used_qty` by quantity, decrement `remaining_qty` by quantity
5. Write a new row to `quota_usages`
6. If `remaining_qty == 0`: set `status = exhausted`, send exhausted notification
7. If `remaining_qty == 1` (last one left): send `quota_low` notification
8. Employee CAN use all quota in one day — no daily limit enforced

### Quota Expiry

- Run a scheduled job daily at midnight: `ExpireQuotas`
- Finds all `employee_quotas` where `status = active` AND `quota_plans.ends_at < today`
- Sets them to `status = expired`
- Sends `quota_expired` notification to each affected employee

### Notification Rules

| Event                         | Who gets it             | Channels              |
| ----------------------------- | ----------------------- | --------------------- |
| Plan assigned to employee     | Employee                | Email + Push + In-app |
| Employee uses an item         | Employee (confirmation) | In-app only           |
| Employee uses an item         | Super Admin (log)       | In-app only           |
| Only 1 item remaining         | Employee                | Push + In-app         |
| Item quota exhausted (0 left) | Employee                | Email + Push + In-app |
| Plan period ends (expired)    | Employee                | Email + In-app        |
| Manual announcement           | All / specific employee | Email + Push + In-app |

---

## 8. Key Laravel Implementation Notes

### Sanctum Auth Setup

```php
// config/sanctum.php — stateful domains for React web
// Flutter uses token-based (no cookie needed)

// Login response should return:
{
  "token": "1|abc123...",
  "user": { "id": 1, "name": "Ali", "role": "employee" },
  "employee": { "id": 1, "employee_code": "EMP-001", ... }
}
```

### Middleware

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // all admin routes
});

Route::middleware(['auth:sanctum', 'role:employee'])->group(function () {
    // all employee routes
});
```

### QuotaService.php — Core Logic

```php
class QuotaService {
    public function assignPlanToEmployees(QuotaPlan $plan, array $employeeIds): void
    public function useQuota(EmployeeQuota $quota, int $quantity): void
    public function expireOldQuotas(): void
}
```

### NotificationService.php

```php
class NotificationService {
    public function sendQuotaAssigned(Employee $employee, QuotaPlan $plan): void
    public function sendQuotaLow(Employee $employee, EmployeeQuota $quota): void
    public function sendQuotaExhausted(Employee $employee, EmployeeQuota $quota): void
    public function sendPushNotification(string $fcmToken, string $title, string $body): void
    public function saveInApp(User $user, string $type, string $title, string $message, ?int $relatedId): void
}
```

### Scheduled Jobs in Kernel

```php
// app/Console/Kernel.php
$schedule->job(new ExpireQuotas)->dailyAt('00:01');
$schedule->job(new SendQuotaSummaryEmails)->monthlyOn(28); // month-end reminder
```

---

## 9. Web (React) Screens

### Super Admin Panel

| Screen        | What it does                                                         |
| ------------- | -------------------------------------------------------------------- |
| Dashboard     | Total employees, active plans, today's usage count, low quota alerts |
| Items         | Add / edit / delete items (Lunch, Green Tea, etc.)                   |
| Quota Plans   | Create plan, add items + quantities, set date range                  |
| Assign Plan   | Select plan → select employees (all or specific) → assign            |
| Employees     | Add / view / manage employees                                        |
| Reports       | Usage by employee, by item, by date range — export to CSV            |
| Notifications | Send manual announcement to all or specific employee                 |

### Employee Portal (web version of app)

| Screen        | What it does                                                   |
| ------------- | -------------------------------------------------------------- |
| My Quota      | Cards showing each item, remaining/total (e.g. Green Tea: 3/4) |
| Use Item      | Click item → confirm → quota decreases                         |
| My History    | List of all past usages with date/time                         |
| Notifications | Bell icon with unread count, list of all notifications         |

---

## 10. Flutter App Screens

| Screen          | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| Login           | Email + password → get Sanctum token → save to secure storage  |
| Home / My Quota | Beautiful cards for each quota item with progress bar          |
| Use Item        | Tap item → confirm bottom sheet → POST to API → show remaining |
| History         | Scrollable list of past usages                                 |
| Notifications   | Push + in-app list, unread badge on bell icon                  |
| Profile         | Name, employee code, department, logout                        |

### Flutter API Setup

```dart
// Base URL: https://yourapp.com/api/v1
// Headers on every request:
// Authorization: Bearer {token}
// Accept: application/json
// Content-Type: application/json

// Save token using flutter_secure_storage package
// On app launch: GET /auth/me to verify token is still valid
// On app launch: PUT /employee/fcm-token with new FCM token
```

---

## 11. Environment Variables (.env)

```env
APP_NAME="Company Quota System"
APP_ENV=production
APP_URL=https://yourapp.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quota_system
DB_USERNAME=root
DB_PASSWORD=yourpassword

QUEUE_CONNECTION=redis
CACHE_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your@mailgun.com
MAIL_PASSWORD=yourpassword
MAIL_FROM_ADDRESS=noreply@yourcompany.com
MAIL_FROM_NAME="Company HR"

# Firebase (for Flutter push notifications)
FCM_SERVER_KEY=your_firebase_server_key
```

---

## 12. Future Features — Already Supported by This Design

This database design is built to grow. Here is what you can add later **without changing any existing tables:**

| Future Feature                 | What to add                                                                        | Effort                       |
| ------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------- |
| **Department-based quota**     | Add `department` column to `quota_plans` → filter employees by dept when assigning | Low                          |
| **Attendance tracking**        | New table: `attendance_logs (id, employee_id, checked_in_at, checked_out_at)`      | Low                          |
| **Leave management**           | New table: `leaves (id, employee_id, type, from_date, to_date, status)`            | Low                          |
| **Multiple companies (SaaS)**  | Add `company_id` to every table → scope all queries by it                          | Medium                       |
| **Quota request by employee**  | New table: `quota_requests` → employee requests extra → admin approves             | Low                          |
| **Approval workflow**          | Add `approved_by`, `approved_at` to quota_requests                                 | Low                          |
| **Inventory / stock tracking** | New tables: `stock_items`, `stock_movements`                                       | Medium                       |
| **Payroll**                    | New table: `salary_records (employee_id, month, basic, deductions, net)`           | Medium                       |
| **Project & timesheet**        | New tables: `projects`, `timesheets`                                               | Medium                       |
| **Admin roles (HR, Manager)**  | Change `role` enum to add `hr_manager`, `department_head`                          | Low                          |
| **Quota transfer**             | Add `transferred_from` FK in `employee_quotas`                                     | Low                          |
| **Spending analytics**         | Already possible — query `quota_usages` grouped by date/employee/item              | None (data is already there) |

### Why this design is future-proof

1. **`items` is a master table** — you never hardcode "Lunch" or "Green Tea" anywhere in code. Add new items without any code change.

2. **`quota_plans` is a template** — you can reuse the same plan next month by duplicating it. Or add a `is_template` flag later.

3. **`employee_quotas` is per-employee** — even if you change the plan, existing employee quotas are untouched. Historical data stays clean.

4. **`quota_usages` never changes** — it only grows. You can always go back and recalculate anything from usage history.

5. **`notifications.type` is an enum** — adding new notification types is just an enum migration, no structural change.

6. **`employees.department` is a varchar** — when you're ready, create a proper `departments` table and replace this with a FK. Until then it just works.

7. **API is versioned (`/api/v1/`)** — when you add features that might break Flutter, create `/api/v2/` and keep old endpoints alive. Flutter users on old versions still work.

---

## 13. Development Order (What to Build First)

Build in this exact order so you always have something working:

```
Phase 1 — Foundation
  ✅ Laravel project setup + Sanctum auth
  ✅ All migrations
  ✅ All models with relationships
  ✅ Login API (works for both web and Flutter)

Phase 2 — Admin Core
  ✅ Items CRUD (API + React UI)
  ✅ Quota Plans CRUD (API + React UI)
  ✅ Employee management (API + React UI)
  ✅ Assign plan to employees

Phase 3 — Employee Side
  ✅ Employee quota view API
  ✅ Use quota API (with all business rules)
  ✅ Usage history API
  ✅ Flutter app — login + quota screen + use item

Phase 4 — Notifications
  ✅ In-app notifications (DB + API)
  ✅ Email notifications (Laravel Mail)
  ✅ Push notifications (FCM + Flutter)

Phase 5 — Reports & Polish
  ✅ Admin reports screen
  ✅ Scheduled expiry job
  ✅ Dashboard stats
  ✅ CSV export
```

---

## 14. Seed Data (for Testing)

When setting up locally, seed this data:

```
Super Admin:
  email: admin@company.com
  password: password
  role: super_admin

Employees (5 test employees):
  ali@company.com / password → EMP-001 / Engineering
  sara@company.com / password → EMP-002 / Design
  usman@company.com / password → EMP-003 / HR
  fatima@company.com / password → EMP-004 / Engineering
  bilal@company.com / password → EMP-005 / Management

Items:
  - Lunch (category: food)
  - Green Tea (category: beverage)
  - Chocolate (category: snack)
  - Soft Can (category: beverage)
  - Biscuits (category: snack)

Quota Plan:
  title: "July 2025 Monthly Refreshment"
  period: monthly
  items: Lunch x2, Green Tea x4, Chocolate x3, Can x4, Biscuits x5
  assign to: all 5 employees
```

---

_End of Document — version 1.0_
_Built for: [Your Software House Name]_
_Stack: Laravel 12 + React + Flutter + MySQL_
