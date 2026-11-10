# GymSphere — Complete DBMS Gym Membership Management System

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)

---

## 1. Project Overview & Objectives

**GymSphere** is a production-grade, full-stack **Gym Membership Management System** specifically engineered for a **College DBMS (Database Management Systems) Project & Viva Voce**.

### Key Educational Objectives
- **Relational Integrity**: Enforce strict Primary Keys, Foreign Keys, `NOT NULL`, `UNIQUE`, and `CHECK` constraints.
- **Normalization**: Realize a schema structured in **Third Normal Form (3NF)** / **BCNF** to prevent update, deletion, and insertion anomalies.
- **Audit Preservation**: Prevent hard deletion of members or plans associated with financial history via `ON DELETE RESTRICT`.
- **Advanced SQL Demonstrations**: Execute real-world `INNER JOIN`, `LEFT OUTER JOIN`, `GROUP BY`, `HAVING`, aggregations (`SUM`, `AVG`, `COUNT`), subqueries, and views.
- **Interactive Database Explorer**: A dedicated in-app laboratory inspecting live MySQL `INFORMATION_SCHEMA` metadata, dynamic table record grids, and pre-compiled educational queries.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Single Page Application (SPA) architecture |
| **Styling & UI** | Tailwind-compatible CSS Design System | Custom dark mode, glassmorphism, responsive design |
| **Icons & Charts** | Lucide React + Recharts | High-performance dashboard visualizations |
| **Backend Framework** | Java 21 LTS + Spring Boot 3.2.5 | Enterprise REST API server |
| **Persistence Layer** | Spring Data JPA & Hibernate | Object-Relational Mapping (ORM) & transactional services |
| **Database Engine** | MySQL 8.0 Community Server | ACID-compliant relational database management system |
| **Security & Auth** | Spring Security + BCrypt | Salted password hashing and role-based access control (RBAC) |
| **Database Client** | MySQL Workbench 8.0 CE | External query execution and visual ER verification |

---

## 3. Directory Structure

```text
gym two/
├── frontend/                     # React + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Centralized Axios API client
│   │   ├── components/
│   │   │   ├── Modal.jsx         # Accessible modal backdrop container
│   │   │   ├── ConfirmModal.jsx  # Confirmation dialog for critical actions
│   │   │   ├── Pagination.jsx   # Generic pagination controller
│   │   │   └── Toast.jsx         # Animated feedback alert notifications
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx   # Responsive sidebar and navigation shell
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Live KPIs, revenue & plan charts
│   │   │   ├── Members.jsx       # Member CRUD & duplicate checks
│   │   │   ├── Trainers.jsx      # Trainer roster & status toggle
│   │   │   ├── Plans.jsx         # Catalog tiers & pricing rules
│   │   │   ├── Subscriptions.jsx # Enrollment junction, rate lock, date math
│   │   │   ├── Payments.jsx      # Transaction ledger & payment receipts
│   │   │   ├── Attendance.jsx    # Live occupancy, check-in & check-out
│   │   │   ├── Reports.jsx       # SQL-backed charts & expiry forecasts
│   │   │   ├── Users.jsx         # Staff account management (Admin only)
│   │   │   └── DatabaseExplorer.jsx # 6-Tab live schema & SQL execution lab
│   │   ├── App.jsx               # Authentication routing & session handling
│   │   ├── index.css             # Glassmorphic tokens & typography
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Java Spring Boot Maven Project
│   ├── src/main/java/com/gymsphere/
│   │   ├── config/               # Security, CORS, and DataInitializer
│   │   ├── controller/           # REST endpoints
│   │   ├── dto/                  # Request / Response DTO contracts
│   │   ├── entity/               # JPA Entities mapped to MySQL tables
│   │   ├── exception/            # Centralized GlobalExceptionHandler
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── service/              # Core business logic & transaction scope
│   │   └── GymSphereApplication.java
│   ├── src/main/resources/
│   │   └── application.properties # MySQL JDBC & Hibernate configuration
│   ├── mvnw.cmd                  # Maven wrapper for Windows
│   └── pom.xml                   # Maven dependencies (Java 21, Spring Boot 3)
│
├── database/                     # MySQL Scripts & DBMS Documentation
│   ├── schema.sql                # Complete DDL script (tables, checks, views, indexes)
│   ├── sample_data.sql           # Realistic seed dataset (satisfies all FKs)
│   ├── reports_queries.sql       # Annotated viva demonstration queries
│   └── er_diagram.md             # Mermaid ER diagram & relational cardinalities
│
├── docs/                         # Project Documentation
│   ├── README.md                 # Setup, architecture, and demonstration guide
│   └── DBMS_VIVA.md              # 25+ comprehensive DBMS viva questions and answers
│
└── .gitignore
```

---

## 4. Prerequisites

To run GymSphere locally on Windows, ensure the following are installed:
1. **Java Development Kit (JDK 17 or 21)**: Verify with `java -version`.
2. **Node.js (v18+) & npm**: Verify with `node -v` and `npm -v`.
3. **MySQL 8.0 Server**: Standard community edition on default port `3306`.
4. **Apache Maven (3.9+)** (or use the included wrapper in `backend/`).

---

## 5. Database Setup & Initialization

### Step 1: Start MySQL Server
Ensure the MySQL Server is running on `127.0.0.1:3306`.
If using the default Windows service:
```powershell
net start MYSQL80
```
Or verify connection using MySQL Workbench.

### Step 2: Execute DDL Schema Script
Open **MySQL Workbench**, create a new connection to `localhost:3306`, and open [schema.sql](file:///c:/Users/PAVAN/Downloads/gym%20two/database/schema.sql):
```sql
SOURCE database/schema.sql;
```
This creates `gymsphere_db` with all 7 tables, CHECK constraints, composite indexes, and the `view_active_member_details` view.

### Step 3: Populate Realistic Sample Data
Open [sample_data.sql](file:///c:/Users/PAVAN/Downloads/gym%20two/database/sample_data.sql) in Workbench and execute:
```sql
SOURCE database/sample_data.sql;
```
This inserts:
- 12 Members
- 4 Certified Trainers
- 5 Membership Plan Tiers
- 15 Subscriptions
- 16 Payments (Success, Pending, Failed)
- 25 Attendance Log Sessions
- 3 Staff/Admin accounts with valid BCrypt hashed credentials

---

## 6. How to Start the Application

### Starting the Backend (Spring Boot)
1. Open a terminal in the `backend/` directory:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
   *(Or using the included wrapper: `./mvnw spring-boot:run`)*
2. The server will start on `http://localhost:8080`.
3. On startup, `DataInitializer` verifies database connectivity and ensures admin/staff BCrypt hashes are active.

### Starting the Frontend (React + Vite)
1. Open a second terminal in the `frontend/` directory:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 7. Demo Login Accounts

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@gymsphere.com` | `admin123` | Full access (Staff accounts, all CRUD, SQL Lab) |
| **Frontdesk Staff** | `staff@gymsphere.com` | `staff123` | Operational access (Members, Attendance, Payments) |

> [!TIP]
> On the login page, you can click the **"Admin Demo"** or **"Staff Demo"** buttons to automatically fill in test credentials with a single click.

---

## 8. Verifying Real Data in MySQL Workbench

Every change made through the web interface is persisted directly to MySQL. To verify in MySQL Workbench:
1. **Members**:
   ```sql
   USE gymsphere_db;
   SELECT * FROM members ORDER BY member_id DESC;
   ```
2. **Subscriptions**:
   ```sql
   SELECT * FROM subscriptions WHERE status = 'ACTIVE';
   ```
3. **Payments**:
   ```sql
   SELECT payment_id, amount, payment_method, payment_status, transaction_ref FROM payments;
   ```
4. **Attendance**:
   ```sql
   SELECT * FROM attendance WHERE check_out IS NULL; -- Shows live active gym members
   ```

---

## 9. Demonstrating Key DBMS Concepts in Viva

### 1. Primary & Foreign Keys
- Navigate to **Database Explorer &rarr; Tab B (Table Structure)**.
- Select `subscriptions`. Observe `subscription_id` marked as **PRIMARY KEY (auto_increment)** and `member_id`, `plan_id`, and `trainer_id` marked with **FK indicators** pointing to their parent tables.

### 2. Referential Integrity & History Preservation
- Go to the **Members** page.
- Try to delete `Aarav Sharma` (#1).
- Notice the system blocks deletion with a clear DBMS error:
  `"Cannot permanently delete member because historical subscriptions/payment records exist. To preserve DBMS financial integrity, please update status to INACTIVE."`

### 3. Check Constraints
- Attempt to create a Membership Plan with a price of `-$20.00` or duration `0`.
- The MySQL constraint `chk_plan_duration CHECK (duration_months > 0)` rejects the tuple.

### 4. Interactive SQL Lab
- Navigate to **Database Explorer &rarr; Tab E (SQL Lab)**.
- Select **"Frequent Visitors (GROUP BY & HAVING >= 3 visits)"** or **"Active Subscriptions with Member & Plan Details (INNER JOIN)"**.
- Click **"Execute Query"**. The exact SQL statement runs live and returns execution timing in milliseconds alongside the real results grid.
