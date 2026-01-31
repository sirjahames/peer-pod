/**
 * Supabase Data Layer
 *
 * This module provides database operations using Supabase.
 * It mirrors the interface of data.ts for seamless switching.
 *
 * To use Supabase instead of in-memory storage:
 * 1. Set up your Supabase project
 * 2. Run the schema.sql in Supabase SQL Editor
 * 3. Add your credentials to .env.local
 * 4. Import from this file instead of data.ts
 */

import { createBrowserClient } from "@supabase/ssr";
import type {
    User,
    FreelancerProfile,
    Project,
    Group,
    Application,
    Task,
    ChatMessage,
    SkillEntry,
    JobType,
    ExperienceLevel,
    PaymentType,
    WorkLocation,
} from "./types";

// Create a Supabase client with type safety disabled for flexibility
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url === "your-supabase-url") {
        throw new Error(
            "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
        );
    }

    return createBrowserClient(url, key);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-supabase-url"
    );
}

// ============ USERS ============

export async function getUser(id: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error || !data) return null;

    const userData = data as { id: string; email: string; name: string; role: string };
    return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as "client" | "freelancer",
    };
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

    if (error || !data) return null;

    const userData = data as { id: string; email: string; name: string; role: string };
    return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as "client" | "freelancer",
    };
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("users")
        .insert({
            email: user.email,
            name: user.name,
            role: user.role,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as "client" | "freelancer",
    };
}

export async function getUsers(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("users").select("*").in("id", ids);

    if (error || !data) return [];

    return data.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "client" | "freelancer",
    }));
}

// ============ FREELANCER PROFILES ============

export async function getFreelancerProfile(userId: string): Promise<FreelancerProfile | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("freelancer_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;

    return {
        userId: data.user_id,
        personality: data.personality,
        skills: data.skills as SkillEntry[],
        availability: {
            hoursPerWeek: data.hours_per_week,
            timezone: data.timezone,
        },
        onboardingComplete: data.onboarding_complete,
    };
}

export async function createFreelancerProfile(
    profile: FreelancerProfile,
): Promise<FreelancerProfile> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("freelancer_profiles")
        .insert({
            user_id: profile.userId,
            personality: profile.personality,
            skills: profile.skills,
            hours_per_week: profile.availability.hoursPerWeek,
            timezone: profile.availability.timezone,
            onboarding_complete: profile.onboardingComplete,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return profile;
}

export async function updateFreelancerProfile(
    userId: string,
    updates: Partial<FreelancerProfile>,
): Promise<FreelancerProfile | null> {
    const supabase = getSupabaseClient();

    const dbUpdates: Record<string, unknown> = {};
    if (updates.personality) dbUpdates.personality = updates.personality;
    if (updates.skills) dbUpdates.skills = updates.skills;
    if (updates.availability) {
        dbUpdates.hours_per_week = updates.availability.hoursPerWeek;
        dbUpdates.timezone = updates.availability.timezone;
    }
    if (updates.onboardingComplete !== undefined) {
        dbUpdates.onboarding_complete = updates.onboardingComplete;
    }

    const { error } = await supabase
        .from("freelancer_profiles")
        .update(dbUpdates)
        .eq("user_id", userId);

    if (error) return null;

    return getFreelancerProfile(userId);
}

// ============ PROJECTS ============

export async function getProject(id: string): Promise<Project | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();

    if (error || !data) return null;

    return mapProjectFromDb(data);
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("projects").select("*").eq("client_id", clientId);

    if (error || !data) return [];

    return data.map(mapProjectFromDb);
}

export async function getOpenProjects(): Promise<Project[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("projects").select("*").eq("is_open", true);

    if (error || !data) return [];

    return data.map(mapProjectFromDb);
}

export async function createProject(
    clientId: string,
    projectData: Omit<Project, "id" | "clientId" | "joinCode" | "createdAt">,
): Promise<Project> {
    const supabase = getSupabaseClient();
    const joinCode = generateJoinCode();

    const { data, error } = await supabase
        .from("projects")
        .insert({
            client_id: clientId,
            title: projectData.title,
            description: projectData.description,
            required_skills: projectData.requiredSkills,
            team_size: projectData.teamSize,
            due_date: projectData.dueDate,
            join_code: joinCode,
            is_open: projectData.isOpen,
            job_type: projectData.jobType,
            experience_level: projectData.experienceLevel,
            payment_type: projectData.paymentType,
            payment_amount: projectData.paymentAmount,
            payment_max: projectData.paymentMax,
            work_location: projectData.workLocation,
            location: projectData.location,
            estimated_duration: projectData.estimatedDuration,
            responsibilities: projectData.responsibilities || [],
            requirements: projectData.requirements || [],
            benefits: projectData.benefits || [],
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return mapProjectFromDb(data);
}

export async function updateProject(
    id: string,
    updates: Partial<Project>,
): Promise<Project | null> {
    const supabase = getSupabaseClient();

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.requiredSkills) dbUpdates.required_skills = updates.requiredSkills;
    if (updates.teamSize) dbUpdates.team_size = updates.teamSize;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.isOpen !== undefined) dbUpdates.is_open = updates.isOpen;
    if (updates.jobType) dbUpdates.job_type = updates.jobType;
    if (updates.experienceLevel) dbUpdates.experience_level = updates.experienceLevel;
    if (updates.paymentType) dbUpdates.payment_type = updates.paymentType;
    if (updates.paymentAmount !== undefined) dbUpdates.payment_amount = updates.paymentAmount;
    if (updates.paymentMax !== undefined) dbUpdates.payment_max = updates.paymentMax;
    if (updates.workLocation) dbUpdates.work_location = updates.workLocation;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.estimatedDuration !== undefined)
        dbUpdates.estimated_duration = updates.estimatedDuration;
    if (updates.responsibilities) dbUpdates.responsibilities = updates.responsibilities;
    if (updates.requirements) dbUpdates.requirements = updates.requirements;
    if (updates.benefits) dbUpdates.benefits = updates.benefits;

    const { error } = await supabase.from("projects").update(dbUpdates).eq("id", id);

    if (error) return null;

    return getProject(id);
}

export async function deleteProject(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    return !error;
}

function mapProjectFromDb(data: Record<string, unknown>): Project {
    return {
        id: data.id as string,
        clientId: data.client_id as string,
        title: data.title as string,
        description: data.description as string,
        requiredSkills: data.required_skills as string[],
        teamSize: data.team_size as number,
        dueDate: data.due_date as string,
        joinCode: data.join_code as string,
        isOpen: data.is_open as boolean,
        createdAt: (data.created_at as string).split("T")[0],
        jobType: data.job_type as JobType | undefined,
        experienceLevel: data.experience_level as ExperienceLevel | undefined,
        paymentType: data.payment_type as PaymentType | undefined,
        paymentAmount: data.payment_amount as number | undefined,
        paymentMax: data.payment_max as number | undefined,
        workLocation: data.work_location as WorkLocation | undefined,
        location: data.location as string | undefined,
        estimatedDuration: data.estimated_duration as string | undefined,
        responsibilities: (data.responsibilities as string[]) || [],
        requirements: (data.requirements as string[]) || [],
        benefits: (data.benefits as string[]) || [],
    };
}

// ============ APPLICATIONS ============

export async function getProjectApplications(projectId: string): Promise<Application[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("project_id", projectId);

    if (error || !data) return [];

    return data.map((a) => ({
        id: a.id,
        projectId: a.project_id,
        freelancerId: a.freelancer_id,
        appliedAt: a.applied_at,
    }));
}

export async function getFreelancerApplications(freelancerId: string): Promise<Application[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("freelancer_id", freelancerId);

    if (error || !data) return [];

    return data.map((a) => ({
        id: a.id,
        projectId: a.project_id,
        freelancerId: a.freelancer_id,
        appliedAt: a.applied_at,
    }));
}

export async function applyToProject(
    freelancerId: string,
    projectId: string,
): Promise<Application> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("applications")
        .insert({
            project_id: projectId,
            freelancer_id: freelancerId,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        projectId: data.project_id,
        freelancerId: data.freelancer_id,
        appliedAt: data.applied_at,
    };
}

export async function hasApplied(freelancerId: string, projectId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("project_id", projectId)
        .eq("freelancer_id", freelancerId)
        .single();

    return !error && !!data;
}

// ============ GROUPS ============

export async function getGroup(id: string): Promise<Group | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("groups").select("*").eq("id", id).single();

    if (error || !data) return null;

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members,
        status: data.status as "ACTIVE" | "OPEN" | "CLOSED",
    };
}

export async function getProjectGroup(projectId: string): Promise<Group | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("project_id", projectId)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members,
        status: data.status as "ACTIVE" | "OPEN" | "CLOSED",
    };
}

export async function getFreelancerGroups(freelancerId: string): Promise<Group[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .contains("members", [freelancerId]);

    if (error || !data) return [];

    return data.map((g) => ({
        id: g.id,
        projectId: g.project_id,
        members: g.members,
        status: g.status as "ACTIVE" | "OPEN" | "CLOSED",
    }));
}

export async function createGroup(projectId: string, memberIds: string[]): Promise<Group> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("groups")
        .insert({
            project_id: projectId,
            members: memberIds,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members,
        status: data.status as "ACTIVE" | "OPEN" | "CLOSED",
    };
}

// ============ TASKS ============

export async function getGroupTasks(groupId: string): Promise<Task[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("tasks").select("*").eq("group_id", groupId);

    if (error || !data) return [];

    return data.map((t) => ({
        id: t.id,
        groupId: t.group_id,
        title: t.title,
        description: t.description,
        assignedTo: t.assigned_to,
        completed: t.completed,
    }));
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("tasks")
        .insert({
            group_id: task.groupId,
            title: task.title,
            description: task.description,
            assigned_to: task.assignedTo,
            completed: task.completed,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        groupId: data.group_id,
        title: data.title,
        description: data.description,
        assignedTo: data.assigned_to,
        completed: data.completed,
    };
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const supabase = getSupabaseClient();

    const dbUpdates: Record<string, unknown> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

    const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", id);

    if (error) return null;

    const { data } = await supabase.from("tasks").select("*").eq("id", id).single();
    if (!data) return null;

    return {
        id: data.id,
        groupId: data.group_id,
        title: data.title,
        description: data.description,
        assignedTo: data.assigned_to,
        completed: data.completed,
    };
}

// ============ CHAT MESSAGES ============

export async function getGroupMessages(groupId: string): Promise<ChatMessage[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("timestamp", { ascending: true });

    if (error || !data) return [];

    return data.map((m) => ({
        id: m.id,
        groupId: m.group_id,
        userId: m.user_id,
        message: m.message,
        timestamp: m.timestamp,
    }));
}

export async function sendMessage(
    groupId: string,
    userId: string,
    message: string,
): Promise<ChatMessage> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("chat_messages")
        .insert({
            group_id: groupId,
            user_id: userId,
            message,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return {
        id: data.id,
        groupId: data.group_id,
        userId: data.user_id,
        message: data.message,
        timestamp: data.timestamp,
    };
}

// ============ HELPERS ============

function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
