<div align="center">

# 🏏 CricNerd

### Cricket Tournament & League Management Platform

Manage tournaments, teams, players, fixtures, Playing XI, invitations and live ball-by-ball scoring.

<!-- 🌐 Live Demo: https://your-demo.vercel.app -->

</div>

---

## 📖 Overview

Cricnerd is a full-stack cricket tournament management platform built to simplify the entire tournament lifecycle.

Instead of managing tournaments using spreadsheets, WhatsApp groups and manual scorebooks, Cricnerd provides organizers with a centralized system to:

- Create and manage tournaments
- Register teams and players
- Generate fixtures
- Manage Playing XI
- Score matches ball-by-ball
- Track live match progress
- Invite players securely
- Maintain tournament data in one place

The project is designed using production-oriented backend practices including authentication, authorization, ownership validation, invitation tokens, Socket.IO integration and modular architecture.

---

# ✨ Features

## Authentication & Authorization

- JWT Authentication
- Role Based Access Control
- Organizer & Player roles
- Protected Routes
- Ownership Middleware

---

## Tournament Management

- Create tournaments
- Update tournament status
- Delete tournaments
- Organizer-specific dashboard
- Automatic tournament completion
- Tournament image uploads (pending)

---

## Team Management

- Create teams
- Tournament-specific teams
- Team ownership validation
- Team management dashboard

---

## Player Management

- Player profiles
- Career statistics
- Playing roles
- Player registration
- Organizer player management

---

## Match Management

- Schedule matches
- Update match status
- Live matches
- Match lifecycle validation
- Automatic tournament completion after all matches finish

---

## Ball-by-Ball Scoring

- Score every delivery
- Runs
- Extras
- Wickets
- Strike rotation (Future update)
- Over completion
- Innings management (Future update)

---

## Invitation System

Secure invitation workflow

```
Organizer
      │
      ▼
Generate Invite
      │
      ▼
Secure Token
      │
      ▼
Player Opens Link
      │
      ▼
Accept Invitation
      │
      ▼
Added to Team
```

Features include:

- One-time invitation links
- Expiring invitations
- Token validation
- Team assignment
- Tournament validation

---

## Real-Time Features

(Socket.IO)

- Live match updates
- Ball-by-ball events
- Live score broadcasting
- Ball-by-ball logs

---

# 🏗️ Architecture


---

# 📂 Main Project Structure

```
backend
├── src
│   ├── config/          # Configurations (database, server constants)
│   ├── constants/       # Global constants and error messages
│   ├── controllers/     # Route controllers for business logic
│   ├── db/              # Database connection logic (Mongoose setup)
│   ├── middleware/      # Auth, role-based checks, and validation middleware
│   ├── models/          # Mongoose schemas & models
│   ├── routes/          # Express route definitions
│   ├── schemas/         # Zod schemas for validation
│   ├── services/        # Business logic services (scoring, sockets, etc.)
│   ├── app.ts           # App middleware & main Express config
│   └── index.ts         # Server entry point (starts server & Socket.io)
├── .env
├── package.json
└── tsconfig.json

frontend
├── src
│   ├── assets/          # Static assets (images, logos)
│   ├── components/      # Reusable UI components & layouts
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Shared layout components
│   │   └── ui/          # Core design components (shadcn primitives)
│   ├── hooks/           # Custom React hooks (authentication, etc.)
│   ├── lib/             # Utility functions & axios/socket helper configurations
│   ├── pages/           # Pages (Dashboard, Live Scoring, Tournaments, etc.)
│   ├── services/        # Client API communication services
│   ├── store/           # Global state management
│   ├── types/           # Global TypeScript type definitions
│   ├── App.tsx          # Main application component & routes config
│   ├── index.css        # Global CSS stylesheet
│   └── main.tsx         # App entry point
├── index.html
├── package.json
└── vite.config.ts
```

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role Based Authorization
- Tournament Ownership Checks
- Invitation Token Validation
- Input Validation with Zod
- Secure File Upload Validation

---

# 🚀 Explore Implementation

## Clone

```bash
git clone https://github.com/Sumeet010/CricNerd.git
```

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📌 Future Improvements

- Tournament brackets
- Non-Striker Logic
- Innings Rotation
- Leaderboards
- Match analytics
- Player rankings
- Live notifications
- Email invitations
- Tournament statistics
- Mobile application

---

# 👨‍💻 Author

**Sumeet Gupta**

Backend Developer focused on building scalable, production-oriented applications with TypeScript, Node.js and React.

GitHub: https://github.com/Sumeet010

---

<div align="center">

</div>