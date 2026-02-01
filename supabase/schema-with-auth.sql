-- PeerPod Database Schema for Supabase with Auth
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Allow all for users" ON users;
DROP POLICY IF EXISTS "Allow all for freelancer_profiles" ON freelancer_profiles;
DROP POLICY IF EXISTS "Allow all for projects" ON projects;
DROP POLICY IF EXISTS "Allow all for groups" ON groups;
DROP POLICY IF EXISTS "Allow all for applications" ON applications;
DROP POLICY IF EXISTS "Allow all for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all for chat_messages" ON chat_messages;

-- Users policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Freelancer profiles policies
CREATE POLICY "Anyone can view freelancer profiles" ON freelancer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own freelancer profile" ON freelancer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own freelancer profile" ON freelancer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Anyone can view open projects" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Clients can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = client_id);

-- Applications policies
CREATE POLICY "Users can view relevant applications" ON applications
    FOR SELECT USING (
        auth.uid() = freelancer_id OR 
        EXISTS (SELECT 1 FROM projects WHERE projects.id = applications.project_id AND projects.client_id = auth.uid())
    );

CREATE POLICY "Freelancers can apply to projects" ON applications
    FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can withdraw applications" ON applications
    FOR DELETE USING (auth.uid() = freelancer_id);

-- Groups policies
CREATE POLICY "Anyone can view groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Project owners can create groups" ON groups
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = groups.project_id AND projects.client_id = auth.uid())
    );

CREATE POLICY "Project owners can update groups" ON groups
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = groups.project_id AND projects.client_id = auth.uid())
    );

-- Tasks policies
CREATE POLICY "Group members can view tasks" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Group members can create tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM groups WHERE groups.id = tasks.group_id AND auth.uid() = ANY(groups.members))
        OR EXISTS (
            SELECT 1 FROM groups 
            JOIN projects ON projects.id = groups.project_id 
            WHERE groups.id = tasks.group_id AND projects.client_id = auth.uid()
        )
    );

CREATE POLICY "Assigned users or project owners can update tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = assigned_to
        OR EXISTS (
            SELECT 1 FROM groups 
            JOIN projects ON projects.id = groups.project_id 
            WHERE groups.id = tasks.group_id AND projects.client_id = auth.uid()
        )
    );

-- Chat messages policies
CREATE POLICY "Group members can view messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM groups WHERE groups.id = chat_messages.group_id AND auth.uid() = ANY(groups.members))
        OR EXISTS (
            SELECT 1 FROM groups 
            JOIN projects ON projects.id = groups.project_id 
            WHERE groups.id = chat_messages.group_id AND projects.client_id = auth.uid()
        )
    );

CREATE POLICY "Group members can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (SELECT 1 FROM groups WHERE groups.id = chat_messages.group_id AND auth.uid() = ANY(groups.members))
            OR EXISTS (
                SELECT 1 FROM groups 
                JOIN projects ON projects.id = groups.project_id 
                WHERE groups.id = chat_messages.group_id AND projects.client_id = auth.uid()
            )
        )
    );
