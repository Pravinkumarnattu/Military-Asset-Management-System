-- Kristallball: Military Asset Management System
-- Run this once against your PostgreSQL database to create all tables.

-- Bases Table
CREATE TABLE IF NOT EXISTS bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
    base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

-- Equipment Types (Weapons, Vehicles, Ammunition, etc.)
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('WEAPON', 'VEHICLE', 'AMMUNITION'))
);

-- Purchases: new stock added to a base
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Transfers: assets moving from one base to another
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT NOT NULL REFERENCES bases(id),
    destination_base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initiated_by INT REFERENCES users(id)
);

-- Assignments: assets given to personnel
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    assigned_to VARCHAR(150) NOT NULL, -- name of the personnel it was assigned to
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Expenditures: assets consumed / used up (e.g. spent ammunition)
CREATE TABLE IF NOT EXISTS expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Audit Logs: every mutation gets recorded here
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'EXPENDITURE'
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes for the fields we filter/join on most
CREATE INDEX IF NOT EXISTS idx_purchases_base ON purchases(base_id);
CREATE INDEX IF NOT EXISTS idx_purchases_equipment ON purchases(equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_transfers_source ON transfers(source_base_id);
CREATE INDEX IF NOT EXISTS idx_transfers_dest ON transfers(destination_base_id);
CREATE INDEX IF NOT EXISTS idx_transfers_equipment ON transfers(equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_assignments_base ON assignments(base_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_base ON expenditures(base_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
