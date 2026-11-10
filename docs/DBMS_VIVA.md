# GymSphere — Comprehensive DBMS Viva Voce Guide & Question Bank

This document contains **28 in-depth questions and answers** tailored for external examiners and project evaluators during the Database Management Systems (DBMS) laboratory viva.

---

### Q1: Why did you choose these specific seven tables for GymSphere?
**Answer:**  
The seven tables (`members`, `trainers`, `membership_plans`, `subscriptions`, `payments`, `attendance`, `users`) reflect real-world business domains and model relational database concepts:
1. **`members`**: Stores customer demographic information without mixing transaction records.
2. **`trainers`**: Certified staff entity available for optional assignment.
3. **`membership_plans`**: Reusable catalog of packages with standard pricing and duration.
4. **`subscriptions`**: An associative entity resolving the **Many-to-Many (M:N)** relationship between `members` and `plans`, preserving historical purchase rates.
5. **`payments`**: Dedicated ledger tracking individual transactions per subscription.
6. **`attendance`**: Operational event logging check-in and check-out timestamps.
7. **`users`**: Administrative and front-desk security credentials kept completely decoupled from customer profiles.

---

### Q2: What is a Primary Key, and which column is the primary key in each table?
**Answer:**  
A **Primary Key (PK)** is an attribute or minimal set of attributes that uniquely identifies every tuple (row) within a relational table. It enforces the **Entity Integrity Rule**: no part of a primary key may be `NULL`, and all values must be distinct.

In GymSphere, every table uses a surrogate, auto-incrementing `BIGINT` primary key:
- `members` &rarr; `member_id`
- `trainers` &rarr; `trainer_id`
- `membership_plans` &rarr; `plan_id`
- `subscriptions` &rarr; `subscription_id`
- `payments` &rarr; `payment_id`
- `attendance` &rarr; `attendance_id`
- `users` &rarr; `user_id`

---

### Q3: What is a Foreign Key, and which foreign keys exist in your schema?
**Answer:**  
A **Foreign Key (FK)** is an attribute in one table that references the primary key of another table, establishing a directed relationship between relations and enforcing **Referential Integrity**.

GymSphere defines:
1. `subscriptions.member_id` &rarr; references `members(member_id)`
2. `subscriptions.plan_id` &rarr; references `membership_plans(plan_id)`
3. `subscriptions.trainer_id` &rarr; references `trainers(trainer_id)` *(Nullable)*
4. `payments.subscription_id` &rarr; references `subscriptions(subscription_id)`
5. `attendance.member_id` &rarr; references `members(member_id)`

---

### Q4: Why is `subscriptions` designed as a separate table rather than storing plan details directly inside `members`?
**Answer:**  
If plan details were placed inside `members`:
- A member could only ever have one plan at a time, or the table would contain repeating attributes (`plan1`, `plan2`), violating **First Normal Form (1NF)**.
- Renewals and multi-year membership histories could not be recorded without duplicating the member's personal data, causing update anomalies.
- Storing `subscriptions` as an associative entity models a **1:N** relationship: one member can have multiple historical or renewed subscriptions over time while keeping customer profile attributes in a single record.

---

### Q5: Why is the price stored in `subscriptions.amount_at_purchase` when `membership_plans` already has a `price` column? Does this violate 3NF?
**Answer:**  
**No, this does NOT violate 3NF.**  
`membership_plans.price` represents the *current catalog price* at any given time. If the gym increases the price of the "Annual Platinum Elite" plan next year from $449.99 to $499.99, historical subscriptions purchased in 2025 must not retroactively change their billing records.  
`subscriptions.amount_at_purchase` is a **point-in-time historical fact**, uniquely determined by the subscription event, not a transitive dependency.

---

### Q6: Can a subscription exist without a trainer? How is that modeled in SQL?
**Answer:**  
Yes. Assigning a personal trainer is optional. In `subscriptions`, the `trainer_id` column is defined as:
```sql
trainer_id BIGINT NULL,
CONSTRAINT fk_sub_trainer FOREIGN KEY (trainer_id)
    REFERENCES trainers(trainer_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
```
When general admission subscriptions are created without personal coaching, `trainer_id` is set to `NULL`.

---

### Q7: Explain Referential Integrity and what happens if a referenced record is deleted.
**Answer:**  
Referential integrity dictates that a foreign key value must either match an existing primary key value in the referenced parent relation, or be `NULL`.

GymSphere configures differentiated referential actions:
- **`ON DELETE RESTRICT`** on `subscriptions.member_id`, `subscriptions.plan_id`, and `payments.subscription_id`: Prevents deleting a member, plan, or subscription if dependent records exist. This prevents data loss and maintains financial auditing.
- **`ON DELETE SET NULL`** on `subscriptions.trainer_id`: If an instructor resigns, client subscription rows remain valid with `trainer_id = NULL`.
- **`ON DELETE CASCADE`** on `attendance.member_id`: If a test member is permanently deleted, their physical check-in logs are purged.

---

### Q8: Explain Normalization and identify the normal form achieved by GymSphere.
**Answer:**  
GymSphere is normalized up to **Third Normal Form (3NF) / Boyce-Codd Normal Form (BCNF)**:
1. **1NF**: All attributes contain atomic, scalar values (no multi-valued sets or comma-separated strings), and each relation has an explicit primary key.
2. **2NF**: Achieved because all non-key attributes are fully functionally dependent on the entire primary key (there are no composite candidate keys with partial dependencies).
3. **3NF**: Achieved because there are no transitive functional dependencies ($X \to Y$ where neither $X$ is a superkey nor $Y$ is a prime attribute). Non-prime columns depend strictly on the primary key, and nothing else.

---

### Q9: Why is the `users` table decoupled from `members`?
**Answer:**  
In enterprise DBMS design, conflating customer identities with administrative authorization accounts introduces serious security flaws:
- Customer records (`members`) require demographic details (date of birth, gender, join date, fitness goals) and do not need system dashboard access.
- System accounts (`users`) require encrypted passwords (`password_hash`), RBAC roles (`ROLE_ADMIN`, `ROLE_STAFF`), and account enable/disable flags.
- Decoupling these relations adheres to the **Principle of Least Privilege** and avoids mixing operational access credentials with customer profiles.

---

### Q10: What is the difference between `INNER JOIN` and `LEFT OUTER JOIN`? Provide an example from GymSphere.
**Answer:**  
- **`INNER JOIN`**: Returns only tuples that have matching values in both tables.
  *Example*: Retrieving active subscriptions with member names:
  ```sql
  SELECT m.full_name, s.start_date, s.end_date 
  FROM members m 
  INNER JOIN subscriptions s ON m.member_id = s.member_id;
  ```
- **`LEFT OUTER JOIN`**: Returns all rows from the left table, along with matched rows from the right table, or `NULL` if no match exists.
  *Example*: Listing all trainers, including those who currently have no active clients assigned:
  ```sql
  SELECT t.full_name, COUNT(s.subscription_id) AS active_clients 
  FROM trainers t 
  LEFT JOIN subscriptions s ON t.trainer_id = s.trainer_id 
  GROUP BY t.trainer_id, t.full_name;
  ```

---

### Q11: What is the difference between `WHERE` and `HAVING` in SQL?
**Answer:**  
- **`WHERE`**: Filters individual tuples *before* grouping and aggregation takes place. It cannot evaluate aggregate functions (e.g., `WHERE COUNT(*) > 2` is invalid).
- **`HAVING`**: Filters groups *after* the `GROUP BY` clause evaluates aggregations.
- *GymSphere Example*: Finding frequent gym visitors who visited at least 3 times:
  ```sql
  SELECT m.full_name, COUNT(a.attendance_id) AS total_visits
  FROM members m
  JOIN attendance a ON m.member_id = a.member_id
  GROUP BY m.member_id, m.full_name
  HAVING COUNT(a.attendance_id) >= 3;
  ```

---

### Q12: How is total collected revenue calculated in GymSphere?
**Answer:**  
Total revenue is derived strictly from **successful payment transactions** via the `payments` table, never from subscription list prices or failed attempts:
```sql
SELECT COALESCE(SUM(amount), 0.00) 
FROM payments 
WHERE payment_status = 'SUCCESS';
```
Payments marked as `'PENDING'` or `'FAILED'` are excluded from the financial KPI calculation.

---

### Q13: What is a Database View, and why did you create `view_active_member_details`?
**Answer:**  
A **View** is a virtual relation defined by a stored SQL query. It does not store physical data on disk (unless materialized), but dynamically executes the underlying query when invoked.

**Purpose in GymSphere**:
`view_active_member_details` encapsulates a complex 4-table join (`members`, `subscriptions`, `membership_plans`, `trainers`) and calculates `days_remaining`:
```sql
CREATE OR REPLACE VIEW view_active_member_details AS
SELECT 
    m.member_id,
    m.full_name AS member_name,
    p.plan_name,
    s.start_date,
    s.end_date,
    DATEDIFF(s.end_date, CURDATE()) AS days_remaining,
    COALESCE(t.full_name, 'No Trainer Assigned') AS trainer_name,
    s.amount_at_purchase
FROM members m
JOIN subscriptions s ON m.member_id = s.member_id
JOIN membership_plans p ON s.plan_id = p.plan_id
LEFT JOIN trainers t ON s.trainer_id = t.trainer_id
WHERE s.status = 'ACTIVE';
```
**Benefits**:
1. Simplifies reporting queries for client applications.
2. Provides a layer of abstraction and security (hiding sensitive columns like password hashes or personal IDs).

---

### Q14: What is an Index, what data structure does MySQL use for it, and what are the trade-offs?
**Answer:**  
An **Index** is an auxiliary access structure that allows the query engine to rapidly locate tuples without performing a full table scan ($O(N)$ vs $O(\log N)$).
- **Underlying Data Structure**: MySQL InnoDB uses **B+ Trees**. B+ Trees keep all data pointers at leaf nodes linked sequentially, optimizing both equality searches and range scans.
- **Trade-offs**:
  - *Advantage*: Dramatically accelerates `SELECT`, `WHERE`, `JOIN`, and `ORDER BY` execution times.
  - *Disadvantage*: Incurs storage overhead and slows down `INSERT`, `UPDATE`, and `DELETE` operations because the B+ Tree must be dynamically rebalanced upon modification.

---

### Q15: What indexes did you define in GymSphere and why?
**Answer:**  
1. `idx_members_email` on `members(email)`: Enforces uniqueness and accelerates login/search lookups.
2. `idx_subs_status_dates` on `subscriptions(status, start_date, end_date)`: A composite index that optimizes upcoming expiration lookups for the dashboard.
3. `idx_payments_sub` on `payments(subscription_id)`: Speeds up foreign key lookups when checking subscription billing ledgers.
4. `idx_attendance_member_checkin` on `attendance(member_id, check_in)`: Accelerates member visit history queries and active session checks.

---

### Q16: What are ACID properties, and how are they maintained in GymSphere?
**Answer:**  
- **A — Atomicity**: Multi-step database modifications either all complete successfully or all roll back. In Spring Boot, methods annotated with `@Transactional` ensure that if an error occurs during enrollment, neither the subscription nor payment is committed.
- **C — Consistency**: The database transitions only from one valid state to another, upholding all `CHECK`, `UNIQUE`, `NOT NULL`, and `FOREIGN KEY` constraints.
- **I — Isolation**: Concurrent transactions execute without interference. MySQL InnoDB uses **Multi-Version Concurrency Control (MVCC)** with the default `REPEATABLE READ` isolation level.
- **D — Durability**: Once a transaction is committed, changes are written to the Write-Ahead Log (**InnoDB Redo Log**) and persist even in the event of power failure or crash.

---

### Q17: Demonstrate a multi-statement transaction with COMMIT and ROLLBACK.
**Answer:**  
**Successful Transaction**:
```sql
START TRANSACTION;
INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status, amount_at_purchase)
VALUES (1, 2, '2025-07-01', '2025-10-01', 'ACTIVE', 129.99);

INSERT INTO payments (subscription_id, amount, payment_method, payment_status, transaction_ref)
VALUES (LAST_INSERT_ID(), 129.99, 'UPI', 'SUCCESS', 'TXN-DEMO-001');
COMMIT;
```
**Failed Transaction (Rollback)**:
```sql
START TRANSACTION;
INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status, amount_at_purchase)
VALUES (2, 1, '2025-08-01', '2025-09-01', 'PENDING', 49.99);
-- If validation fails or card declined:
ROLLBACK;
```

---

### Q18: What is a Subquery? Give an example of a scalar subquery and a correlated subquery in your project.
**Answer:**  
A **Subquery** is a nested `SELECT` statement embedded within an outer query.
- **Scalar Subquery** (returns a single value): Finding payments greater than the average successful transaction:
  ```sql
  SELECT payment_id, amount 
  FROM payments 
  WHERE amount > (SELECT AVG(amount) FROM payments WHERE payment_status = 'SUCCESS');
  ```
- **Correlated Subquery** (inner query evaluates row-by-row based on outer query attributes): Finding members who have never logged any gym attendance:
  ```sql
  SELECT m.member_id, m.full_name 
  FROM members m 
  WHERE NOT EXISTS (
      SELECT 1 FROM attendance a WHERE a.member_id = m.member_id
  );
  ```

---

### Q19: What CHECK constraints did you implement in the MySQL schema?
**Answer:**  
GymSphere defines explicit domain constraints at the database level:
1. `chk_plan_duration CHECK (duration_months > 0)`: Prohibits non-positive plan periods.
2. `chk_plan_price CHECK (price >= 0.00)`: Prohibits negative subscription rates.
3. `chk_sub_dates CHECK (end_date >= start_date)`: Guarantees chronological validity.
4. `chk_pay_amount CHECK (amount > 0.00)`: Rejects zero or negative payments.
5. `chk_att_time CHECK (check_out IS NULL OR check_out >= check_in)`: Prevents check-outs before check-ins.

---

### Q20: How does the application prevent duplicate active workout sessions for the same member?
**Answer:**  
In `AttendanceService`, when a member attempts to check in, the repository runs:
```java
attendanceRepository.findOpenSessionByMemberId(memberId);
```
Which translates to SQL:
```sql
SELECT * FROM attendance WHERE member_id = ? AND check_out IS NULL;
```
If an open session exists, the backend throws a `BadRequestException`:
`"Member is already checked in and has an open active workout session. Please check out first."`

---

### Q21: How does the system prevent duplicate active memberships for the same person?
**Answer:**  
In `SubscriptionService`, prior to creating a new subscription with status `'ACTIVE'`, the service invokes:
```java
subscriptionRepository.existsByMemberMemberIdAndStatus(memberId, "ACTIVE");
```
If an active subscription already exists, it prevents issuing a concurrent duplicate active membership, requiring the administrator to either cancel or await expiration.

---

### Q22: How does the frontend communicate with MySQL? Explain the architecture pipeline.
**Answer:**  
The communication follows a 3-tier enterprise architecture:
1. **Presentation Layer (React SPA)**: The user initiates an action (e.g. clicking "Add Member"). The frontend triggers an Axios HTTP request with a JSON payload to `/api/members`.
2. **Application Server (Spring Boot REST Controller & Service)**: The controller validates input `@Valid MemberDto`. The service enforces business rules within a `@Transactional` boundary.
3. **Persistence Layer (Hibernate / JPA & MySQL Connector/J)**: Hibernate translates entity changes into parameterized SQL statements (`INSERT INTO members (...) VALUES (?, ?)`). MySQL Connector executes the query over TCP/IP to port `3306`.
4. **Database Engine (MySQL 8 InnoDB)**: InnoDB validates constraints, acquires row locks, updates B+ Trees, writes to the Redo Log, and commits the transaction.

---

### Q23: What does Spring Data JPA do, and what are its advantages?
**Answer:**  
**Spring Data JPA** is a framework that sits atop Hibernate to reduce boilerplate data access code.
- By extending `JpaRepository<Member, Long>`, standard CRUD methods (`save`, `findById`, `findAll`, `deleteById`) are synthesized automatically at runtime.
- It provides dynamic query generation via method naming conventions (`findByEmail`, `existsByPhoneAndMemberIdNot`).
- Protects against **SQL Injection** by using prepared statements and parameterized queries under the hood.

---

### Q24: How does GymSphere store user passwords securely?
**Answer:**  
GymSphere never stores plaintext passwords. Passwords are encrypted using **BCrypt** (`BCryptPasswordEncoder`) with a default cost factor of 10.
- BCrypt incorporates a **cryptographically secure random salt** for each password, rendering precomputed Rainbow Table attacks ineffective.
- It is an adaptive, computationally intensive hashing function designed to resist brute-force hardware cracking.
- The `users` REST API endpoints explicitly use `UserDto.Response` which excludes `passwordHash`, ensuring hashes are never exposed to client browsers.

---

### Q25: How does the Database Explorer retrieve live schema metadata without hardcoding?
**Answer:**  
In `DatabaseExplorerService`, the backend queries MySQL's internal system data dictionary:
1. Column definitions, SQL types, and default values are retrieved from:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?;
   ```
2. Foreign key linkages and referenced tables are inspected from:
   ```sql
   SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?;
   ```
3. Live index configurations are retrieved using `SHOW INDEX FROM <table>`.

---

### Q26: What is the difference between TRUNCATE and DROP?
**Answer:**  
- **`DROP TABLE`**: Completely destroys the table structure, its schema definition, data, constraints, and associated indexes from the data dictionary.
- **`TRUNCATE TABLE`**: Deletes all data rows from the table by deallocating the underlying data pages, but preserves the table structure, columns, constraints, and indexes for future insertions. In MySQL InnoDB, `TRUNCATE` also resets `AUTO_INCREMENT` counters back to 1.

---

### Q27: How did you test and verify your database operations during development?
**Answer:**  
1. **Schema Validation**: Verified through `schema.sql` execution with InnoDB constraint checking enabled.
2. **Repository Unit & Integration Tests**: Verified persistence, unique constraint enforcement, and pagination queries through Spring Boot JPA test harnesses.
3. **Workbench Cross-Verification**: Verified that every create, update, and delete operation triggered in the React frontend immediately reflects in MySQL Workbench query outputs.
4. **Negative Testing**: Attempted duplicate emails, negative subscription prices, check-outs prior to check-in, and deleting members with dependent payment histories to ensure constraints trigger appropriate errors.

---

### Q28: What is a surrogate key versus a natural key, and which one does GymSphere use?
**Answer:**  
- **Natural Key**: A key formed from attributes that naturally exist in the real world (e.g., `email` or `phone`).
- **Surrogate Key**: An artificial, system-generated identifier with no intrinsic business meaning (e.g., auto-incrementing `member_id`).
- **GymSphere Strategy**: Uses **surrogate keys** as primary keys (`member_id`, `subscription_id`, `payment_id`) because integer/bigint keys provide superior join performance, compact B+ Tree leaf footprints, and remain immutable even if a member changes their phone number or email. Real-world natural keys (`email`, `phone`) are enforced as secondary unique constraints via `UNIQUE` indexes.
