-- Bloomhabit Database Initialization Script
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE habit_category AS ENUM (
        'health', 'fitness', 'productivity', 'learning',
        'relationships', 'finance', 'creativity', 'mindfulness', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flower_type AS ENUM (
        'rose', 'sunflower', 'tulip', 'daisy',
        'lily', 'orchid', 'cactus', 'bamboo'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE log_type AS ENUM ('completed', 'missed', 'partial', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entry_type AS ENUM (
        'reflection', 'gratitude', 'goal_setting',
        'progress_update', 'challenge', 'celebration', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mood_rating AS ENUM ('1', '2', '3', '4', '5');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar VARCHAR(500),
    role user_role DEFAULT 'user',
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    github_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category habit_category DEFAULT 'other',
    frequency habit_frequency DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    flower_type flower_type DEFAULT 'rose',
    growth_stage INTEGER DEFAULT 1,
    health_points INTEGER DEFAULT 100,
    water_level INTEGER DEFAULT 0,
    custom_schedule JSONB,
    reminders JSONB,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type log_type DEFAULT 'completed',
    log_date DATE NOT NULL,
    count INTEGER DEFAULT 1,
    notes TEXT,
    metadata JSONB,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type entry_type DEFAULT 'reflection',
    mood mood_rating,
    tags TEXT[],
    metadata JSONB,
    is_private BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_log_date ON habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_type ON habit_logs(type);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional for development)
-- INSERT INTO users (email, username, first_name, last_name) VALUES
-- ('demo@bloomhabit.com', 'demo', 'Demo', 'User');

COMMIT;
