-- PeerPod Authentication Setup
-- ================================
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- This sets up RLS policies and the user creation trigger

-- ============================================
-- STEP 1: Enable RLS on all tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Create trigger for automatic user profile creation
-- ============================================
-- This trigger runs when a new user signs up via Supabase Auth
-- It automatically creates their profile in the users table
-- Using SECURITY DEFINER allows it to bypass RLS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer')
  );
  
  -- If freelancer, create freelancer_profile
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer') = 'freelancer' THEN
    INSERT INTO public.freelancer_profiles (user_id, personality, skills, hours_per_week, timezone, onboarding_complete)
    VALUES (NEW.id, '{}', '[]', 20, 'UTC', false);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: RLS Policies for USERS table
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users" ON users;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow viewing other users (needed for team collaboration)
CREATE POLICY "Users can view other users"
  ON users FOR SELECT
  USING (true);

-- ============================================
-- STEP 4: RLS Policies for FREELANCER_PROFILES table
-- ============================================
DROP POLICY IF EXISTS "Freelancers can view their own profile" ON freelancer_profiles;
DROP POLICY IF EXISTS "Freelancers can update their own profile" ON freelancer_profiles;
DROP POLICY IF EXISTS "Anyone can view freelancer profiles" ON freelancer_profiles;

-- Freelancers can view their own profile
CREATE POLICY "Freelancers can view their own profile"
  ON freelancer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Freelancers can update their own profile
CREATE POLICY "Freelancers can update their own profile"
  ON freelancer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can view freelancer profiles (for matching)
CREATE POLICY "Anyone can view freelancer profiles"
  ON freelancer_profiles FOR SELECT
  USING (true);

-- ============================================
-- STEP 5: RLS Policies for PROJECTS table
-- ============================================
DROP POLICY IF EXISTS "Anyone can view open projects" ON projects;
DROP POLICY IF EXISTS "Clients can create projects" ON projects;
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can delete their own projects" ON projects;

-- Anyone can view open projects
CREATE POLICY "Anyone can view open projects"
  ON projects FOR SELECT
  USING (is_open = true OR client_id = auth.uid());

-- Clients can create projects
CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update their own projects
CREATE POLICY "Clients can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = client_id);

-- Clients can delete their own projects
CREATE POLICY "Clients can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = client_id);

-- ============================================
-- STEP 6: RLS Policies for APPLICATIONS table
-- ============================================
DROP POLICY IF EXISTS "Freelancers can view their own applications" ON applications;
DROP POLICY IF EXISTS "Project owners can view applications" ON applications;
DROP POLICY IF EXISTS "Freelancers can create applications" ON applications;
DROP POLICY IF EXISTS "Freelancers can delete their own applications" ON applications;

-- Freelancers can view their own applications
CREATE POLICY "Freelancers can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = freelancer_id);

-- Project owners can view applications to their projects
CREATE POLICY "Project owners can view applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = applications.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Freelancers can create applications
CREATE POLICY "Freelancers can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

-- Freelancers can delete their own applications
CREATE POLICY "Freelancers can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = freelancer_id);

-- ============================================
-- STEP 7: RLS Policies for GROUPS table
-- ============================================
DROP POLICY IF EXISTS "Group members can view their groups" ON groups;
DROP POLICY IF EXISTS "Project owners can view groups" ON groups;
DROP POLICY IF EXISTS "Project owners can create groups" ON groups;
DROP POLICY IF EXISTS "Project owners can update groups" ON groups;

-- Group members can view their groups
CREATE POLICY "Group members can view their groups"
  ON groups FOR SELECT
  USING (auth.uid() = ANY(members));

-- Project owners can view groups
CREATE POLICY "Project owners can view groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = groups.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Project owners can create groups
CREATE POLICY "Project owners can create groups"
  ON groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- Project owners can update groups
CREATE POLICY "Project owners can update groups"
  ON groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = groups.project_id 
      AND projects.client_id = auth.uid()
    )
  );

-- ============================================
-- STEP 8: RLS Policies for TASKS table
-- ============================================
DROP POLICY IF EXISTS "Group members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Group members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Group members can update tasks" ON tasks;

-- Group members can view tasks
CREATE POLICY "Group members can view tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = tasks.group_id 
      AND auth.uid() = ANY(groups.members)
    )
  );

-- Group members can create tasks
CREATE POLICY "Group members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_id 
      AND auth.uid() = ANY(groups.members)
    )
  );

-- Group members can update tasks
CREATE POLICY "Group members can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = tasks.group_id 
      AND auth.uid() = ANY(groups.members)
    )
  );

-- ============================================
-- STEP 9: RLS Policies for CHAT_MESSAGES table
-- ============================================
DROP POLICY IF EXISTS "Group members can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Group members can send messages" ON chat_messages;

-- Group members can view messages
CREATE POLICY "Group members can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = chat_messages.group_id 
      AND auth.uid() = ANY(groups.members)
    )
  );

-- Group members can send messages
CREATE POLICY "Group members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_id 
      AND auth.uid() = ANY(groups.members)
    )
  );

-- ============================================
-- DONE! 
-- ============================================
-- Next steps:
-- 1. In Supabase Dashboard, go to Authentication > Providers > Email
-- 2. DISABLE "Confirm email" for development (or enable for production)
-- 3. Test signup/login in your app
