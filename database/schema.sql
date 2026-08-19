-- ============================================
-- MINI ATTENDANCE MANAGEMENT SYSTEM
-- Database Schema
-- PostgreSQL
-- ============================================

-- ============================================
-- TABLE: users
-- Stores application login users
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'HR'))
);


-- ============================================
-- TABLE: employees
-- Stores employee information
-- ============================================

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL UNIQUE,

    employee_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    mobile_number VARCHAR(15) NOT NULL UNIQUE,

    department VARCHAR(100) NOT NULL,

    designation VARCHAR(100) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT employees_status_check
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);


-- ============================================
-- TABLE: attendance
-- Stores daily attendance records
-- ============================================

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL,

    attendance_date DATE NOT NULL,

    check_in_time TIME,

    check_out_time TIME,

    attendance_status VARCHAR(20) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT attendance_status_check
        CHECK (
            attendance_status IN (
                'PRESENT',
                'ABSENT',
                'HALF_DAY',
                'LEAVE'
            )
        ),

    CONSTRAINT unique_employee_attendance
        UNIQUE (employee_id, attendance_date),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_employees_department
    ON employees(department);

CREATE INDEX idx_employees_status
    ON employees(status);

CREATE INDEX idx_attendance_employee
    ON attendance(employee_id);

CREATE INDEX idx_attendance_date
    ON attendance(attendance_date);