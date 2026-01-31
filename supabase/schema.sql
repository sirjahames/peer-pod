-- PeerPod Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'freelancer')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freelancer profiles
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    personality INTEGER[] NOT NULL DEFAULT '{}',
    quiz_result JSONB,  -- New comprehensive quiz data
    skills JSONB NOT NULL DEFAULT '[]',
    hours_per_week INTEGER NOT NULL DEFAULT 20,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    team_size INTEGER NOT NULL DEFAULT 3,
    due_date DATE NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Job details
    job_type TEXT CHECK (job_type IN ('contract', 'freelance', 'part-time', 'full-time', 'project-based')),
    experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert')),
    payment_type TEXT CHECK (payment_type IN ('hourly', 'fixed', 'milestone', 'negotiable')),
    payment_amount DECIMAL(10, 2),
    payment_max DECIMAL(10, 2),
    work_location TEXT CHECK (work_location IN ('remote', 'hybrid', 'onsite')),
    location TEXT,
    estimated_duration TEXT,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}'
);

-- Groups (formed teams)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    members UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, freelancer_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_open ON projects(is_open);
CREATE INDEX IF NOT EXISTS idx_applications_project_id ON applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_id ON applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_project_id ON groups(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- For development, allow all operations (replace with proper policies in production)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for freelancer_profiles" ON freelancer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for applications" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Seed data for testing
INSERT INTO users (id, email, name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Johnson', 'freelancer'),
    ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Smith', 'freelancer'),
    ('33333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol Davis', 'client'),
    ('44444444-4444-4444-4444-444444444444', 'dan@example.com', 'Dan Wilson', 'freelancer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO freelancer_profiles (user_id, personality, skills, hours_per_week, timezone, onboarding_complete) VALUES
    ('11111111-1111-1111-1111-111111111111', 
     ARRAY[4,3,5,2,4,3,5,4,3,2,4,5,3,4,2,5,3,4,5,3],
     '[{"skill":"React","proficiency":5},{"skill":"TypeScript","proficiency":4},{"skill":"Node.js","proficiency":3}]'::jsonb,
     30, 'UTC-5', true),
    ('22222222-2222-2222-2222-222222222222',
     ARRAY[3,4,4,3,3,4,4,3,4,3,3,4,4,3,3,4,4,3,4,4],
     '[{"skill":"Python","proficiency":5},{"skill":"Django","proficiency":4},{"skill":"PostgreSQL","proficiency":4}]'::jsonb,
     40, 'UTC+0', true),
    ('44444444-4444-4444-4444-444444444444',
     ARRAY[5,2,4,4,5,2,3,5,2,4,5,3,2,5,4,3,2,5,4,3],
     '[{"skill":"React","proficiency":4},{"skill":"Node.js","proficiency":5},{"skill":"MongoDB","proficiency":4}]'::jsonb,
     25, 'UTC-8', true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO projects (id, client_id, title, description, required_skills, team_size, due_date, join_code, is_open, job_type, experience_level, payment_type, payment_amount, payment_max, work_location, estimated_duration, responsibilities, requirements, benefits) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '33333333-3333-3333-3333-333333333333',
     'E-commerce Platform',
     'We are looking for talented developers to build a modern, scalable e-commerce platform.',
     ARRAY['React', 'Node.js', 'PostgreSQL'],
     3, '2026-03-15', 'ECOM2026', true,
     'contract', 'intermediate', 'hourly', 50, 75, 'remote', '2-3 months',
     ARRAY['Design and implement scalable frontend components', 'Build RESTful APIs', 'Integrate payment gateways'],
     ARRAY['3+ years experience with React and Node.js', 'Experience with PostgreSQL'],
     ARRAY['Flexible hours', 'Performance bonuses', 'Long-term opportunity']),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '33333333-3333-3333-3333-333333333333',
     'Data Dashboard Project',
     'Build an interactive data visualization dashboard for business analytics.',
     ARRAY['Python', 'React', 'PostgreSQL'],
     2, '2026-02-28', 'DATA2026', true,
     'project-based', 'senior', 'fixed', 8000, NULL, 'remote', '2 months',
     ARRAY['Create data pipelines', 'Build interactive charts', 'Implement filters'],
     ARRAY['5+ years experience', 'Strong Python and data visualization skills'],
     ARRAY['Full creative freedom', 'Milestone-based payments'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO applications (project_id, freelancer_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (project_id, freelancer_id) DO NOTHING;

INSERT INTO groups (id, project_id, members, status) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     ARRAY['22222222-2222-2222-2222-222222222222']::UUID[],
     'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (group_id, title, description, assigned_to, completed) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Set up Python environment', 'Initialize project with Python 3.11', '22222222-2222-2222-2222-222222222222', true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Design dashboard layout', 'Create wireframes for main dashboard view', '22222222-2222-2222-2222-222222222222', true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Build data ingestion pipeline', 'Create ETL scripts', '22222222-2222-2222-2222-222222222222', false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Implement interactive charts', 'Build reusable chart components', '22222222-2222-2222-2222-222222222222', false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Add filtering and date range', 'Implement filter dropdowns and date pickers', '22222222-2222-2222-2222-222222222222', false)
ON CONFLICT DO NOTHING;
