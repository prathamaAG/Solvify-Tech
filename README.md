# 🚀 Solvify — Project Management System

A full-stack project management platform with Kanban boards, activity tracking, AI-powered analytics, and role-based access control.

## 📁 Repository Structure

```
Solvify/
├── client/          → React (Vite) Frontend
├── server/          → Node.js + Express Backend
├── .gitignore
└── README.md        → You are here
```

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+
- **npm** or **yarn**

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/Solvify.git
cd Solvify

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment
```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit with your credentials
# See server/README.md for all required variables
```

### 3. Setup Database
```sql
CREATE DATABASE ProjectSGP;
```
Tables are auto-created by Sequelize on first run.

### 4. Run
```bash
# Terminal 1 — Backend (port 5000)
cd server && npm start

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🧩 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Auth & Users** | JWT login, signup, email verification, password reset |
| 2 | **Projects & Tasks** | Kanban board, drag-and-drop, task CRUD, file attachments |
| 3 | **Notifications** | In-app + email notifications for assignments and due dates |
| 4 | **Meetings** | Schedule meetings with Google Meet links |
| 5 | **Activity Tracking** | Real-time heartbeat-based developer activity monitoring |
| 6 | **AI Analytics** | Gemini-powered project insights and team performance summaries |

## 🔐 Security
- JWT-based authentication with token validation
- Hierarchy-based RBAC (Admin → Manager → Senior → Developer)
- All credentials loaded from environment variables
- `.env` excluded from version control

## 👥 Roles
- **Admin** — Full access to all resources
- **Manager/Senior** — Access to own + subordinates' data
- **Developer** — Access to own tasks and projects

## 📖 Documentation
- [Frontend README](./client/README.md) — React architecture, components, and state management
- [Backend README](./server/README.md) — API endpoints, database schema, and controllers

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Material-UI, Redux, React DnD |
| Backend | Node.js, Express.js, Sequelize ORM |
| Database | MySQL 8.0 |
| AI | Google Gemini 2.5 API |
| Email | Nodemailer (Gmail SMTP) |
| Storage | Cloudinary (file uploads) |
