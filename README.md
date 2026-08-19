# Mini Attendance Management System

A full-stack web application for managing employees, tracking daily attendance, and viewing attendance and workforce statistics through an administrative dashboard.

## Live Application

**Frontend:** https://mini-attendance-system-six.vercel.app/

**Backend API:** https://mini-attendance-system-v4h6.onrender.com/

> The frontend is deployed on Vercel, the backend is deployed on Render, and the application uses PostgreSQL hosted on Neon.

---

## Overview

The Mini Attendance Management System provides administrators with a centralized platform to:

- Authenticate securely using JWT-based login
- Manage employee records
- Search and filter employees
- Track daily attendance
- View attendance summaries
- View employee-wise attendance history
- Monitor workforce statistics through a dashboard

The project demonstrates a complete full-stack application workflow using React, Node.js, Express, PostgreSQL, REST APIs, authentication, and cloud deployment.

---

## Features

### Authentication

- Admin login
- JWT authentication
- Protected API routes
- Automatic JWT token handling
- Automatic logout when the token becomes invalid

### Employee Management

- Add employees
- Edit employee information
- Delete employees
- View employee details
- Search employees by name, ID, or email
- Filter employees by department
- Filter employees by status
- Pagination
- Active/Inactive employee status

### Attendance Management

- Mark daily attendance
- Record check-in and check-out times
- Attendance statuses:
  - Present
  - Absent
  - Half Day
  - Leave
- View attendance records
- Filter attendance records
- Pagination
- Attendance summary
- Employee-wise attendance history
- Attendance percentage calculation

### Dashboard

The dashboard displays:

- Total Employees
- Active Employees
- Present Today
- Absent Today
- Department-wise Employee Count

---

## Technology Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- CORS
- dotenv

### Database

- PostgreSQL
- Neon PostgreSQL
- node-postgres (`pg`)

### Deployment

- Vercel — Frontend
- Render — Backend
- Neon — PostgreSQL Database
- GitHub — Source Code Repository

---

## System Architecture

```text
                   ┌──────────────────────┐
                   │       Vercel         │
                   │   React + Vite UI    │
                   └──────────┬───────────┘
                              │
                              │ REST API
                              ▼
                   ┌──────────────────────┐
                   │       Render         │
                   │ Node.js + Express    │
                   │     REST APIs        │
                   └──────────┬───────────┘
                              │
                              │ PostgreSQL
                              ▼
                   ┌──────────────────────┐
                   │        Neon          │
                   │ PostgreSQL Database  │
                   └──────────────────────┘
```

---

## Database Design

The application uses three main tables:

### Users

Stores authentication information.

| Column | Description |
|---|---|
| `id` | Primary key |
| `username` | Unique login username |
| `password_hash` | Encrypted password |
| `role` | User role |
| `created_at` | Record creation time |
| `updated_at` | Record update time |

### Employees

Stores employee information.

| Column | Description |
|---|---|
| `id` | Primary key |
| `employee_id` | Unique employee identifier |
| `employee_name` | Employee name |
| `email` | Employee email |
| `mobile_number` | Employee mobile number |
| `department` | Department |
| `designation` | Designation |
| `status` | Active/Inactive |
| `created_at` | Record creation time |
| `updated_at` | Record update time |

### Attendance

Stores daily attendance records.

| Column | Description |
|---|---|
| `id` | Primary key |
| `employee_id` | Foreign key referencing employees |
| `attendance_date` | Attendance date |
| `check_in_time` | Check-in time |
| `check_out_time` | Check-out time |
| `attendance_status` | Attendance status |
| `created_at` | Record creation time |
| `updated_at` | Record update time |

The database also includes constraints, indexes, unique employee/date attendance records, and foreign-key relationships.

---

## API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/auth/profile` | Get authenticated user profile |

### Employee APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/employees` | Create employee |
| `GET` | `/api/employees` | Get employees |
| `GET` | `/api/employees/:id` | Get employee by ID |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Delete employee |

### Attendance APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attendance` | Mark attendance |
| `GET` | `/api/attendance` | Get attendance records |
| `GET` | `/api/attendance/summary` | Get attendance summary |
| `GET` | `/api/attendance/employee/:employeeId` | Get employee attendance history |

### Dashboard API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Get dashboard statistics |

---

## Project Structure

```text
mini-attendance-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── attendanceController.js
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   └── employeeController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── employeeRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── createAdmin.js
│   │   │
│   │   └── server.js
│   │
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## Local Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/dolleymaria/mini-attendance-system.git
cd mini-attendance-system
```

### 2. Setup the database

Create a PostgreSQL database and execute:

```text
database/schema.sql
```

This creates the required tables, relationships, constraints, and indexes.

### 3. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_management
DB_USER=postgres
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

### 4. Create an admin user

Run:

```bash
node src/utils/createAdmin.js
```

Use the credentials configured for your environment to log in.

### 5. Setup the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend

The backend requires:

```env
PORT=5000
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
```

**Never commit `.env` files or database credentials to GitHub.**

### Frontend

The current deployed frontend uses the production Render API URL configured in:

```text
frontend/src/services/api.js
```

---

## Deployment

### Frontend — Vercel

The React/Vite frontend is deployed using Vercel.

Root directory:

```text
frontend
```

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

### Backend — Render

The Node.js/Express backend is deployed using Render.

The backend uses environment variables for the Neon PostgreSQL connection and JWT configuration.

### Database — Neon

The production PostgreSQL database is hosted using Neon.

The database schema can be recreated using:

```text
database/schema.sql
```

---

## Security

The application includes:

- JWT-based authentication
- Password hashing using bcrypt
- Protected backend routes
- Environment-based database credentials
- Authentication middleware
- Automatic handling of expired/invalid JWT tokens
- Unique and database-level validation constraints

Sensitive credentials are excluded from version control using `.gitignore`.

---

## Attendance Calculation

Attendance percentage is calculated based on attendance records.

The current calculation treats:

- `PRESENT` → counted as attended
- `ABSENT` → not counted as attended
- `LEAVE` → not counted as attended
- `HALF_DAY` → tracked separately and not counted as a full present day

The attendance summary also provides individual counts for each status.

---

## Future Enhancements

Potential improvements include:

- Role-based access control
- CSV/Excel attendance export
- Swagger/OpenAPI documentation
- Automated unit and integration testing
- Docker support
- Advanced attendance reports
- More detailed employee analytics
- Automated attendance notifications

---

## License

This project was developed as a Mini Attendance Management System project for demonstrating full-stack web development, REST API development, database design, authentication, and cloud deployment.