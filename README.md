# SaaS Project Management System

> A full-stack project management platform — a mini Trello / ClickUp — built with **Laravel 10 API** and **React 18 + Tailwind CSS**.

![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.1-777BB4?logo=php&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **User Authentication** — Register, login, and token-based API access with Laravel Sanctum
- **Organizations & Teams** — Create organizations, invite members with Owner / Admin / Member roles
- **Projects** — Group related work into projects within an organization
- **Kanban Board** — Drag & drop task management across Todo → In Progress → In Review → Done
- **Tasks & Subtasks** — Rich task details with priority, due dates, assignees, and checklist subtasks
- **Comments & Attachments** — Collaborate on tasks with threaded comments and file uploads
- **Activity Logs** — Complete audit trail of all project and task actions
- **Notifications** — In-app notifications for assignments and new comments

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend API | Laravel 10 (PHP 8.2) |
| Authentication | Laravel Sanctum |
| Database | MySQL 8.0 |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| HTTP Client | Axios |
| State Management | React Context API |
| Icons | Heroicons v2 |
| Notifications | react-hot-toast |

---

## Project Structure

```
saas-project-management/
├── backend/                    # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/API/  # Resource controllers
│   │   │   ├── Resources/        # API response transformers
│   │   │   └── Requests/         # Form validation requests
│   │   ├── Models/               # Eloquent models
│   │   ├── Notifications/        # Laravel notifications
│   │   └── Services/             # Business logic services
│   ├── database/
│   │   └── migrations/           # Database schema
│   └── routes/
│       └── api.php               # All API routes
│
└── frontend/                   # React 18 + Vite SPA
    └── src/
        ├── api/                  # Axios service layer
        ├── components/
        │   ├── board/            # Kanban board components
        │   ├── layout/           # App shell (sidebar, header)
        │   ├── tasks/            # Task modal, subtasks, comments
        │   ├── notifications/    # Notification dropdown
        │   └── ui/               # Shared UI primitives
        ├── context/              # Auth & notification context
        └── pages/                # Route-level page components
```

---

## Database Schema

```
users
organizations       → has many members, projects
organization_members (pivot: user_id, organization_id, role)
projects            → belongs to organization
project_members     (pivot: user_id, project_id, role)
tasks               → belongs to project; has subtasks, comments, attachments
subtasks            → belongs to task
comments            → belongs to task + user
attachments         → belongs to task + user
activity_logs       → polymorphic (organization / project / task)
notifications       → belongs to user
```

---

## Getting Started

### Prerequisites

- PHP 8.1+ with extensions: `pdo_mysql`, `mbstring`, `fileinfo`, `gd`
- Composer 2.x
- Node.js 18+ and npm 9+
- MySQL 8.0+

---

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials:

```env
DB_DATABASE=saas_pm
DB_USERNAME=root
DB_PASSWORD=your_password
```

```bash
php artisan migrate
php artisan storage:link
php artisan serve          # runs on http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:8000
npm run dev                # runs on http://localhost:5173
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | — | Register new user |
| POST | `/api/login` | — | Login → returns token |
| POST | `/api/logout` | ✓ | Revoke token |
| GET | `/api/me` | ✓ | Get authenticated user |
| PUT | `/api/profile` | ✓ | Update profile |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List user's organizations |
| POST | `/api/organizations` | Create organization |
| GET | `/api/organizations/{id}` | Get organization with members |
| PUT | `/api/organizations/{id}` | Update organization |
| DELETE | `/api/organizations/{id}` | Delete organization |
| POST | `/api/organizations/{id}/members` | Invite member |
| DELETE | `/api/organizations/{id}/members/{userId}` | Remove member |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations/{orgId}/projects` | List projects |
| POST | `/api/organizations/{orgId}/projects` | Create project |
| GET | `/api/organizations/{orgId}/projects/{id}` | Get project |
| PUT | `/api/organizations/{orgId}/projects/{id}` | Update project |
| DELETE | `/api/organizations/{orgId}/projects/{id}` | Delete project |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{projectId}/tasks` | List tasks |
| POST | `/api/projects/{projectId}/tasks` | Create task |
| GET | `/api/projects/{projectId}/tasks/{id}` | Get task detail |
| PUT | `/api/projects/{projectId}/tasks/{id}` | Update task |
| DELETE | `/api/projects/{projectId}/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/status` | Update status |
| PATCH | `/api/tasks/{id}/position` | Reorder task |
| PATCH | `/api/tasks/{id}/assign` | Assign/unassign user |

### Subtasks, Comments, Attachments

```
POST   /api/tasks/{taskId}/subtasks
PATCH  /api/subtasks/{id}/toggle
GET    /api/tasks/{taskId}/comments
POST   /api/tasks/{taskId}/comments
POST   /api/tasks/{taskId}/attachments   (multipart/form-data)
DELETE /api/attachments/{id}
```

### Notifications

```
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/{id}/read
POST   /api/notifications/read-all
```

---

## Key Design Decisions

- **Token-based auth** via Sanctum — stateless, works seamlessly with the SPA
- **Position field on tasks** — integer sort order per status column for stable drag & drop
- **Polymorphic activity logs** — one table for all actions across organizations, projects, and tasks
- **API Resources** — consistent JSON response shape across all endpoints
- **Role-based access** — owner/admin can manage members; members can only view/edit tasks

---

## License

MIT
