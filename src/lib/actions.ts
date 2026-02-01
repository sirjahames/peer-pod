"use server";

import { createClient } from "./supabase/server";
import {
    User,
    FreelancerProfile,
    Project,
    Group,
    Application,
    Task,
    ChatMessage,
    GroupStatus,
    SkillEntry,
    Availability,
    PersonalityAssessment,
    WorkStyleAssessment,
    SchedulingAssessment,
    BigFiveScores,
    CompatibilityQuizResult,
    QuizResponse,
    TeamRole,
    ScheduleCommitments,
    AvailabilityGrid,
    JobType,
    ExperienceLevel,
    PaymentType,
    WorkLocation,
} from "./types";
import { assignTasksToTeam } from "./task-distribution";

// ============ AUTH ============

export async function login(
    email: string,
    password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError || !authData.user) {
        return { success: false, error: authError?.message || "Login failed" };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    if (profileError || !profile) {
        return { success: false, error: "User profile not found" };
    }

    const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as "client" | "freelancer",
    };

    return { success: true, user };
}

export async function signup(
    email: string,
    password: string,
    name: string,
    role: "client" | "freelancer",
): Promise<{ success: boolean; user?: User; error?: string }> {
    const supabase = await createClient();

    // Sign up with Supabase Auth
    // Email confirmation is DISABLED in Supabase Dashboard for development
    // The database trigger will automatically create the user profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role,
            },
        },
    });

    if (authError || !authData.user) {
        return { success: false, error: authError?.message || "Signup failed" };
    }

    // Check if session was created (email confirmation disabled = instant session)
    if (!authData.session) {
        // If no session, email confirmation might still be enabled
        return { 
            success: false, 
            error: "Email confirmation is required. Please check your email or disable email confirmation in Supabase Dashboard." 
        };
    }

    // Return success - the database trigger handles profile creation
    const user: User = {
        id: authData.user.id,
        email: email,
        name: name,
        role: role,
    };

    return { success: true, user };
}

export async function logout(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;
    
    return getUser(authUser.id);
}

// ============ USERS ============

export async function getUser(userId: string): Promise<User | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

    if (error || !data) return null;

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as "client" | "freelancer",
    };
}

export async function getUsers(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase.from("users").select("*").in("id", userIds);

    if (error || !data) return [];

    return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as "client" | "freelancer",
    }));
}

// ============ FREELANCER PROFILE ============

export async function getFreelancerProfile(userId: string): Promise<FreelancerProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("freelancer_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;

    return {
        userId: data.user_id,
        personality: data.personality || [],
        quizResult: data.quiz_result as CompatibilityQuizResult | undefined,
        skills: (data.skills as SkillEntry[]) || [],
        availability: {
            hoursPerWeek: data.hours_per_week,
            timezone: data.timezone,
        },
        onboardingComplete: data.onboarding_complete,
    };
}

export async function savePersonalityAssessment(userId: string, answers: number[]): Promise<void> {
    const supabase = await createClient();
    await supabase
        .from("freelancer_profiles")
        .update({ personality: answers })
        .eq("user_id", userId);
}

export async function saveSkills(userId: string, skills: SkillEntry[]): Promise<void> {
    const supabase = await createClient();
    await supabase.from("freelancer_profiles").update({ skills }).eq("user_id", userId);
}

export async function saveAvailability(userId: string, availability: Availability): Promise<void> {
    const supabase = await createClient();
    await supabase
        .from("freelancer_profiles")
        .update({
            hours_per_week: availability.hoursPerWeek,
            timezone: availability.timezone,
        })
        .eq("user_id", userId);
}

/**
 * Calculate Big Five personality scores from quiz answers
 */
function calculateBigFiveScores(personality: PersonalityAssessment): BigFiveScores {
    const extraversion = Math.round(
        ((personality.leadership + personality.brainstormer + (6 - personality.listener)) / 3 - 1) *
            25,
    );

    const openness = Math.round(
        ((6 - personality.traditionalism + personality.brainstormer + personality.adaptable) / 3 -
            1) *
            25,
    );

    const agreeableness = Math.round(
        ((personality.peacekeeper + personality.listener + (6 - personality.challenger)) / 3 - 1) *
            25,
    );

    const conscientiousness = Math.round(
        ((personality.leadership +
            personality.traditionalism +
            personality.calmUnderPressure +
            personality.challenger) /
            4 -
            1) *
            25,
    );

    const neuroticism = Math.round(
        ((personality.controlNeed +
            (6 - personality.calmUnderPressure) +
            (6 - personality.adaptable)) /
            3 -
            1) *
            25,
    );

    return {
        extraversion: Math.max(0, Math.min(100, extraversion)),
        openness: Math.max(0, Math.min(100, openness)),
        agreeableness: Math.max(0, Math.min(100, agreeableness)),
        conscientiousness: Math.max(0, Math.min(100, conscientiousness)),
        neuroticism: Math.max(0, Math.min(100, neuroticism)),
    };
}

/**
 * Save comprehensive compatibility quiz results
 */
export async function saveCompatibilityQuiz(
    userId: string,
    personality: PersonalityAssessment,
    workStyle: WorkStyleAssessment,
    scheduling: SchedulingAssessment,
    hoursPerWeek: number,
    timezone: string,
): Promise<void> {
    const supabase = await createClient();
    const bigFiveScores = calculateBigFiveScores(personality);

    const quizResult: CompatibilityQuizResult = {
        personality,
        workStyle,
        scheduling,
        bigFiveScores,
    };

    const personalityArray = [
        personality.leadership,
        personality.traditionalism,
        personality.peacekeeper,
        personality.brainstormer,
        personality.calmUnderPressure,
        personality.listener,
        personality.adaptable,
        personality.controlNeed,
        personality.challenger,
    ];

    await supabase
        .from("freelancer_profiles")
        .update({
            quiz_result: quizResult,
            personality: personalityArray,
            hours_per_week: hoursPerWeek,
            timezone: timezone,
        })
        .eq("user_id", userId);
}

export async function completeOnboarding(userId: string): Promise<void> {
    const supabase = await createClient();
    await supabase
        .from("freelancer_profiles")
        .update({ onboarding_complete: true })
        .eq("user_id", userId);
}

/**
 * Save quiz response from the new quiz page format
 */
export async function saveQuizResponse(response: QuizResponse): Promise<{ success: boolean }> {
    const supabase = await createClient();

    // Map personality scores (9 questions) to PersonalityAssessment
    const scores = response.personalityScores;
    const personality: PersonalityAssessment = {
        leadership: scores[0] || 3,
        traditionalism: scores[1] || 3,
        peacekeeper: scores[2] || 3,
        brainstormer: scores[3] || 3,
        calmUnderPressure: scores[4] || 3,
        listener: scores[5] || 3,
        adaptable: scores[6] || 3,
        controlNeed: scores[7] || 3,
        challenger: scores[8] || 3,
    };

    // Compute Big Five personality traits from personality scores
    const bigFiveScores: BigFiveScores = {
        openness: ((5 - personality.traditionalism + personality.adaptable) / 2) * 20, // 0-100
        conscientiousness: ((personality.leadership + personality.calmUnderPressure) / 2) * 20,
        extraversion: ((5 - personality.listener + personality.brainstormer) / 2) * 20,
        agreeableness: ((personality.peacekeeper + (5 - personality.challenger)) / 2) * 20,
        neuroticism: personality.controlNeed * 20,
    };

    // Map work style
    const workStyle: WorkStyleAssessment = {
        gradeExpectation:
            response.gradeExpectation === "Pass"
                ? "passing"
                : (response.gradeExpectation as "A" | "B+" | "B"),
        deadlineStyle:
            response.internalDeadline === "Early"
                ? "early"
                : response.internalDeadline === "OnTime"
                  ? "ontime"
                  : response.internalDeadline === "Late"
                    ? "lastminute"
                    : "pressure",
        vagueTaskResponse:
            response.ambiguityApproach === "Initiative"
                ? "initiative"
                : response.ambiguityApproach === "Propose"
                  ? "propose"
                  : response.ambiguityApproach === "Wait"
                    ? "wait"
                    : "askInstructor",
        missingWorkResponse:
            response.teamResponsiveness === "Immediate"
                ? "doIt"
                : response.teamResponsiveness === "Friendly"
                  ? "checkIn"
                  : response.teamResponsiveness === "Wait"
                    ? "wait"
                    : "alert",
        teamRole: response.contributionStyle.toLowerCase() as TeamRole,
    };

    // Map availability grid - need to lowercase keys
    const availabilityGrid: AvailabilityGrid = {
        monday: response.availabilityGrid["Monday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        tuesday: response.availabilityGrid["Tuesday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        wednesday: response.availabilityGrid["Wednesday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        thursday: response.availabilityGrid["Thursday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        friday: response.availabilityGrid["Friday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        saturday: response.availabilityGrid["Saturday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
        sunday: response.availabilityGrid["Sunday"] || {
            morning: false,
            afternoon: false,
            evening: false,
        },
    };

    // Map schedule commitments
    const commitments: ScheduleCommitments = {
        works20PlusHours: response.scheduleFullness.includes("Works 20+ hours/week"),
        familyCaregiver: response.scheduleFullness.includes("Family caregiver"),
        intensiveSportsClubs: response.scheduleFullness.includes("Intensive sports/clubs"),
        longCommute: response.scheduleFullness.includes("Long commute"),
        scheduleClear: response.scheduleFullness.includes("Schedule is clear"),
    };

    // Map scheduling
    const scheduling: SchedulingAssessment = {
        responseTime:
            response.responseTime === "1-2hrs"
                ? "1-2hours"
                : response.responseTime === "SameDay"
                  ? "sameDay"
                  : response.responseTime === "24hrs"
                    ? "24hours"
                    : "fewDays",
        meetingFormat:
            response.meetingFormat === "InPerson"
                ? "inPerson"
                : response.meetingFormat === "Hybrid"
                  ? "hybrid"
                  : response.meetingFormat === "VideoOnly"
                    ? "video"
                    : "async",
        commitments,
        availabilityGrid,
        flexibility:
            response.scheduleFlexibility === "Very"
                ? "very"
                : response.scheduleFlexibility === "Somewhat"
                  ? "somewhat"
                  : "notAtAll",
    };

    // Calculate hours per week from availability grid
    let totalSlots = 0;
    for (const day of Object.values(availabilityGrid)) {
        if (day.morning) totalSlots++;
        if (day.afternoon) totalSlots++;
        if (day.evening) totalSlots++;
    }
    const hoursPerWeek = totalSlots * 3; // ~3 hours per slot

    // Create quiz result object
    const quizResult: CompatibilityQuizResult = {
        personality,
        workStyle,
        scheduling,
        bigFiveScores,
    };

    // Save to database
    await supabase
        .from("freelancer_profiles")
        .update({
            quiz_result: quizResult,
            personality: response.personalityScores,
            hours_per_week: hoursPerWeek,
            onboarding_complete: true,
        })
        .eq("user_id", response.userId);

    return { success: true };
}

// ============ PROJECTS ============

export async function getProjects(): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*");
    if (error || !data) return [];
    return data.map(mapProjectFromDb);
}

export async function getOpenProjects(): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("is_open", true);
    if (error || !data) return [];
    return data.map(mapProjectFromDb);
}

export async function getProject(projectId: string): Promise<Project | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
    if (error || !data) return null;
    return mapProjectFromDb(data);
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("client_id", clientId);
    if (error || !data) return [];
    return data.map(mapProjectFromDb);
}

export async function createProject(
    clientId: string,
    projectData: {
        title: string;
        description: string;
        requiredSkills: string[];
        teamSize: number;
        dueDate: string;
        isOpen: boolean;
        jobType?: JobType;
        experienceLevel?: ExperienceLevel;
        paymentType?: PaymentType;
        paymentAmount?: number;
        paymentMax?: number;
        workLocation?: WorkLocation;
        location?: string;
        estimatedDuration?: string;
        responsibilities?: string[];
        requirements?: string[];
        benefits?: string[];
    },
): Promise<Project> {
    const supabase = await createClient();
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

    if (error || !data) throw new Error(error?.message || "Failed to create project");
    return mapProjectFromDb(data);
}

export async function updateProject(
    projectId: string,
    updates: Partial<{
        title: string;
        description: string;
        requiredSkills: string[];
        teamSize: number;
        dueDate: string;
        isOpen: boolean;
        jobType?: JobType;
        experienceLevel?: ExperienceLevel;
        paymentType?: PaymentType;
        paymentAmount?: number;
        paymentMax?: number;
        workLocation?: WorkLocation;
        location?: string;
        estimatedDuration?: string;
        responsibilities?: string[];
        requirements?: string[];
        benefits?: string[];
    }>,
): Promise<Project | null> {
    const supabase = await createClient();

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

    const { error } = await supabase.from("projects").update(dbUpdates).eq("id", projectId);

    if (error) return null;
    return getProject(projectId);
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    return !error;
}

function mapProjectFromDb(data: Record<string, unknown>): Project {
    return {
        id: data.id as string,
        clientId: data.client_id as string,
        title: data.title as string,
        description: data.description as string,
        requiredSkills: (data.required_skills as string[]) || [],
        teamSize: data.team_size as number,
        dueDate: data.due_date as string,
        joinCode: data.join_code as string,
        isOpen: data.is_open as boolean,
        createdAt: ((data.created_at as string) || new Date().toISOString()).split("T")[0],
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

function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ============ APPLICATIONS ============

export async function applyToProject(
    freelancerId: string,
    projectId: string,
): Promise<Application> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("applications")
        .insert({
            project_id: projectId,
            freelancer_id: freelancerId,
        })
        .select()
        .single();

    if (error || !data) throw new Error(error?.message || "Failed to apply");

    return {
        id: data.id,
        projectId: data.project_id,
        freelancerId: data.freelancer_id,
        appliedAt: data.applied_at,
    };
}

export async function getProjectApplications(projectId: string): Promise<Application[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("project_id", projectId);

    if (error || !data) return [];

    return data.map((a: any) => ({
        id: a.id,
        projectId: a.project_id,
        freelancerId: a.freelancer_id,
        appliedAt: a.applied_at,
    }));
}

export async function getFreelancerApplications(freelancerId: string): Promise<Application[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("freelancer_id", freelancerId);

    if (error || !data) return [];

    return data.map((a: any) => ({
        id: a.id,
        projectId: a.project_id,
        freelancerId: a.freelancer_id,
        appliedAt: a.applied_at,
    }));
}

export async function hasApplied(freelancerId: string, projectId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("applications")
        .select("id")
        .eq("project_id", projectId)
        .eq("freelancer_id", freelancerId)
        .single();

    return !!data;
}

// ============ COMPATIBILITY ============

export async function getProjectCompatibility(
    freelancerId: string,
    projectId: string,
): Promise<number> {
    const profile = await getFreelancerProfile(freelancerId);
    const project = await getProject(projectId);
    if (!profile || !project) return 0;

    const { computeProjectCompatibility } = await import("./compatibility");
    return computeProjectCompatibility(profile, project);
}

/**
 * Check if AI compatibility is enabled
 */
export async function isAICompatibilityEnabled(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
}

export async function getProjectsWithCompatibility(
    freelancerId: string,
    useAI: boolean = false,
): Promise<
    {
        project: Project;
        compatibility: number;
        aiReasoning?: string;
        strengths?: string[];
        concerns?: string[];
    }[]
> {
    const profile = await getFreelancerProfile(freelancerId);
    if (!profile) return [];

    const openProjects = await getOpenProjects();
    const user = await getUser(freelancerId);
    const freelancerName = user?.name || "Freelancer";

    // Check if we should use AI
    const aiEnabled = useAI && !!process.env.OPENAI_API_KEY;

    if (aiEnabled) {
        const { computeProjectCompatibilityAI } = await import("./ai-compatibility");

        // Process in parallel but limit concurrency
        const results = await Promise.all(
            openProjects.map(async (project) => {
                try {
                    const aiResult = await computeProjectCompatibilityAI(
                        profile,
                        project,
                        freelancerName,
                    );
                    return {
                        project,
                        compatibility: aiResult.score,
                        aiReasoning: aiResult.reasoning,
                        strengths: aiResult.strengths,
                        concerns: aiResult.concerns,
                    };
                } catch (error) {
                    // Fallback to algorithmic on error
                    const { computeProjectCompatibility } = await import("./compatibility");
                    return {
                        project,
                        compatibility: computeProjectCompatibility(profile, project),
                    };
                }
            }),
        );
        return results;
    }

    // Use algorithmic compatibility
    const { computeProjectCompatibility } = await import("./compatibility");
    return openProjects.map((project) => ({
        project,
        compatibility: computeProjectCompatibility(profile, project),
    }));
}

export async function getRankedCandidates(projectId: string, useAI: boolean = false) {
    const project = await getProject(projectId);
    if (!project) return [];

    const projectApps = await getProjectApplications(projectId);
    const candidateIds = projectApps.map((a) => a.freelancerId);

    // Get all profiles and user info for candidates
    const profiles = await Promise.all(candidateIds.map((id) => getFreelancerProfile(id)));
    const users = await Promise.all(candidateIds.map((id) => getUser(id)));

    const profileMap = new Map<string, FreelancerProfile>();
    const nameMap = new Map<string, string>();
    profiles.forEach((p, i) => {
        if (p) profileMap.set(candidateIds[i], p);
    });
    users.forEach((u, i) => {
        if (u) nameMap.set(candidateIds[i], u.name);
    });

    const group = await getProjectGroup(projectId);
    const existingMembers = group?.members || [];

    // Get existing member profiles and names
    const memberProfiles = await Promise.all(existingMembers.map((id) => getFreelancerProfile(id)));
    const memberUsers = await Promise.all(existingMembers.map((id) => getUser(id)));
    const memberProfileMap = new Map<string, FreelancerProfile>();
    const memberNameMap = new Map<string, string>();
    memberProfiles.forEach((p, i) => {
        if (p) memberProfileMap.set(existingMembers[i], p);
    });
    memberUsers.forEach((u, i) => {
        if (u) memberNameMap.set(existingMembers[i], u.name);
    });

    // Check if we should use AI
    const aiEnabled = useAI && !!process.env.OPENAI_API_KEY;

    if (aiEnabled) {
        try {
            const { rankCandidatesAI } = await import("./ai-compatibility");

            // Prepare candidates for AI
            const candidates = candidateIds
                .filter((id) => profileMap.has(id))
                .map((id) => ({
                    profile: profileMap.get(id)!,
                    name: nameMap.get(id) || "Candidate",
                    userId: id,
                }));

            // Prepare existing members for AI
            const existingMemberData = existingMembers
                .filter((id) => memberProfileMap.has(id))
                .map((id) => ({
                    profile: memberProfileMap.get(id)!,
                    name: memberNameMap.get(id) || "Team Member",
                }));

            const aiRankings = await rankCandidatesAI(candidates, project, existingMemberData);

            return aiRankings.map((r) => ({
                freelancerId: r.freelancerId,
                projectScore: r.score,
                avgMemberScore: r.score, // AI considers both in its score
                totalScore: r.score,
                aiReasoning: r.reasoning,
                strengths: r.strengths,
                concerns: r.concerns,
            }));
        } catch (error) {
            console.error("AI ranking failed, falling back to algorithm:", error);
        }
    }

    // Fallback to algorithmic ranking
    const { computeProjectCompatibility, computeFreelancerCompatibility } =
        await import("./compatibility");

    const results: {
        freelancerId: string;
        projectScore: number;
        avgMemberScore: number;
        totalScore: number;
    }[] = [];

    for (const candidateId of candidateIds) {
        const profile = profileMap.get(candidateId);
        if (!profile) continue;

        const projectScore = computeProjectCompatibility(profile, project);

        let memberScoreSum = 0;
        let memberCount = 0;

        for (const memberId of existingMembers) {
            const memberProfile = memberProfileMap.get(memberId);
            if (memberProfile) {
                memberScoreSum += computeFreelancerCompatibility(profile, memberProfile);
                memberCount++;
            }
        }

        const avgMemberScore = memberCount > 0 ? Math.round(memberScoreSum / memberCount) : 100;
        const totalScore = Math.round(projectScore * 0.6 + avgMemberScore * 0.4);

        results.push({
            freelancerId: candidateId,
            projectScore,
            avgMemberScore,
            totalScore,
        });
    }

    return results.sort((a, b) => b.totalScore - a.totalScore);
}

export async function getTeamSuggestions(projectId: string, useAI: boolean = false) {
    const project = await getProject(projectId);
    if (!project) return [];

    const projectApps = await getProjectApplications(projectId);
    const candidateIds = projectApps.map((a) => a.freelancerId);

    // Get all profiles and user info
    const profiles = await Promise.all(candidateIds.map((id) => getFreelancerProfile(id)));
    const users = await Promise.all(candidateIds.map((id) => getUser(id)));

    const profileMap = new Map<string, FreelancerProfile>();
    const nameMap = new Map<string, string>();
    profiles.forEach((p, i) => {
        if (p) profileMap.set(candidateIds[i], p);
    });
    users.forEach((u, i) => {
        if (u) nameMap.set(candidateIds[i], u.name);
    });

    const teamSize = project.teamSize;
    if (candidateIds.length < teamSize) {
        return candidateIds.length > 0 ? [{ members: candidateIds, avgScore: 50 }] : [];
    }

    // Check if we should use AI
    const aiEnabled = useAI && !!process.env.OPENAI_API_KEY;

    if (aiEnabled) {
        try {
            const { suggestTeamCombinationsAI } = await import("./ai-compatibility");

            // Prepare candidates for AI
            const candidates = candidateIds
                .filter((id) => profileMap.has(id))
                .map((id) => ({
                    profile: profileMap.get(id)!,
                    name: nameMap.get(id) || "Candidate",
                    userId: id,
                }));

            const aiSuggestions = await suggestTeamCombinationsAI(candidates, project, teamSize);

            return aiSuggestions.map((s) => ({
                members: s.members,
                avgScore: s.avgScore,
                aiReasoning: s.reasoning,
                teamStrengths: s.teamStrengths,
            }));
        } catch (error) {
            console.error("AI team suggestions failed, falling back to algorithm:", error);
        }
    }

    // Fallback to algorithmic team suggestions
    const { computeProjectCompatibility, computeFreelancerCompatibility } =
        await import("./compatibility");

    const combinations: { members: string[]; avgScore: number }[] = [];

    function generateCombinations(
        arr: string[],
        size: number,
        start = 0,
        current: string[] = [],
        results: string[][] = [],
    ): string[][] {
        if (results.length >= 50) return results;
        if (current.length === size) {
            results.push([...current]);
            return results;
        }
        for (let i = start; i <= arr.length - (size - current.length); i++) {
            if (results.length >= 50) break;
            current.push(arr[i]);
            generateCombinations(arr, size, i + 1, current, results);
            current.pop();
        }
        return results;
    }

    const allCombos = generateCombinations(candidateIds, teamSize);

    for (const combo of allCombos) {
        let totalCompatibility = 0;
        let pairCount = 0;

        for (let i = 0; i < combo.length; i++) {
            const p1 = profileMap.get(combo[i]);
            if (!p1) continue;

            totalCompatibility += computeProjectCompatibility(p1, project);
            pairCount++;

            for (let j = i + 1; j < combo.length; j++) {
                const p2 = profileMap.get(combo[j]);
                if (!p2) continue;
                totalCompatibility += computeFreelancerCompatibility(p1, p2);
                pairCount++;
            }
        }

        const avgScore = pairCount > 0 ? Math.round(totalCompatibility / pairCount) : 0;
        combinations.push({ members: combo, avgScore });
    }

    return combinations.sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
}

/**
 * Get AI-powered insights for a formed team
 */
export async function getTeamInsights(groupId: string) {
    const group = await getGroup(groupId);
    if (!group) return null;

    const project = await getProject(group.projectId);
    if (!project) return null;

    // Get member profiles and names
    const profiles = await Promise.all(group.members.map((id) => getFreelancerProfile(id)));
    const users = await Promise.all(group.members.map((id) => getUser(id)));

    const members = group.members
        .map((id, i) => ({
            profile: profiles[i],
            name: users[i]?.name || "Team Member",
        }))
        .filter((m) => m.profile) as { profile: FreelancerProfile; name: string }[];

    // Check if AI is enabled
    if (!process.env.OPENAI_API_KEY) {
        return {
            overallCompatibility: 75,
            teamStrengths: ["Team assembled and ready to collaborate"],
            potentialChallenges: ["AI insights not available - add OPENAI_API_KEY to enable"],
            recommendations: ["Hold a kickoff meeting to align on goals"],
            roleAssignments: members.map((m) => ({
                name: m.name,
                suggestedRole: "Team Member",
                reasoning: "Role to be determined by team",
            })),
        };
    }

    try {
        const { getTeamInsightsAI } = await import("./ai-compatibility");
        return await getTeamInsightsAI(members, project);
    } catch (error) {
        console.error("AI team insights failed:", error);
        return null;
    }
}

// ============ GROUPS ============

export async function getGroup(groupId: string): Promise<Group | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).single();

    if (error || !data) return null;

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members || [],
        status: data.status as GroupStatus,
    };
}

export async function getProjectGroup(projectId: string): Promise<Group | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("project_id", projectId)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members || [],
        status: data.status as GroupStatus,
    };
}

export async function getFreelancerGroups(freelancerId: string): Promise<Group[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .contains("members", [freelancerId]);

    if (error || !data) return [];

    return data.map((g: any) => ({
        id: g.id,
        projectId: g.project_id,
        members: g.members || [],
        status: g.status as GroupStatus,
    }));
}

export async function createGroup(projectId: string, memberIds: string[]): Promise<Group> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("groups")
        .insert({
            project_id: projectId,
            members: memberIds,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (error || !data) throw new Error(error?.message || "Failed to create group");

    // Close the project
    await supabase.from("projects").update({ is_open: false }).eq("id", projectId);

    // Generate tasks
    const project = await getProject(projectId);
    if (project) {
        const generatedTasks = assignTasksToTeam(
            data.id,
            memberIds,
            project.title,
            project.requiredSkills,
        );

        for (const task of generatedTasks) {
            await supabase.from("tasks").insert({
                group_id: task.groupId,
                title: task.title,
                description: task.description,
                assigned_to: task.assignedTo,
                completed: task.completed,
            });
        }
    }

    return {
        id: data.id,
        projectId: data.project_id,
        members: data.members,
        status: data.status as GroupStatus,
    };
}

export async function computeGroupStatus(group: Group, project: Project): Promise<GroupStatus> {
    const now = new Date();
    const dueDate = new Date(project.dueDate);
    const openPeriodEnd = new Date(dueDate);
    openPeriodEnd.setDate(openPeriodEnd.getDate() + 7);

    if (now < dueDate) return "ACTIVE";
    if (now < openPeriodEnd) return "OPEN";
    return "CLOSED";
}

// ============ TASKS ============

export async function getGroupTasks(groupId: string): Promise<Task[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tasks").select("*").eq("group_id", groupId);

    if (error || !data) return [];

    return data.map((t: any) => ({
        id: t.id,
        groupId: t.group_id,
        title: t.title,
        description: t.description,
        assignedTo: t.assigned_to,
        completed: t.completed,
    }));
}

export async function updateTask(
    taskId: string,
    updates: Partial<Pick<Task, "completed" | "assignedTo">>,
): Promise<void> {
    const supabase = await createClient();

    const dbUpdates: Record<string, unknown> = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;

    await supabase.from("tasks").update(dbUpdates).eq("id", taskId);
}

// ============ CHAT ============

export async function getGroupMessages(groupId: string): Promise<ChatMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("timestamp", { ascending: true });

    if (error || !data) return [];

    return data.map((m: any) => ({
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
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("chat_messages")
        .insert({
            group_id: groupId,
            user_id: userId,
            message,
        })
        .select()
        .single();

    if (error || !data) throw new Error(error?.message || "Failed to send message");

    return {
        id: data.id,
        groupId: data.group_id,
        userId: data.user_id,
        message: data.message,
        timestamp: data.timestamp,
    };
}
