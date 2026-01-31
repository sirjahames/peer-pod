export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: "client" | "freelancer";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    role: "client" | "freelancer";
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: "client" | "freelancer";
                    created_at?: string;
                };
            };
            freelancer_profiles: {
                Row: {
                    user_id: string;
                    personality: number[];
                    skills: Json;
                    hours_per_week: number;
                    timezone: string;
                    onboarding_complete: boolean;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    personality: number[];
                    skills: Json;
                    hours_per_week: number;
                    timezone: string;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    personality?: number[];
                    skills?: Json;
                    hours_per_week?: number;
                    timezone?: string;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
            };
            projects: {
                Row: {
                    id: string;
                    client_id: string;
                    title: string;
                    description: string;
                    required_skills: string[];
                    team_size: number;
                    due_date: string;
                    join_code: string;
                    is_open: boolean;
                    created_at: string;
                    job_type: string | null;
                    experience_level: string | null;
                    payment_type: string | null;
                    payment_amount: number | null;
                    payment_max: number | null;
                    work_location: string | null;
                    location: string | null;
                    estimated_duration: string | null;
                    responsibilities: string[] | null;
                    requirements: string[] | null;
                    benefits: string[] | null;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    title: string;
                    description: string;
                    required_skills: string[];
                    team_size: number;
                    due_date: string;
                    join_code: string;
                    is_open?: boolean;
                    created_at?: string;
                    job_type?: string | null;
                    experience_level?: string | null;
                    payment_type?: string | null;
                    payment_amount?: number | null;
                    payment_max?: number | null;
                    work_location?: string | null;
                    location?: string | null;
                    estimated_duration?: string | null;
                    responsibilities?: string[] | null;
                    requirements?: string[] | null;
                    benefits?: string[] | null;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    title?: string;
                    description?: string;
                    required_skills?: string[];
                    team_size?: number;
                    due_date?: string;
                    join_code?: string;
                    is_open?: boolean;
                    created_at?: string;
                    job_type?: string | null;
                    experience_level?: string | null;
                    payment_type?: string | null;
                    payment_amount?: number | null;
                    payment_max?: number | null;
                    work_location?: string | null;
                    location?: string | null;
                    estimated_duration?: string | null;
                    responsibilities?: string[] | null;
                    requirements?: string[] | null;
                    benefits?: string[] | null;
                };
            };
            groups: {
                Row: {
                    id: string;
                    project_id: string;
                    members: string[];
                    status: "ACTIVE" | "OPEN" | "CLOSED";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    members: string[];
                    status?: "ACTIVE" | "OPEN" | "CLOSED";
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    members?: string[];
                    status?: "ACTIVE" | "OPEN" | "CLOSED";
                    created_at?: string;
                };
            };
            applications: {
                Row: {
                    id: string;
                    project_id: string;
                    freelancer_id: string;
                    applied_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    freelancer_id: string;
                    applied_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    freelancer_id?: string;
                    applied_at?: string;
                };
            };
            tasks: {
                Row: {
                    id: string;
                    group_id: string;
                    title: string;
                    description: string;
                    assigned_to: string | null;
                    completed: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    group_id: string;
                    title: string;
                    description: string;
                    assigned_to?: string | null;
                    completed?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    group_id?: string;
                    title?: string;
                    description?: string;
                    assigned_to?: string | null;
                    completed?: boolean;
                    created_at?: string;
                };
            };
            chat_messages: {
                Row: {
                    id: string;
                    group_id: string;
                    user_id: string;
                    message: string;
                    timestamp: string;
                };
                Insert: {
                    id?: string;
                    group_id: string;
                    user_id: string;
                    message: string;
                    timestamp?: string;
                };
                Update: {
                    id?: string;
                    group_id?: string;
                    user_id?: string;
                    message?: string;
                    timestamp?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
