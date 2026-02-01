export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    graphql_public: {
        Tables: Record<string, never>;
        Views: Record<string, never>;
        Functions: {
            graphql: {
                Args: {
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                    extensions?: Json;
                };
                Returns: Json;
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: string;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            freelancer_profiles: {
                Row: {
                    user_id: string;
                    personality: number[];
                    quiz_result: Json | null;
                    skills: Json;
                    hours_per_week: number;
                    timezone: string;
                    onboarding_complete: boolean;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    personality?: number[];
                    quiz_result?: Json | null;
                    skills?: Json;
                    hours_per_week?: number;
                    timezone?: string;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    personality?: number[];
                    quiz_result?: Json | null;
                    skills?: Json;
                    hours_per_week?: number;
                    timezone?: string;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "freelancer_profiles_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
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
                Relationships: [
                    {
                        foreignKeyName: "projects_client_id_fkey";
                        columns: ["client_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            groups: {
                Row: {
                    id: string;
                    project_id: string;
                    members: string[];
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    members: string[];
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    members?: string[];
                    status?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "groups_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                ];
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
                Relationships: [
                    {
                        foreignKeyName: "applications_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "applications_freelancer_id_fkey";
                        columns: ["freelancer_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
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
                Relationships: [
                    {
                        foreignKeyName: "tasks_group_id_fkey";
                        columns: ["group_id"];
                        isOneToOne: false;
                        referencedRelation: "groups";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "tasks_assigned_to_fkey";
                        columns: ["assigned_to"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
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
                Relationships: [
                    {
                        foreignKeyName: "chat_messages_group_id_fkey";
                        columns: ["group_id"];
                        isOneToOne: false;
                        referencedRelation: "groups";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "chat_messages_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}
