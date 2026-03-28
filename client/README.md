# Solvify — Frontend (Client)

React 18 SPA built with Vite, Material-UI, Redux, and React Beautiful DnD for Kanban board management.

## 📁 Architecture

```
client/
├── src/
│   ├── main.jsx                 → App entry point (Redux Provider, Router)
│   ├── App.jsx                  → Root component (ThemeProvider, AppRoutes)
│   ├── config.js                → Axios instance with JWT interceptor
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx        → All route definitions + token validation
│   │   ├── ProtectedRoute.jsx   → Auth guard (redirects to /login if no token)
│   │   └── AuthRoutes.jsx       → Guest-only routes (login, signup)
│   │
│   ├── pages/                   → Full page components
│   │   ├── Auth/
│   │   │   ├── Login.jsx        → Email/password login form
│   │   │   ├── Signup.jsx       → Registration with email verification
│   │   │   ├── Forget-Password.jsx
│   │   │   └── Reset-Password.jsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx    → Stat cards, pie charts, project progress
│   │   ├── Projects/
│   │   │   └── Projects.jsx     → Project list with create/edit/delete
│   │   ├── ProjectDetails/
│   │   │   └── ProjectDetails.jsx → Kanban board view for a project
│   │   ├── CardDetails/
│   │   │   └── CardDetails.jsx  → Task detail editor (permission-aware)
│   │   ├── Employee/
│   │   │   └── Employee.jsx     → Employee management table
│   │   ├── MyTask/
│   │   │   └── index.jsx        → Personal task list
│   │   ├── Meetings/
│   │   │   └── Meetings.jsx     → Meeting scheduler
│   │   ├── ActivityLogs/
│   │   │   └── ActivityLogs.jsx → Activity tracking dashboard
│   │   ├── AIAnalytics/
│   │   │   └── AIAnalytics.jsx  → Gemini AI summary page
│   │   └── Organization/
│   │       └── Index.jsx        → Org chart tree view
│   │
│   ├── components/              → Reusable UI components
│   │   ├── KanbanView/
│   │   │   ├── KanbanView.components.jsx  → Drag-and-drop board
│   │   │   └── KanbanCard.components.jsx  → Individual task card
│   │   ├── CommentSection/
│   │   │   └── CommentSection.component.jsx → Task comments
│   │   ├── Modal/
│   │   │   ├── TaskModal.jsx              → Create/edit task dialog
│   │   │   └── MissedTrackerModal.jsx     → Missed tracker alert
│   │   ├── OrganizationChart/             → D3-based org tree
│   │   ├── Pagination/                    → Reusable paginator
│   │   └── Table/                         → Data table component
│   │
│   ├── store/                   → Redux state management
│   │   ├── store.tsx            → Redux store configuration
│   │   ├── actions/
│   │   │   └── loginActions.tsx → Login/logout action creators
│   │   └── reducers/
│   │       └── loginReducer.tsx → Auth state (token, user_id, role)
│   │
│   ├── services/                → API communication layer
│   │   ├── index.js             → Service exports
│   │   ├── api.service.js       → GET/POST/PUT/DELETE wrappers
│   │   └── common.service.js    → Shared utilities (API flag reset)
│   │
│   ├── constants/
│   │   ├── api-base.constants.tsx  → API endpoint URL mapping
│   │   └── api-flag.constants.json → API loading state flags
│   │
│   ├── hooks/
│   │   └── useActivityTracker.js → Heartbeat-based activity hook
│   │
│   ├── layout/
│   │   └── MainLayout/
│   │       ├── Sidebar/
│   │       │   └── MenuList/
│   │       │       └── menu-list.js → Sidebar navigation config
│   │       ├── Header/          → Top navigation bar
│   │       └── index.jsx        → Layout wrapper
│   │
│   └── themes/                  → MUI theme customization
│       └── index.js
│
├── package.json
├── vite.config.js               → Vite configuration
└── index.html                   → HTML entry point
```

## 🔗 Component Data Flow

```
┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│   App.jsx    │────▶│  AppRoutes.jsx │────▶│   Pages         │
│ (Theme,      │     │  (Auth check,  │     │   (Dashboard,   │
│  Provider)   │     │   routing)     │     │    Projects...) │
└──────────────┘     └────────────────┘     └────────┬────────┘
                                                     │
                                                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     Page Component                           │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ useSelector  │  │ apiService    │  │ Components       │  │
│  │ (Redux state)│  │ .GetAPICall() │  │ (KanbanView,     │  │
│  │              │  │ .PostAPICall()│  │  Modal, Table)   │  │
│  └──────┬───────┘  └───────┬───────┘  └──────────────────┘  │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌──────────────┐  ┌───────────────┐                        │
│  │ Redux Store  │  │ Axios Instance│                        │
│  │ (login state)│  │ (config.js)   │                        │
│  └──────────────┘  │ JWT in header │                        │
│                    └───────┬───────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Backend API    │
                    │  localhost:5000 │
                    └─────────────────┘
```

## 🧠 State Management

```
Redux Store
│
└── login (loginReducer.tsx)
    ├── token        → JWT token string
    ├── user_id      → Current user's ID
    ├── name         → Current user's name
    ├── isAdmin      → Boolean (role === "admin")
    └── email        → Current user's email
```

**Why Redux?** Only auth state is global (needed by every route guard and API call). All other state is component-local using `useState`.

## 🔑 Key Code Explained

### 1. API Service Layer (`services/api.service.js`)

All API calls go through a centralized service:
```
apiService.GetAPICall("getProjects")
    │
    ├── Looks up URL in api-base.constants.tsx
    │   "getProjects" → "api/project/"
    │
    ├── Sets loading flag in api-flag.constants.json
    │   "getProjects": true
    │
    ├── Sends request via Axios (config.js)
    │   Authorization: Bearer <JWT token>
    │
    └── Returns response data
```

### 2. Kanban Drag-and-Drop (`KanbanView.components.jsx`)

```
User drags a task card
    │
    ├── onDragEnd(result)
    │   ├── canUserDragTask(task) → checks permissions
    │   │   ├── Admin? → ✅ always allowed
    │   │   ├── Own task? → ✅ allowed
    │   │   ├── Subordinate's task? → ✅ allowed
    │   │   └── Others? → ❌ blocked
    │   │
    │   ├── Same column? → reorder (update positions)
    │   └── Different column? → move (update status + positions)
    │
    └── API call: PUT /api/task/update-position
```

### 3. Activity Tracker Hook (`hooks/useActivityTracker.js`)

```
useActivityTracker(taskId) starts when user opens a task
    │
    ├── Listens to: mousemove, keydown, scroll, touchstart
    │   └── On any event → lastActivity = Date.now()
    │
    ├── Every 30 seconds:
    │   ├── is_active = (now - lastActivity) < 60s threshold
    │   ├── ms_since_last_heartbeat = actual elapsed ms
    │   └── POST /api/activity/heartbeat
    │
    └── On unmount → stops tracking, cleans up listeners
```

### 4. Permission-Aware CardDetails (`pages/CardDetails/CardDetails.jsx`)

```
Task loads
    │
    ├── Fetch task data (anyone in project can VIEW)
    │
    ├── Check edit permissions:
    │   ├── Admin? → canEdit=true, canAssign=true
    │   ├── Assignee (self)? → canEdit=true, canAssign=false
    │   ├── Superior? → canEdit=true, canAssign=true
    │   └── Others → canEdit=false, canAssign=false
    │
    └── If !canEdit → all fields become read-only
        If !canAssign → assignment dropdown hidden
```

### 5. AI Analytics Page (`pages/AIAnalytics/AIAnalytics.jsx`)

```
User clicks "Generate Summary"
    │
    ├── GET /api/ai/analytics
    │
    ├── Response:
    │   ├── stats → {total_projects, total_tasks, overdue...}
    │   ├── projects → [{name, completion_pct, tasks...}]
    │   ├── employees → [{name, completed, overdue...}]
    │   └── summary → AI-generated markdown text
    │
    └── Renders:
        ├── 4 stat cards (projects, tasks, team, overdue)
        ├── AI summary panel (markdown → JSX renderer)
        ├── Project progress bars (LinearProgress)
        └── Team performance grid (Chips per employee)
```

## 🎨 UI Framework

- **Material-UI (MUI) v5** — All components use MUI primitives
- **Theme** — Custom theme in `themes/index.js`
- **Charts** — Recharts library (PieChart, BarChart)
- **Drag & Drop** — `react-beautiful-dnd` for Kanban
- **Org Chart** — Custom D3.js-based tree visualization

## 📍 Route Map

| Path | Page | Auth Required |
|------|------|:---:|
| `/login` | Login | ❌ |
| `/signup` | Signup | ❌ |
| `/dashboard` | Dashboard | ✅ |
| `/management/employees` | Employee List | ✅ |
| `/management/projects` | Projects | ✅ |
| `/management/projects/details/:id` | Kanban Board | ✅ |
| `/management/projects/card-details/:id` | Task Details | ✅ |
| `/management/my-tasks` | My Tasks | ✅ |
| `/management/meetings` | Meetings | ✅ |
| `/management/activity-logs` | Activity Logs | ✅ |
| `/management/ai-analytics` | AI Analytics | ✅ |
| `/management/organization` | Org Chart | ✅ |

## 🏃 Run

```bash
cd client
npm install
npm run dev     # Starts on port 5173
npm run build   # Production build → dist/
```
