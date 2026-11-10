# 🏋️ GymSphere — Gym Membership Management System

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite" />
</p>

A full-stack **DBMS Gym Membership Management System** built with a **Spring Boot** REST API backend and a **React + Vite** frontend. GymSphere covers every operational need of a modern gym — member management, trainer assignment, subscription tracking, payment collection, attendance logging, real-time analytics, and an interactive database explorer.

---

## 📸 Features at a Glance

| Module | Capabilities |
|---|---|
| 🏠 **Dashboard** | Live KPI cards, monthly revenue bar chart, plan revenue pie chart, recent transactions, upcoming expirations |
| 👥 **Members** | Add / edit / delete members, search & paginate, track active/inactive/suspended status |
| 🧑‍🏫 **Trainers** | Register certified trainers, toggle active status, assign to subscriptions |
| 📋 **Membership Plans** | Create pricing packages (monthly, quarterly, annual), manage features and pricing |
| 🔗 **Subscriptions** | Enroll members into plans, assign trainers, update subscription status, renewal tracking |
| 💳 **Payments** | Record payments (cash / card / UPI), track SUCCESS / PENDING / FAILED statuses |
| 📅 **Attendance** | QR-ready check-in / check-out, live gym occupancy counter |
| 📊 **Reports** | Revenue trends, member status breakdown, peak hours analysis, expiring-soon alerts |
| 🗄️ **Database Explorer** | Browse live MySQL tables, inspect structure, execute pre-built SQL Lab queries |
| 🔐 **Auth** | JWT-based login / session management with Spring Security |
| 👤 **Users** | Admin user management with role-based access control |

---

## 🏗️ Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.2.5**
- **Spring Data JPA** (Hibernate ORM)
- **Spring Security** (JWT authentication)
- **Spring Validation** (Bean Validation)
- **MySQL 8** (relational database)
- **Maven** (build & dependency management)

### Frontend
- **React 18** + **Vite 6**
- **Axios** (HTTP client with interceptors)
- **Recharts** (revenue & analytics charts)
- **Lucide React** (icon library)
- Fully custom CSS (glassmorphism dark theme, no external UI framework)

---

## 📂 Project Structure

```
gym web/
├── backend/                          # Spring Boot REST API
│   └── src/main/java/com/gymsphere/
│       ├── config/                   # Security, CORS, Data initializer
│       ├── controller/               # REST controllers (8 modules)
│       ├── dto/                      # Request / Response DTOs
│       ├── entity/                   # JPA entities (7 tables)
│       ├── exception/                # Global exception handler
│       ├── repository/               # Spring Data JPA repositories
│       └── service/                  # Business logic layer
│   └── src/main/resources/
│       ├── application.properties          # Active config (not committed — see .example)
│       └── application.properties.example  # Safe template to copy from
│
├── frontend/                         # React + Vite SPA
│   └── src/
│       ├── api/client.js             # Axios instance + all API calls
│       ├── components/               # Reusable UI components
│       ├── layouts/                  # Admin layout shell
│       └── pages/                    # Feature pages (Dashboard, Members, Trainers, …)
│
├── database/
│   ├── schema.sql                    # Full DDL (create tables)
│   ├── sample_data.sql               # Seed data for testing
│   ├── reports_queries.sql           # Analytics SQL queries
│   └── er_diagram.md                 # Entity-relationship diagram
│
├── start.bat                         # One-click Windows launcher
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 21+ |
| Maven | 3.9+ (or use the included `mvnw.cmd`) |
| Node.js | 18+ |
| MySQL Server | 8+ |

---

### 1️⃣ Database Setup

```sql
-- Create the database
CREATE DATABASE gymsphere_db;
```

Then import the schema and optional sample data:

```bash
mysql -u root -p gymsphere_db < database/schema.sql
mysql -u root -p gymsphere_db < database/sample_data.sql   # optional
```

---

### 2️⃣ Backend Configuration

```bash
cd backend/src/main/resources

# Copy the example config and fill in your credentials
cp application.properties.example application.properties
```

Edit `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/gymsphere_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### 3️⃣ Run the Backend

```bash
cd backend
mvnw.cmd spring-boot:run        # Windows
# OR
./mvnw spring-boot:run          # macOS / Linux
```

The API starts on **http://localhost:8080**

---

### 4️⃣ Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI opens on **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `http://localhost:8080` automatically.

---

### 🪟 One-Click Windows Launch

Double-click **`start.bat`** in the project root to launch both backend and frontend together.

---

## 🔌 REST API Overview

| Resource | Base Path |
|---|---|
| Auth | `POST /api/auth/login` |
| Members | `/api/members` |
| Trainers | `/api/trainers` |
| Membership Plans | `/api/plans` |
| Subscriptions | `/api/subscriptions` |
| Payments | `/api/payments` |
| Attendance | `/api/attendance` |
| Reports | `/api/reports/dashboard`, `/api/reports/revenue-monthly`, … |
| Database Explorer | `/api/explorer/tables`, `/api/explorer/sql-lab/…` |
| Users | `/api/users` |

All endpoints (except `/api/auth/login`) require a **Bearer JWT token** in the `Authorization` header.

---

## 🗄️ Database Schema

The system uses **7 core tables** in MySQL:

```
members          → member profiles & status
trainers         → certified fitness instructors
membership_plans → pricing packages
subscriptions    → member ↔ plan enrollments (with trainer assignment)
payments         → payment transactions per subscription
attendance       → check-in / check-out records
users            → system admin accounts
```

See [`database/schema.sql`](database/schema.sql) for the full DDL and [`database/er_diagram.md`](database/er_diagram.md) for the ER diagram.

---

## 🔐 Authentication

GymSphere uses **JWT (JSON Web Tokens)** via Spring Security:

1. `POST /api/auth/login` with `{ "username": "...", "password": "..." }` → returns a JWT token
2. All subsequent requests include `Authorization: Bearer <token>`
3. A default admin user is seeded automatically on first startup via `DataInitializer`

**Default admin credentials** (change after first login):
```
Username: admin
Password: admin123
```

---

## 📊 Analytics & Reports

The Reports page and Dashboard pull live MySQL aggregations:

- **Monthly Revenue** — `DATE_FORMAT`-grouped revenue totals
- **Plan Distribution** — revenue contribution per membership package
- **Member Status** — active / inactive / suspended breakdown
- **Daily Attendance** — check-in trends over configurable day ranges
- **Peak Hours** — busiest workout hours
- **Expiring Soon** — subscriptions ending in the next N days

---

## 🛠️ Development Notes

- Backend hot-reload: add `spring-boot-devtools` to `pom.xml`
- Frontend hot-reload: built in via Vite HMR
- `spring.jpa.hibernate.ddl-auto=update` keeps the schema in sync automatically — no manual migrations needed during development
- CORS is configured in `WebMvcConfig.java` to allow `http://localhost:5173`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ using Spring Boot + React + MySQL</p>
