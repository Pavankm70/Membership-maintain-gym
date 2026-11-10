-- =====================================================================
-- GymSphere DBMS Project: Realistic Sample Dataset
-- Database: MySQL 8.0+
-- Description: Populates gymsphere_db with comprehensive sample data
--              satisfying all constraints, relationships, and viva criteria:
--              - 12 Members
--              - 4 Trainers
--              - 5 Membership Plans
--              - 15 Subscriptions
--              - 16 Payments (Success, Pending, Failed)
--              - 25 Attendance Records
--              - 3 Users (Admin & Staff with BCrypt hashed passwords)
-- =====================================================================

USE gymsphere_db;

-- Clear previous sample records if re-running (reverse FK order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE attendance;
TRUNCATE TABLE payments;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE membership_plans;
TRUNCATE TABLE trainers;
TRUNCATE TABLE members;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Insert Members (12 realistic member records)
-- ---------------------------------------------------------------------
INSERT INTO members (member_id, full_name, email, phone, gender, date_of_birth, join_date, status) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '+91 9876543210', 'Male', '1995-04-12', '2025-01-10', 'ACTIVE'),
(2, 'Priya Patel', 'priya.patel@example.com', '+91 9876543211', 'Female', '1998-09-24', '2025-01-15', 'ACTIVE'),
(3, 'Rohan Verma', 'rohan.verma@example.com', '+91 9876543212', 'Male', '1992-11-03', '2025-02-01', 'ACTIVE'),
(4, 'Sneha Reddy', 'sneha.reddy@example.com', '+91 9876543213', 'Female', '2000-06-18', '2025-02-10', 'ACTIVE'),
(5, 'Vikram Malhotra', 'vikram.m@example.com', '+91 9876543214', 'Male', '1989-01-30', '2025-02-20', 'ACTIVE'),
(6, 'Ananya Iyer', 'ananya.iyer@example.com', '+91 9876543215', 'Female', '1996-08-14', '2025-03-01', 'ACTIVE'),
(7, 'Kabir Mehta', 'kabir.mehta@example.com', '+91 9876543216', 'Male', '1994-12-05', '2025-03-15', 'ACTIVE'),
(8, 'Diya Sen', 'diya.sen@example.com', '+91 9876543217', 'Female', '1999-03-22', '2025-04-01', 'ACTIVE'),
(9, 'Arjun Nair', 'arjun.nair@example.com', '+91 9876543218', 'Male', '1991-07-19', '2025-04-10', 'INACTIVE'),
(10, 'Neha Kapoor', 'neha.kapoor@example.com', '+91 9876543219', 'Female', '1997-10-08', '2025-05-01', 'ACTIVE'),
(11, 'Karan Joshi', 'karan.joshi@example.com', '+91 9876543220', 'Male', '1993-05-16', '2025-05-15', 'SUSPENDED'),
(12, 'Tanvi Deshmukh', 'tanvi.d@example.com', '+91 9876543221', 'Female', '2001-02-27', '2025-06-01', 'ACTIVE');

-- ---------------------------------------------------------------------
-- 2. Insert Trainers (4 certified trainers)
-- ---------------------------------------------------------------------
INSERT INTO trainers (trainer_id, full_name, email, phone, specialization, status) VALUES
(1, 'Marcus Vance', 'marcus.vance@gymsphere.com', '+91 9123456780', 'Strength & Hypertrophy', 'ACTIVE'),
(2, 'Elena Rostova', 'elena.rostova@gymsphere.com', '+91 9123456781', 'HIIT & Cardiovascular Conditioning', 'ACTIVE'),
(3, 'Devendra Rathore', 'devendra.r@gymsphere.com', '+91 9123456782', 'Functional Mobility & Rehabilitation', 'ACTIVE'),
(4, 'Sarah Jenkins', 'sarah.j@gymsphere.com', '+91 9123456783', 'Nutrition & Body Recomposition', 'ACTIVE');

-- ---------------------------------------------------------------------
-- 3. Insert Membership Plans (5 packages with positive pricing)
-- ---------------------------------------------------------------------
INSERT INTO membership_plans (plan_id, plan_name, duration_months, price, description) VALUES
(1, 'Monthly Bronze', 1, 49.99, 'Access to gym equipment and locker rooms for 30 days.'),
(2, 'Quarterly Silver', 3, 129.99, 'Access to gym, 2 group fitness classes/month, and free towel service.'),
(3, 'Half-Yearly Gold', 6, 239.99, 'Full gym access, unlimited group classes, and 1 monthly dietitian consultation.'),
(4, 'Annual Platinum Elite', 12, 449.99, 'All-access VIP pass including sauna, pool, guest privileges, and nutrition plan.'),
(5, 'Student Flex Pass', 1, 34.99, 'Discounted monthly off-peak membership for accredited students.');

-- ---------------------------------------------------------------------
-- 4. Insert Subscriptions (15 records demonstrating 1:N relations)
-- ---------------------------------------------------------------------
INSERT INTO subscriptions (subscription_id, member_id, plan_id, trainer_id, start_date, end_date, status, amount_at_purchase) VALUES
(1, 1, 4, 1, '2025-01-10', '2026-01-10', 'ACTIVE', 449.99),
(2, 2, 2, 2, '2025-01-15', '2025-04-15', 'ACTIVE', 129.99),
(3, 3, 3, 3, '2025-02-01', '2025-08-01', 'ACTIVE', 239.99),
(4, 4, 1, NULL, '2025-02-10', '2025-03-10', 'EXPIRED', 49.99),
(5, 4, 2, 4, '2025-03-11', '2025-06-11', 'ACTIVE', 129.99),
(6, 5, 4, 1, '2025-02-20', '2026-02-20', 'ACTIVE', 449.99),
(7, 6, 3, 2, '2025-03-01', '2025-09-01', 'ACTIVE', 239.99),
(8, 7, 1, NULL, '2025-03-15', '2025-04-15', 'EXPIRED', 49.99),
(9, 7, 2, 3, '2025-04-16', '2025-07-16', 'ACTIVE', 129.99),
(10, 8, 4, 4, '2025-04-01', '2026-04-01', 'ACTIVE', 449.99),
(11, 9, 1, NULL, '2025-04-10', '2025-05-10', 'CANCELLED', 49.99),
(12, 10, 5, 2, '2025-05-01', '2025-06-01', 'ACTIVE', 34.99),
(13, 11, 2, 1, '2025-05-15', '2025-08-15', 'CANCELLED', 129.99),
(14, 12, 3, NULL, '2025-06-01', '2025-12-01', 'ACTIVE', 239.99),
(15, 2, 3, 2, '2025-04-16', '2025-10-16', 'ACTIVE', 239.99);

-- ---------------------------------------------------------------------
-- 5. Insert Payments (16 transactions: SUCCESS, PENDING, FAILED)
-- ---------------------------------------------------------------------
INSERT INTO payments (payment_id, subscription_id, amount, payment_date, payment_method, payment_status, transaction_ref) VALUES
(1, 1, 449.99, '2025-01-10 10:15:00', 'CREDIT_CARD', 'SUCCESS', 'TXN-20250110-001'),
(2, 2, 129.99, '2025-01-15 11:30:00', 'UPI', 'SUCCESS', 'TXN-20250115-002'),
(3, 3, 239.99, '2025-02-01 09:45:00', 'DEBIT_CARD', 'SUCCESS', 'TXN-20250201-003'),
(4, 4, 49.99,  '2025-02-10 14:20:00', 'CASH', 'SUCCESS', 'TXN-20250210-004'),
(5, 5, 129.99, '2025-03-11 16:05:00', 'UPI', 'SUCCESS', 'TXN-20250311-005'),
(6, 6, 449.99, '2025-02-20 18:00:00', 'CREDIT_CARD', 'SUCCESS', 'TXN-20250220-006'),
(7, 7, 239.99, '2025-03-01 12:10:00', 'BANK_TRANSFER', 'SUCCESS', 'TXN-20250301-007'),
(8, 8, 49.99,  '2025-03-15 08:30:00', 'UPI', 'SUCCESS', 'TXN-20250315-008'),
(9, 9, 129.99, '2025-04-16 17:45:00', 'CREDIT_CARD', 'SUCCESS', 'TXN-20250416-009'),
(10, 10, 449.99, '2025-04-01 10:00:00', 'CREDIT_CARD', 'SUCCESS', 'TXN-20250401-010'),
(11, 11, 49.99,  '2025-04-10 11:15:00', 'UPI', 'SUCCESS', 'TXN-20250410-011'),
(12, 12, 34.99,  '2025-05-01 13:50:00', 'UPI', 'SUCCESS', 'TXN-20250501-012'),
(13, 13, 129.99, '2025-05-15 15:30:00', 'DEBIT_CARD', 'FAILED', 'TXN-20250515-013'),
(14, 14, 239.99, '2025-06-01 14:00:00', 'CASH', 'PENDING', 'TXN-20250601-014'),
(15, 15, 239.99, '2025-04-16 09:20:00', 'UPI', 'SUCCESS', 'TXN-20250416-015'),
(16, 14, 239.99, '2025-06-02 10:00:00', 'CREDIT_CARD', 'SUCCESS', 'TXN-20250602-016');

-- ---------------------------------------------------------------------
-- 6. Insert Attendance (25 real-world check-in / check-out records)
-- ---------------------------------------------------------------------
INSERT INTO attendance (attendance_id, member_id, check_in, check_out) VALUES
(1, 1, '2025-06-01 06:30:00', '2025-06-01 07:45:00'),
(2, 2, '2025-06-01 07:00:00', '2025-06-01 08:15:00'),
(3, 3, '2025-06-01 07:30:00', '2025-06-01 08:45:00'),
(4, 5, '2025-06-01 17:30:00', '2025-06-01 19:00:00'),
(5, 6, '2025-06-01 18:00:00', '2025-06-01 19:15:00'),
(6, 7, '2025-06-01 18:30:00', '2025-06-01 19:45:00'),
(7, 8, '2025-06-01 19:00:00', '2025-06-01 20:20:00'),
(8, 1, '2025-06-02 06:15:00', '2025-06-02 07:30:00'),
(9, 2, '2025-06-02 07:15:00', '2025-06-02 08:30:00'),
(10, 4, '2025-06-02 08:00:00', '2025-06-02 09:10:00'),
(11, 5, '2025-06-02 17:15:00', '2025-06-02 18:45:00'),
(12, 10, '2025-06-02 18:00:00', '2025-06-02 19:00:00'),
(13, 12, '2025-06-02 19:00:00', '2025-06-02 20:15:00'),
(14, 1, '2025-06-03 06:30:00', '2025-06-03 07:50:00'),
(15, 3, '2025-06-03 07:00:00', '2025-06-03 08:20:00'),
(16, 6, '2025-06-03 17:45:00', '2025-06-03 19:00:00'),
(17, 7, '2025-06-03 18:15:00', '2025-06-03 19:30:00'),
(18, 8, '2025-06-03 19:00:00', '2025-06-03 20:05:00'),
(19, 2, '2025-06-04 07:00:00', '2025-06-04 08:15:00'),
(20, 5, '2025-06-04 17:30:00', '2025-06-04 18:50:00'),
(21, 10, '2025-06-04 18:30:00', '2025-06-04 19:30:00'),
(22, 12, '2025-06-04 19:15:00', '2025-06-04 20:30:00'),
(23, 1, '2025-06-05 06:45:00', '2025-06-05 08:00:00'),
(24, 3, '2025-06-05 07:15:00', '2025-06-05 08:30:00'),
(25, 6, '2025-06-05 18:00:00', NULL); -- Currently active open session (Checked in)

-- ---------------------------------------------------------------------
-- 7. Insert Users (Admin and Staff with standard BCrypt hashed passwords)
-- Passwords:
--   admin@gymsphere.com -> admin123
--   staff@gymsphere.com -> staff123
--   john.staff@gymsphere.com -> staff123
-- BCrypt cost 10 hashes generated for Spring Security authentication.
-- ---------------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, role, enabled) VALUES
(1, 'System Administrator', 'admin@gymsphere.com', '$2a$10$iI0T4/Kszm7rM9V6Ymg8d.C0K4s2Z51zH6X9aQZ51Zg1L.E74yLbe', 'ROLE_ADMIN', TRUE),
(2, 'Sarah Staffer', 'staff@gymsphere.com', '$2a$10$w4rU8qT.uO3e3FkCjIq6j.d5n4G2jW1dF5s7aPZ40Yf0K.D63xKbe', 'ROLE_STAFF', TRUE),
(3, 'John Frontdesk', 'john.staff@gymsphere.com', '$2a$10$w4rU8qT.uO3e3FkCjIq6j.d5n4G2jW1dF5s7aPZ40Yf0K.D63xKbe', 'ROLE_STAFF', TRUE);
