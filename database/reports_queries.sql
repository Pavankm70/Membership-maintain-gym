-- =====================================================================
-- GymSphere DBMS Project: Comprehensive SQL Queries & Demonstration Suite
-- Purpose: Viva Preparation, Report Generation, and Concept Demos
-- Target: MySQL 8.0+
-- =====================================================================

USE gymsphere_db;

-- =====================================================================
-- SECTION 1: BASIC CRUD (Create, Read, Update, Delete)
-- =====================================================================

-- 1.1 INSERT: Adding a new member to the gym
INSERT INTO members (full_name, email, phone, gender, date_of_birth, join_date, status)
VALUES ('Rishi Sunak', 'rishi.s@example.com', '+91 9888877771', 'Male', '1990-05-12', CURDATE(), 'ACTIVE');

-- 1.2 SELECT: Reading members with selective columns and conditions
SELECT member_id, full_name, email, phone, status
FROM members
WHERE status = 'ACTIVE'
ORDER BY join_date DESC;

-- 1.3 UPDATE: Updating a member's phone and status
UPDATE members
SET phone = '+91 9888877779', status = 'ACTIVE'
WHERE member_id = 1;

-- 1.4 DELETE (Protected by Referential Integrity):
-- Attempting to delete a member who has existing subscriptions will fail
-- with an integrity violation because of ON DELETE RESTRICT on subscriptions.
-- Safe soft-deactivation pattern:
UPDATE members
SET status = 'INACTIVE'
WHERE member_id = 9;


-- =====================================================================
-- SECTION 2: JOINS (INNER, LEFT, MULTI-TABLE JOINS)
-- =====================================================================

-- 2.1 INNER JOIN: Get active member subscriptions with their plan names
-- Demonstrates mandatory foreign key relationship matching.
SELECT 
    m.member_id,
    m.full_name AS member_name,
    p.plan_name,
    p.duration_months,
    s.start_date,
    s.end_date,
    s.amount_at_purchase
FROM members m
INNER JOIN subscriptions s ON m.member_id = s.member_id
INNER JOIN membership_plans p ON s.plan_id = p.plan_id
WHERE s.status = 'ACTIVE';

-- 2.2 LEFT OUTER JOIN: Retrieve all trainers and any subscriptions assigned to them
-- Demonstrates preserving all rows from the left table even if right table has NULLs.
SELECT 
    t.trainer_id,
    t.full_name AS trainer_name,
    t.specialization,
    COUNT(s.subscription_id) AS total_assigned_members,
    COALESCE(GROUP_CONCAT(m.full_name SEPARATOR ', '), 'None') AS assigned_member_names
FROM trainers t
LEFT JOIN subscriptions s ON t.trainer_id = s.trainer_id AND s.status = 'ACTIVE'
LEFT JOIN members m ON s.member_id = m.member_id
GROUP BY t.trainer_id, t.full_name, t.specialization;


-- =====================================================================
-- SECTION 3: AGGREGATE FUNCTIONS (COUNT, SUM, AVG, MIN, MAX)
-- =====================================================================

-- 3.1 Financial Summary: Aggregate metrics from successful payments
SELECT 
    COUNT(payment_id) AS successful_transactions_count,
    SUM(amount) AS total_revenue_collected,
    ROUND(AVG(amount), 2) AS average_transaction_value,
    MIN(amount) AS lowest_payment,
    MAX(amount) AS highest_payment
FROM payments
WHERE payment_status = 'SUCCESS';

-- 3.2 Plan Popularity & Revenue: GROUP BY and Aggregate
SELECT 
    p.plan_name,
    p.duration_months,
    COUNT(s.subscription_id) AS subscriptions_sold,
    COALESCE(SUM(s.amount_at_purchase), 0.00) AS total_plan_revenue,
    ROUND(AVG(s.amount_at_purchase), 2) AS avg_realized_price
FROM membership_plans p
LEFT JOIN subscriptions s ON p.plan_id = s.plan_id
GROUP BY p.plan_id, p.plan_name, p.duration_months
ORDER BY total_plan_revenue DESC;


-- =====================================================================
-- SECTION 4: GROUP BY WITH HAVING CLAUSE
-- =====================================================================

-- 4.1 Frequent Gym Visitors: Members with more than 3 attendance check-ins
-- Demonstrates filtering aggregated groups (HAVING vs WHERE).
SELECT 
    m.member_id,
    m.full_name,
    m.email,
    COUNT(a.attendance_id) AS total_visits
FROM members m
JOIN attendance a ON m.member_id = a.member_id
GROUP BY m.member_id, m.full_name, m.email
HAVING COUNT(a.attendance_id) >= 3
ORDER BY total_visits DESC;

-- 4.2 High-Grossing Plans: Membership plans that generated more than $300 in sales
SELECT 
    p.plan_name,
    COUNT(s.subscription_id) AS total_purchases,
    SUM(s.amount_at_purchase) AS cumulative_revenue
FROM membership_plans p
JOIN subscriptions s ON p.plan_id = s.plan_id
GROUP BY p.plan_id, p.plan_name
HAVING cumulative_revenue > 300.00;


-- =====================================================================
-- SECTION 5: SUBQUERIES (Single-row, Multiple-row IN, Correlated)
-- =====================================================================

-- 5.1 Scalar Subquery: Find all payments that were higher than the average payment
SELECT 
    payment_id,
    subscription_id,
    amount,
    payment_method,
    payment_date
FROM payments
WHERE amount > (SELECT AVG(amount) FROM payments WHERE payment_status = 'SUCCESS')
  AND payment_status = 'SUCCESS';

-- 5.2 Multi-Row Subquery (IN): Members who currently have active personal trainer subscriptions
SELECT 
    member_id, 
    full_name, 
    email, 
    phone
FROM members
WHERE member_id IN (
    SELECT DISTINCT member_id 
    FROM subscriptions 
    WHERE trainer_id IS NOT NULL 
      AND status = 'ACTIVE'
);

-- 5.3 Correlated Subquery: Members who haven't checked into the gym yet
SELECT 
    m.member_id,
    m.full_name,
    m.email
FROM members m
WHERE NOT EXISTS (
    SELECT 1 
    FROM attendance a 
    WHERE a.member_id = m.member_id
);


-- =====================================================================
-- SECTION 6: SORTING AND PAGINATION (LIMIT & OFFSET)
-- =====================================================================

-- 6.1 Pagination for large member rosters: Page 2 with 5 members per page
SELECT member_id, full_name, email, phone, join_date, status
FROM members
ORDER BY member_id ASC
LIMIT 5 OFFSET 5;


-- =====================================================================
-- SECTION 7: VIVA & PRODUCTION REPORTS
-- =====================================================================

-- 7.1 Monthly Revenue Report: Grouped by year and month
SELECT 
    DATE_FORMAT(payment_date, '%Y-%m') AS revenue_month,
    COUNT(payment_id) AS total_transactions,
    SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END) AS collected_revenue,
    SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END) AS pending_revenue
FROM payments
GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY revenue_month DESC;

-- 7.2 Subscription Expiry Alert: Subscriptions expiring within the next 30 days
SELECT 
    s.subscription_id,
    m.full_name AS member_name,
    m.email AS member_email,
    m.phone AS member_phone,
    p.plan_name,
    s.start_date,
    s.end_date,
    DATEDIFF(s.end_date, CURDATE()) AS days_until_expiration
FROM subscriptions s
JOIN members m ON s.member_id = m.member_id
JOIN membership_plans p ON s.plan_id = p.plan_id
WHERE s.status = 'ACTIVE'
  AND s.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY s.end_date ASC;

-- 7.3 Daily Attendance Breakdown: Peak workout hours
SELECT 
    HOUR(check_in) AS workout_hour,
    COUNT(attendance_id) AS total_check_ins
FROM attendance
GROUP BY HOUR(check_in)
ORDER BY total_check_ins DESC;


-- =====================================================================
-- SECTION 8: TRANSACTIONS & ACID PROPERTIES (COMMIT / ROLLBACK)
-- =====================================================================

-- 8.1 Successful Atomic Transaction: New Subscription + Initial Payment
START TRANSACTION;

-- Step 1: Insert new subscription
INSERT INTO subscriptions (member_id, plan_id, trainer_id, start_date, end_date, status, amount_at_purchase)
VALUES (1, 2, NULL, '2025-07-01', '2025-10-01', 'ACTIVE', 129.99);

-- Step 2: Grab the generated subscription ID
SET @new_sub_id = LAST_INSERT_ID();

-- Step 3: Insert matching payment record
INSERT INTO payments (subscription_id, amount, payment_date, payment_method, payment_status, transaction_ref)
VALUES (@new_sub_id, 129.99, NOW(), 'UPI', 'SUCCESS', CONCAT('TXN-ATOMIC-', UNIX_TIMESTAMP()));

-- If all steps succeed without error:
COMMIT;


-- 8.2 Rollback Demonstration (Simulating a failed transaction scenario):
START TRANSACTION;

INSERT INTO subscriptions (member_id, plan_id, trainer_id, start_date, end_date, status, amount_at_purchase)
VALUES (3, 1, NULL, '2025-08-01', '2025-09-01', 'PENDING', 49.99);

-- Simulate condition failure (e.g. invalid payment or business validation error)
-- Rolling back restores the database state prior to START TRANSACTION
ROLLBACK;


-- =====================================================================
-- SECTION 9: DATABASE VIEW USAGE
-- =====================================================================

-- Query the pre-defined view for live active members
SELECT 
    member_name,
    plan_name,
    trainer_name,
    days_remaining,
    amount_at_purchase
FROM view_active_member_details
ORDER BY days_remaining ASC;
