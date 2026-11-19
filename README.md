# Task Manager

Full-stack task and project management application with role-based access, email-driven account flows, and cookie-based JWT authentication protected by CSRF. Users manage tasks on a Kanban-style board; admins manage projects, roles, soft-deleted tasks, and activity logs.

---

## Tech Stack

### Backend
| Layer         | Technology |
|---------------| --- |
| Framework     | Flask 3 |
| ORM / DB      | Flask-SQLAlchemy, PostgreSQL (`psycopg2`) |
| Migrations    | Flask-Migrate / Alembic |
| Auth          | Flask-JWT-Extended (HTTP-only cookies + CSRF) |
| Validation    | Marshmallow / flask-marshmallow |
| API docs      | Flasgger (Swagger UI) |
| Email         | Flask-Mail (SMTP / Gmail) |
| Rate limiting | Flask-Limiter |
| CORS          | flask-cors (`supports_credentials=True`) |
| Uploads       | Local `uploads/` with Bleach SVG sanitization |
| WebSockets    | Flask-SocketIO (eventlet) |

### Frontend
| Layer      | Technology |
|------------| --- |
| UI         | React 19 |
| Build      | Vite 8 |
| Routing    | React Router DOM 7 |
| HTTP       | Axios (`withCredentials`) |
| Styling    | Bootstrap 5 |
| DnD board  | `@hello-pangea/dnd` |
| Tooltips   | tippy.js |
| Icons      | SVGR (`vite-plugin-svgr`) |
| WebSockets | Socket.IO Client (socket.io-client) |

---

## Key Features

- **Authentication & accounts** — register, login/logout, email verification, forgot/reset password, soft-delete account and restore via emailed token
- **JWT in cookies** — short-lived access token (15 min) and long-lived refresh token (30 days) with refresh-token rotation and JTI blocklist
- **CSRF protection** — double-submit CSRF tokens for state-changing requests and refresh
- **Role-based access** — `admin` and `user` roles; admin-only project CRUD, archive, deleted-task restore, user role updates, activity logs with filtering (`taskId`, `userId`) and paginated infinite scroll (50 items per page)
- **Tasks** — create/update/soft-delete, assign, priorities, statuses (backlog → cancelled), due dates, estimated hours, filters, follow/unfollow, related-task links
- **Kanban board** — drag-and-drop status columns on the home page
- **Projects** — list/filter, admin create/edit/archive/unarchive, project detail view
- **Comments & attachments** — task comments; file attachments on tasks, projects, and comments (images & common documents, max 10 MB)
- **Notifications** — real-time notifications via WebSockets for task comments and updates, unread count tracking, and options to mark notifications as read individually or in bulk
- **Profile & settings** — view/update profile, change password (invalidates other sessions), theme-aware Bootstrap UI
- **API documentation** — Swagger UI via Flasgger

---

## Screenshots

### Kanban Board & Task Management
![Kanban board view](screenshots/board-view.png)
*Task board with status columns (`Backlog`, `To Do`, `In Progress`), task cards showing priority, assignee, due date, project, and estimated hours.*

![Dragging a task card](screenshots/drag-and-drop.png)
*Drag-and-drop interaction moving a task card across status columns.*

![Task filtering by priority](screenshots/task-filtering.png)
*Filtering tasks by criteria such as priority (`Low`, `Medium`, `High`) alongside search.*

![Task editing and attachments](screenshots/task-edit.png)
*Task detail and edit view with description, assignee, status, priority, project, due date, related tasks, and file attachments.*

### Projects, Notifications & Admin Activity Logs
![Active and archived projects](screenshots/projects.png)
*Projects view separating active and archived projects with descriptions, creation dates, creators, and attachments.*

![Real-time inbox notifications](screenshots/live-notifications.png)
*Inbox view showing live notifications (`New comment`), unread badge counter, and mark-as-read actions.*

![Admin activity logs](screenshots/activity-logs.png)
*Activity logs table tracking task changes (`TASK_UPDATED`, field, old/new values) with task and user filters.*

---

## Directory Structure

```
task-manager/
├── README.md
├── docker-compose.yml
├── .env.example                # Docker Compose environment template
├── .dockerignore
├── backend/
│   ├── app/
│   │   ├── constants/          # Role, priority, and task-status IDs
│   │   ├── decorators/         # roles_required
│   │   ├── errors/             # Global error handlers
│   │   ├── exceptions/         # HTTP exception types
│   │   ├── extensions/         # db, jwt, mail, migrate, limiter, ma, blocklist, connection, socketio
│   │   ├── models/             # SQLAlchemy models
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # Flask blueprints (API endpoints)
│   │   ├── schemas/            # Marshmallow schemas
│   │   ├── seeds/              # Seed scripts for roles, statuses, admin, etc.
│   │   ├── services/           # Business logic
│   │   ├── utils/              # File storage, security helpers, parsers
│   │   └── __init__.py         # Application factory (create_app)
│   ├── docs/                   # Flasgger YAML specs per endpoint
│   ├── templates/              # Email HTML templates
│   ├── uploads/                # Uploaded files (gitignored)
│   ├── Dockerfile
│   ├── docker-entrypoint.sh    # Wait for DB → migrate → seed → gunicorn
│   ├── .env.example
│   ├── .flaskenv
│   ├── config.py
│   ├── requirements.txt
│   ├── run.py                  # Dev entrypoint
│   ├── seed.py                 # Database seeder
│   └── wsgi.py                 # Production WSGI entrypoint
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                # Axios client + CSRF store
│   │   ├── assets/             # Icons and static images
│   │   ├── components/         # UI components
│   │   ├── context/            # AuthContext / useAuth, NotificationContext
│   │   ├── hooks/              # useNotificationsWebSocket
│   │   ├── pages/              # Route pages
│   │   ├── routes/             # ProtectedRoute, GuestRoute, AdminRoute
│   │   ├── services/           # API service modules
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile              # Multi-stage Vite build + nginx
│   ├── nginx.conf
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── migrations/                 # Alembic migration versions (required for Docker)
```

---

## Prerequisites

- **Python** 3.11+ (recommended) — only for non-Docker local runs
- **Node.js** 18+ and npm — only for non-Docker local runs
- **PostgreSQL** 14+ — only for non-Docker local runs (Compose provides Postgres)
- **Docker** and **Docker Compose** — for containerized runs
- A Gmail (or other SMTP) account if you want email verification / password reset / account restore to send real mail

---

## Running with Docker Compose

The Compose stack starts three services:

| Service | Image / build | Host port | Role |
| --- | --- | --- | --- |
| `db` | `postgres:16-alpine` | (internal only) | PostgreSQL |
| `backend` | `backend/Dockerfile` | `5000` | Flask API via Gunicorn |
| `frontend` | `frontend/Dockerfile` | `8080` | React SPA via nginx |

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` as needed (especially `JWT_SECRET_KEY`, mail credentials, and the seeded admin password).

### 2. Build and start

```bash
docker compose up --build
```

On first start the backend entrypoint:

1. Waits for PostgreSQL to become healthy  
2. Runs `flask db upgrade`  
3. Seeds roles, statuses, priorities, and the admin user (`SEED_ON_START=true` by default)  
4. Starts Gunicorn on port 5000  

### 3. Open the app

- **Frontend:** http://localhost:8080  
- **API / Swagger:** http://localhost:5000/apidocs  
- **Default admin:** values of `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`

### Useful Compose commands

```bash
docker compose up --build -d      # detached
docker compose logs -f backend    # follow API logs
docker compose down               # stop containers
docker compose down -v            # stop and remove DB/upload volumes
```

Set `SEED_ON_START=false` in `.env` after the first successful start if you do not want seeding on every backend restart (seeding is idempotent, so leaving it `true` is usually fine).

> **Note:** `VITE_API_URL` and `VITE_APP_URL` are baked into the frontend image at **build** time. Change them in `.env`, then rebuild the frontend (`docker compose up --build`) for the new values to take effect.

---

## Running Locally

All backend commands assume the **repository root** (`task-manager/`) is on `PYTHONPATH`, so imports like `backend.app` resolve. In PyCharm this is usually automatic; in a terminal:

```bash
# Windows (PowerShell)
$env:PYTHONPATH = (Get-Location).Path

# macOS / Linux
export PYTHONPATH="$(pwd)"
```

### 1. Backend

#### Create virtualenv and install dependencies

```bash
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r backend/requirements.txt
```

#### Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`. Required / important variables:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET_KEY` | Secret used to sign JWTs |
| `DATABASE_URL` | PostgreSQL URI, e.g. `postgresql://postgres:PASSWORD@localhost:5432/task_manager` |
| `JWT_COOKIE_SECURE` | `false` for local HTTP; `true` in production (HTTPS) |
| `BASE_URL` | Backend origin, e.g. `http://localhost:5000` |
| `FRONTEND_URL` | Frontend origin for CORS, e.g. `http://localhost:5173` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_DEFAULT_SENDER` | SMTP credentials (Gmail app password recommended) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials for the seeded admin user |

#### Create database schema and seed data

```bash
# From repo root, with venv active and PYTHONPATH set
set FLASK_APP=backend.app:create_app   # Windows cmd
# $env:FLASK_APP = "backend.app:create_app"  # PowerShell
# export FLASK_APP=backend.app:create_app    # macOS / Linux

flask db upgrade
python -m backend.seed
```

Seeding creates roles (`admin`, `user`), task statuses, priorities, sample project data, and an admin user from `SEED_ADMIN_*`.

#### Start the API server

```bash
python -m backend.run
```

The API listens on **http://localhost:5000** by default.  
Swagger UI: **http://localhost:5000/apidocs**

Production-style entrypoint (optional):

```bash
# gunicorn wsgi:app   # run from backend/ with package path configured
```

---

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Ensure `frontend/.env` contains:

```env
VITE_API_URL=http://localhost:5000
```

Start the Vite dev server:

```bash
npm run dev
```

App: **http://localhost:5173**

Build for production:

```bash
npm run build
npm run preview
```

---

## API Endpoints Overview

Base URL: `http://localhost:5000`  
Authenticated routes expect JWT cookies. State-changing methods also require the `X-CSRF-TOKEN` header (see Security).

### Auth — `/auth`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login; sets JWT cookies; returns CSRF tokens |
| POST | `/auth/refresh` | Refresh JWT + CSRF | Rotate tokens; returns new CSRF tokens |
| POST | `/auth/logout` | Optional cookies | Invalidate sessions; clear cookies |
| POST | `/auth/clear-cookies` | No | Clear JWT cookies without full session invalidation |
| POST | `/auth/request-email-verification` | No | Send verification email |
| GET | `/auth/verify-email/<token>` | No | Validate verification token |
| POST | `/auth/verify-email/<token>` | No | Confirm email |
| POST | `/auth/forgot-password` | No | Send password-reset email |
| GET | `/auth/reset-password/<token>` | No | Validate reset token |
| POST | `/auth/reset-password/<token>` | No | Set new password |

### Users — `/users`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/users` | JWT | List users (summary) |
| GET | `/users/profile` | JWT | Current user profile |
| POST | `/users/change-password` | JWT + CSRF | Change password; re-issues cookies |
| POST | `/users/update` | JWT + CSRF | Update profile |
| DELETE | `/users/delete` | JWT + CSRF | Soft-delete own account |
| POST | `/users/restore-request` | No | Request account restore email |
| GET | `/users/restore/<token>` | No | Validate restore token |
| POST | `/users/restore/<token>` | No | Restore account |

### Tasks — `/tasks`

| Method | Path                               | Auth | Description                |
| --- |------------------------------------| --- |----------------------------|
| GET | `/tasks`                           | JWT | List/filter tasks          |
| GET | `/tasks/<taskId>`                  | JWT | Get task                   |
| POST | `/tasks/create_task`               | JWT + CSRF | Create task                |
| PATCH | `/tasks/<taskId>`                  | JWT + CSRF | Update task                |
| DELETE | `/tasks/<taskId>`                  | JWT + CSRF | Soft-delete task           |
| POST | `/tasks/<taskId>/attachments`      | JWT + CSRF | Upload task files          |
| GET | `/tasks/<taskId>/comments`         | JWT | List comments              |
| POST | `/tasks/<taskId>/comments`         | JWT + CSRF | Create comment             |
| POST / DELETE | `/tasks/<taskId>/follow`           | JWT + CSRF | Follow / unfollow          |
| GET / POST / DELETE | `/tasks/<taskId>/related`          | JWT (+ CSRF for mutations) | Related tasks              |
| GET | `/tasks/deleted`                   | JWT + **admin** | List soft-deleted tasks    |
| GET | `/tasks/deleted/<taskId>`          | JWT + **admin** | Get deleted task           |
| GET | `/tasks/deleted/<taskId>/comments` | JWT + **admin** | Get deleted tasks comments |
| PATCH | `/tasks/restore/<taskId>`          | JWT + **admin** | Restore deleted task       |

Query filters for task lists include: `text`, `assignedToId`, `statusId`, `priorityId`, `projectId`, `hasProject`, `dueBefore`, `dueAfter`, `createdBefore`, `createdAfter`, `overdue`, `hasDueDate`, `followedById`.

### Projects — `/projects`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/projects` | JWT | List/filter projects |
| GET | `/projects/list` | JWT | Compact project list |
| GET | `/projects/<projectId>` | JWT | Get project |
| POST | `/projects/create_project` | JWT + **admin** | Create project |
| PATCH | `/projects/<projectId>` | JWT + **admin** | Update project |
| POST | `/projects/<projectId>/archive` | JWT + **admin** | Archive |
| POST | `/projects/<projectId>/unarchive` | JWT + **admin** | Unarchive |
| POST | `/projects/<projectId>/attachments` | JWT + CSRF | Upload project files |

### Notifications — `/notifications`

| Method | Path                                   | Auth            | Description                        |
| --- |----------------------------------------|-----------------|------------------------------------|
| GET | `/notifications`                       | JWT             | List user notifications            |
| GET | `/notifications/unread-count`          | JWT             | Get unread notification count      |
| PATCH | `/notifications/<notificationId>/read` | JWT + CSRF      | Mark a single notification as read |
| PATCH | `/notifications/read-all`              | JWT + CSRF      | Mark all notification as read      |

### Comments / Attachments / Files

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| PATCH | `/comments/<commentId>` | JWT + CSRF | Update comment |
| DELETE | `/comments/<commentId>` | JWT + CSRF | Delete comment |
| POST | `/comments/<commentId>/attachments` | JWT + CSRF | Attach files to comment |
| DELETE | `/attachments/<attachmentId>` | JWT + CSRF | Delete attachment |
| GET | `/uploads/<filename>` | JWT | Serve uploaded file |

### Lookups

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/priorities` | JWT | All priorities |
| GET | `/priorities/<priorityId>` | JWT | One priority |
| GET | `/task_statuses` | JWT | All task statuses |
| GET | `/task_statuses/<taskStatusId>` | JWT | One status |
| GET | `/roles` | JWT + **admin** | All roles |
| GET | `/roles/<roleId>` | JWT + **admin** | One role |

### Admin — `/admin`

| Method | Path | Auth | Description                                                             |
| --- | --- | --- |-------------------------------------------------------------------------|
| GET | `/admin/users` | JWT + **admin** | Full user list                                                          |
| GET | `/admin/users/<userId>` | JWT + **admin** | Get user                                                                |
| PATCH | `/admin/users/<userId>` | JWT + **admin** | Update user role                                                        |
| GET | `/admin/activity-logs` | JWT + **admin** | Activity logs (`taskId`, `userId`, `page`, `perPage` filters; returns `activities` and `hasMore`) |

Selected routes are rate-limited (e.g. login, register, password reset, profile update).

---

## Security Overview (JWT / CSRF)

### Cookie-based JWT

Configured in `backend/config.py` via Flask-JWT-Extended:

- **Token location:** HTTP-only cookies (not localStorage)
- **Access token:** `access_token_cookie`, path `/`, expires in **15 minutes**
- **Refresh token:** `refresh_token_cookie`, path limited to `/auth/refresh`, expires in **30 days**
- **SameSite:** `Lax`
- **Secure flag:** controlled by `JWT_COOKIE_SECURE` (keep `false` on local HTTP)
- **Claims:** access tokens carry `role` and `token_version`; refresh tokens carry `token_version`

### CSRF

- `JWT_COOKIE_CSRF_PROTECT = True` and `JWT_CSRF_IN_COOKIES = True`
- Login and refresh responses return `csrfAccessToken` and `csrfRefreshToken` in the JSON body
- The frontend stores them (sessionStorage, synced across tabs) and attaches **`X-CSRF-TOKEN`** on POST/PUT/PATCH/DELETE and on `/auth/refresh`
- Missing/invalid CSRF causes a soft logout on the client

### Session invalidation & refresh rotation

- **Refresh rotation:** each successful `/auth/refresh` blocklists the previous refresh JTI (replay detection)
- **`token_version`:** bumped on password change / logout; stale access tokens are treated as revoked
- Soft-deleted users cannot refresh; tokens are cleared

### Frontend auth client

`frontend/src/api/axios.js` handles:

- Attaching CSRF headers
- Automatic access-token refresh on `401` (with cross-tab refresh lock)
- Soft logout via `/auth/clear-cookies` plus multi-tab logout sync
- CORS credentials (`withCredentials: true`) against `VITE_API_URL`

### Other protections

- Role checks via `@roles_required("admin")` and frontend `AdminRoute`
- Flask-Limiter on sensitive auth and mutation endpoints
- Upload allow-list + SVG sanitization (Bleach); `MAX_CONTENT_LENGTH` = 10 MB
- Uploaded files served with `X-Content-Type-Options: nosniff`

---

## Default Seeded Domain Data

| Domain | Values |
| --- | --- |
| Roles | `admin` (id 1), `user` (id 2) |
| Priorities | low, medium, high |
| Task statuses | backlog, to_do, in_progress, done, cancelled |
| Admin user | From `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` |

---

## Useful Scripts

| Command | Where | Purpose |
| --- | --- | --- |
| `docker compose up --build` | repo root | Run full stack in Docker |
| `python -m backend.run` | repo root | Start Flask debug server |
| `python -m backend.seed` | repo root | Seed reference data + admin |
| `flask db upgrade` | repo root (`FLASK_APP=backend.app:create_app`) | Apply migrations |
| `npm run dev` | `frontend/` | Vite development server |
| `npm run build` | `frontend/` | Production frontend build |

---

## License

Private project — no license file included in the repository.
