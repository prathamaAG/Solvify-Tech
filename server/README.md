# Solvify — Backend (Server)

Express.js REST API with Sequelize ORM, JWT authentication, and Google Gemini AI integration.

## 📁 Architecture

```
server/
├── src/
│   ├── server.js                → Entry point, route registration, cron jobs
│   │
│   ├── Database/
│   │   └── config.js            → Sequelize init, model imports, associations
│   │
│   ├── Models/                  → Sequelize model definitions
│   │   ├── User.js              → Users (name, email, role, reporting_person_id)
│   │   ├── Project.js           → Projects (name, status, dates)
│   │   ├── ProjectMembers.js    → Many-to-many junction (User ↔ Project)
│   │   ├── Card.js              → Kanban columns (Pending, In Progress, etc.)
│   │   ├── Task.js              → Tasks (title, status, priority, assign_to/by)
│   │   ├── Comment.js           → Task comments
│   │   ├── CommentFile.js       → File attachments on comments
│   │   ├── TaskTimeTracking.js  → Per-session time tracking records
│   │   ├── ActivityLog.js       → Heartbeat activity logs
│   │   ├── Notification.js      → In-app notifications
│   │   ├── Meeting.js           → Meeting schedule entries
│   │   └── ManualTimeRequest.js → Manual time entry requests
│   │
│   ├── Controllers/             → Business logic
│   │   ├── auth.controller.js       → Login, signup, verify email, reset password
│   │   ├── project.controller.js    → CRUD projects, member management, stats
│   │   ├── task.controller.js       → CRUD tasks with hierarchy permissions
│   │   ├── card.controller.js       → Kanban column management
│   │   ├── member.controller.js     → Employee list, create, delete, stats
│   │   ├── comment.controller.js    → Task comments with file uploads
│   │   ├── meeting.controller.js    → Schedule/manage meetings
│   │   ├── notification.controller.js → CRUD notifications, mark as read
│   │   ├── activity.controller.js   → Heartbeat receiver, activity reports
│   │   ├── ai.controller.js         → Gemini AI analytics generation
│   │   ├── organization.controller.js → Org tree hierarchy
│   │   ├── taskTimeTracking.controller.js → Time tracking sessions
│   │   └── manualTimeRequest.controller.js → Manual time requests
│   │
│   ├── Routes/                  → Express route definitions
│   │   ├── user.routes.js       → /api/users/*
│   │   ├── project.routes.js    → /api/project/*
│   │   ├── task.routes.js       → /api/task/*
│   │   ├── card.routes.js       → /api/card/*
│   │   ├── member.routes.js     → /api/member/*
│   │   ├── comment.routes.js    → /api/comment/*
│   │   ├── meeting.routes.js    → /api/meeting/*
│   │   ├── notification.routes.js → /api/notification/*
│   │   ├── activity.routes.js   → /api/activity/*
│   │   ├── ai.routes.js         → /api/ai/*
│   │   ├── organization.routes.js → /api/organization-tree/*
│   │   ├── taskTimeTracking.routes.js → /api/task-time-tracking/*
│   │   └── manualTimeRequest.routes.js → /api/manualTrackerRequest/*
│   │
│   ├── Middleware/
│   │   ├── auth.middleware.js   → JWT token verification
│   │   └── upload.middleware.js → Multer + Cloudinary file upload
│   │
│   ├── Helper/
│   │   ├── hierarchyPermission.js → Recursive subordinate lookup & RBAC
│   │   ├── Pagination.js          → Generic pagination utility
│   │   └── missedTrackerCheck.js  → Cron job for missed time trackers
│   │
│   └── Services/
│       ├── email.service.js     → Nodemailer email templates
│       └── fileUpload.js        → Cloudinary upload utility
│
├── package.json
└── .env                         → Environment variables (NOT committed)
```

## 🔗 Data Flow

```
Client Request
    │
    ▼
┌──────────┐     ┌────────────────┐     ┌─────────────┐
│  Routes  │────▶│  Middleware     │────▶│ Controllers │
│          │     │  (JWT verify)  │     │             │
└──────────┘     └────────────────┘     └──────┬──────┘
                                               │
                      ┌────────────────────────┤
                      ▼                        ▼
              ┌──────────────┐         ┌──────────────┐
              │   Sequelize  │         │   Services   │
              │   Models     │         │  (Email, AI) │
              └──────┬───────┘         └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │    MySQL     │
              │   Database   │
              └──────────────┘
```

## 🗄️ Database Schema (Entity Relationships)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    Users     │────▶│ ProjectMembers   │◀────│  Projects   │
│              │     │ (junction table) │     │             │
│ user_id (PK) │     │ user_id (FK)     │     │ project_id  │
│ name         │     │ project_id (FK)  │     │ project_name│
│ email        │     │ role_in_project  │     │ status      │
│ password     │     └──────────────────┘     │ start_date  │
│ role         │                              │ due_date    │
│ reporting_   │     ┌──────────────────┐     └──────┬──────┘
│  person_id───┼──┐  │     Cards        │            │
│ verified     │  │  │ (Kanban columns) │◀───────────┘
└──────┬───────┘  │  │ card_id (PK)     │
       │          │  │ project_id (FK)  │
       │          │  │ title            │
       │   Self   │  │ position         │
       │   Join   │  └──────┬───────────┘
       │  (hierarchy)       │
       │          │         ▼
       │          │  ┌──────────────────┐     ┌─────────────────┐
       │          └─▶│     Tasks        │────▶│    Comments      │
       │             │ task_id (PK)     │     │ comment_id (PK) │
       │             │ card_id (FK)     │     │ task_id (FK)    │
       │             │ title            │     │ user_id (FK)    │
       │             │ assign_to (FK)───┼──┐  │ content         │
       │             │ assign_by (FK)───┼──┤  └────────┬────────┘
       │             │ status           │  │           │
       │             │ priority         │  │  ┌────────▼────────┐
       │             │ due_date         │  │  │  CommentFiles   │
       │             └──────────────────┘  │  │ file_id (PK)    │
       │                                   │  │ comment_id (FK) │
       │          ┌────────────────────────┘  │ file_url        │
       │          │                           └─────────────────┘
       ▼          ▼
┌──────────────────────┐  ┌───────────────────┐  ┌─────────────────┐
│  TaskTimeTracking    │  │  ActivityLog       │  │  Notifications  │
│ tracking_id (PK)     │  │ log_id (PK)        │  │ notif_id (PK)   │
│ task_id (FK)         │  │ tracking_id (FK)   │  │ user_id (FK)    │
│ user_id (FK)         │  │ is_active          │  │ type            │
│ start_time           │  │ is_tab_visible     │  │ title           │
│ end_time             │  │ timestamp          │  │ message         │
│ active_duration      │  └───────────────────┘  │ is_read         │
│ inactive_duration    │                          └─────────────────┘
└──────────────────────┘
              ┌───────────────────┐
              │    Meetings       │
              │ meeting_id (PK)   │
              │ project_id (FK)   │
              │ created_by (FK)   │
              │ title, link       │
              │ scheduled_at      │
              └───────────────────┘
```

## 🔑 Key Code Explained

### 1. Hierarchy Permission System (`Helper/hierarchyPermission.js`)
```
Admin
  └── Manager (reporting_person_id = null or admin)
        └── Senior Developer (reporting_person_id = Manager)
              └── Developer (reporting_person_id = Senior)
                    └── Joinee (reporting_person_id = Developer)
```

**`getSubordinateIds(userId)`** — Recursively finds ALL users below a person:
```js
// Finds direct reports, then their reports, etc.
async function getSubordinateIds(userId) {
    const directReports = await User.findAll({
        where: { reporting_person_id: userId }
    });
    let allSubs = directReports.map(u => u.user_id);
    for (const sub of directReports) {
        const nested = await getSubordinateIds(sub.user_id);
        allSubs = [...allSubs, ...nested];
    }
    return allSubs;
}
```

**`getTaskPermission(user, task)`** — Returns permission level:
- `"full"` → Admin (can do anything)
- `"superior"` → User is above the assignee in hierarchy (can edit, move, reassign, delete)
- `"self"` → User is the assignee (can edit and move own task only)
- `"none"` → No permission

### 2. Activity Tracking (`Controllers/activity.controller.js`)
```
Browser (every 30s) ──heartbeat──▶ Backend ──▶ ActivityLog table
                                      │
                                      ▼
                              Calculate deltas:
                              - ms_since_last_heartbeat (actual elapsed)
                              - is_active (mouse/keyboard detected?)
                              - Update active_duration / inactive_duration
```

The heartbeat carries `ms_since_last_heartbeat` because browsers throttle `setInterval` in background tabs (30s → 60s+). The backend uses the actual elapsed time for accurate calculations.

### 3. AI Analytics (`Controllers/ai.controller.js`)
```
GET /api/ai/analytics
    │
    ├── gatherAnalyticsData(user)
    │   ├── Admin? → All projects, all tasks, all employees
    │   └── User?  → Only their projects + subordinates' tasks
    │
    ├── buildPrompt(data) → Structured markdown prompt
    │
    └── generateWithFallback(prompt)
        ├── Try gemini-2.5-flash
        ├── Try gemini-2.5-pro (fallback)
        └── Retry after 5s delay (last resort)
```

### 4. Task CRUD with RBAC (`Controllers/task.controller.js`)
Every task endpoint checks permissions:
```
Request arrives
    │
    ├── Is Admin? ──────────────▶ ✅ Full access
    │
    ├── Is task assignee? ──────▶ ✅ Can edit/move own task
    │                                ❌ Cannot reassign or delete
    │
    ├── Is superior of assignee? ▶ ✅ Can edit, move, reassign, delete
    │
    └── Otherwise ──────────────▶ ❌ 403 Forbidden
```

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/signup` | ❌ | Register new user |
| POST | `/api/users/login` | ❌ | Login, get JWT token |
| GET | `/api/users/validate-token` | ✅ | Check token validity |
| GET | `/api/users/my-subordinates` | ✅ | Get subordinate IDs |
| GET | `/api/project/` | ✅ | List user's projects |
| POST | `/api/project/create` | ✅ | Create project (admin) |
| GET | `/api/project/data` | ✅ | Project stats for dashboard |
| GET | `/api/task/:task_id` | ✅ | Task details |
| POST | `/api/task/create` | ✅ | Create task (hierarchy check) |
| PUT | `/api/task/update` | ✅ | Update task (hierarchy check) |
| DELETE | `/api/task/:task_id` | ✅ | Delete task (hierarchy check) |
| GET | `/api/task/data` | ✅ | Task stats for dashboard |
| POST | `/api/activity/heartbeat` | ✅ | Receive activity heartbeat |
| GET | `/api/activity/report/:task_id` | ✅ | Activity report per task |
| GET | `/api/ai/analytics` | ✅ | AI-generated analytics summary |
| GET | `/api/notification/` | ✅ | Get user notifications |
| POST | `/api/meeting/create` | ✅ | Schedule meeting |
| GET | `/api/member/employee-data` | ✅ | Employee distribution stats |

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000

# Database
DB_HOST=127.0.0.1
DB_DIALECT=mysql
DB_PORT=3306
DB_NAME=ProjectSGP
DB_USER=root
DB_PASS=your_mysql_password

# JWT
JWT_SECRET=your_secret_key_here

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

## 🏃 Run

```bash
cd server
npm install
npm start       # Starts on port 5000
```
