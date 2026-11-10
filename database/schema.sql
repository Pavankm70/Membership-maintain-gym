-- =====================================================================
-- GymSphere DBMS Project: Database Schema Definition
-- Database: MySQL 8.0+
-- Description: Creates gymsphere_db with all 7 tables in strict foreign
--              key dependency order, complete constraints, indexes, 
--              and a specialized reporting view for DBMS viva demonstration.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gymsphere_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gymsphere_db;

-- ---------------------------------------------------------------------
-- Table 1: members
-- Stores gym customer profiles. Independent of system users.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(20) DEFAULT 'Other',
    date_of_birth DATE NULL,
    join_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_member_gender CHECK (gender IN ('Male', 'Female', 'Other', 'Non-Binary')),
    CONSTRAINT chk_member_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 2: trainers
-- Stores fitness instructors and trainers available for assignment.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainers (
    trainer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    specialization VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT chk_trainer_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 3: membership_plans
-- Stores catalog of membership packages with duration and pricing.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_plans (
    plan_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    duration_months INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_plan_duration CHECK (duration_months > 0),
    CONSTRAINT chk_plan_price CHECK (price >= 0.00)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 4: subscriptions
-- Bridges members and membership_plans (Many-to-Many resolved).
-- Optionally links a personal trainer. Preserves purchase price.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    trainer_id BIGINT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    amount_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_member FOREIGN KEY (member_id)
        REFERENCES members(member_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_sub_plan FOREIGN KEY (plan_id)
        REFERENCES membership_plans(plan_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_sub_trainer FOREIGN KEY (trainer_id)
        REFERENCES trainers(trainer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_sub_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_sub_amount CHECK (amount_at_purchase >= 0.00),
    CONSTRAINT chk_sub_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 5: payments
-- Financial ledger tracking transactions linked to subscriptions.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    transaction_ref VARCHAR(100) NULL UNIQUE,
    CONSTRAINT fk_pay_subscription FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(subscription_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_pay_amount CHECK (amount > 0.00),
    CONSTRAINT chk_pay_status CHECK (payment_status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 6: attendance
-- Records daily member gym check-ins and check-outs.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    check_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP NULL,
    CONSTRAINT fk_att_member FOREIGN KEY (member_id)
        REFERENCES members(member_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_att_time CHECK (check_out IS NULL OR check_out >= check_in)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 7: users
-- Internal system users (Administrators & Staff) for authentication.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_STAFF',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('ROLE_ADMIN', 'ROLE_STAFF'))
) ENGINE=InnoDB;

-- =====================================================================
-- Performance Indexes (DBMS Demonstration)
-- =====================================================================
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_subs_member ON subscriptions(member_id);
CREATE INDEX idx_subs_status_dates ON subscriptions(status, start_date, end_date);
CREATE INDEX idx_payments_sub ON payments(subscription_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_attendance_member_checkin ON attendance(member_id, check_in);

-- =====================================================================
-- Database View for Viva demonstration: Active Member Subscriptions
-- Consolidates members, active plans, assigned trainers, and payment status.
-- =====================================================================
CREATE OR REPLACE VIEW view_active_member_details AS
SELECT 
    m.member_id,
    m.full_name AS member_name,
    m.email AS member_email,
    m.phone AS member_phone,
    s.subscription_id,
    p.plan_name,
    s.start_date,
    s.end_date,
    DATEDIFF(s.end_date, CURDATE()) AS days_remaining,
    COALESCE(t.full_name, 'No Trainer Assigned') AS trainer_name,
    s.amount_at_purchase,
    s.status AS subscription_status
FROM members m
JOIN subscriptions s ON m.member_id = s.member_id
JOIN membership_plans p ON s.plan_id = p.plan_id
LEFT JOIN trainers t ON s.trainer_id = t.trainer_id
WHERE s.status = 'ACTIVE';
