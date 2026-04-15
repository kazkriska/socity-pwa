-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for payment_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('due', 'paid');
    END IF;
END$$;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    society TEXT NOT NULL DEFAULT 'Sarita Vihar',
    pocket CHAR(1) NOT NULL,
    flat_number INT NOT NULL UNIQUE,
    uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    access_pin_hash TEXT
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    payment_for_month TEXT NOT NULL,
    payment_status payment_status_enum NOT NULL,
    amount TEXT NOT NULL,
    payment_success_notes JSON,

    -- Foreign key constraint (1-to-many)
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create user_info table (1-to-1 with users)
CREATE TABLE user_info (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE, -- ensures 1:1 relationship
    name TEXT,
    email TEXT UNIQUE,
    mobile_number TEXT UNIQUE,
    number_of_cars INT,

    CONSTRAINT fk_user_info_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Optional: Index for faster lookups
CREATE INDEX idx_payments_user_id ON payments(user_id);
