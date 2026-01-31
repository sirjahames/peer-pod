import { Task, FreelancerProfile } from "./types";

// Helper function to generate IDs
function generateId(): string {
    return crypto.randomUUID();
}

interface TaskTemplate {
    title: string;
    description: string;
    preferredSkills: string[];
    preferredTraits: "leader" | "detail" | "creative" | "analytical" | "any";
}

/**
 * Generate tasks based on project requirements
 */
export function generateTasksForProject(
    projectTitle: string,
    requiredSkills: string[],
    teamSize: number,
): TaskTemplate[] {
    const tasks: TaskTemplate[] = [
        {
            title: "Project Setup & Architecture",
            description:
                "Set up the project structure, configure build tools, and establish coding standards.",
            preferredSkills: requiredSkills.slice(0, 1),
            preferredTraits: "leader",
        },
        {
            title: "Core Feature Implementation",
            description: "Implement the main functionality of the project.",
            preferredSkills: requiredSkills,
            preferredTraits: "analytical",
        },
        {
            title: "UI/UX Implementation",
            description: "Build user interface components and ensure good user experience.",
            preferredSkills: ["React", "CSS", "Figma"],
            preferredTraits: "creative",
        },
        {
            title: "Testing & Quality Assurance",
            description: "Write tests and ensure code quality across the project.",
            preferredSkills: requiredSkills,
            preferredTraits: "detail",
        },
        {
            title: "Documentation",
            description: "Create technical documentation and user guides.",
            preferredSkills: [],
            preferredTraits: "detail",
        },
        {
            title: "Integration & Deployment",
            description: "Integrate all components and prepare for deployment.",
            preferredSkills: ["Node.js", "DevOps", "Docker"],
            preferredTraits: "analytical",
        },
    ];

    // Return tasks proportional to team size
    return tasks.slice(0, Math.max(teamSize * 2, 3));
}

/**
 * Score a freelancer for a specific task
 */
function scoreFreelancerForTask(profile: FreelancerProfile, task: TaskTemplate): number {
    let score = 50; // Base score

    // Skill matching
    const freelancerSkills = profile.skills.map((s) => s.skill.toLowerCase());
    for (const reqSkill of task.preferredSkills) {
        const skillEntry = profile.skills.find(
            (s) => s.skill.toLowerCase() === reqSkill.toLowerCase(),
        );
        if (skillEntry) {
            score += skillEntry.proficiency * 5;
        }
    }

    // Personality trait matching (simplified - uses personality array indices)
    const traitIndexMap: Record<string, number[]> = {
        leader: [0, 4, 8], // Questions indicating leadership
        detail: [1, 5, 9], // Questions indicating attention to detail
        creative: [2, 6, 10], // Questions indicating creativity
        analytical: [3, 7, 11], // Questions indicating analytical thinking
        any: [],
    };

    const traitIndices = traitIndexMap[task.preferredTraits];
    for (const idx of traitIndices) {
        if (profile.personality[idx] >= 4) score += 5;
        else if (profile.personality[idx] <= 2) score -= 3;
    }

    // Availability bonus
    if (profile.availability.hoursPerWeek >= 30) score += 10;

    return Math.max(0, Math.min(100, score));
}

/**
 * Assign tasks to team members based on compatibility
 * Now accepts profiles as a Map parameter instead of using in-memory store
 */
export function assignTasksToTeam(
    groupId: string,
    memberIds: string[],
    projectTitle: string,
    requiredSkills: string[],
    profiles: Map<string, FreelancerProfile> = new Map(),
): Task[] {
    const templates = generateTasksForProject(projectTitle, requiredSkills, memberIds.length);

    const tasks: Task[] = [];
    const assignmentCounts: Map<string, number> = new Map();
    memberIds.forEach((id) => assignmentCounts.set(id, 0));

    for (const template of templates) {
        // Score each member for this task
        const scores: { memberId: string; score: number }[] = [];

        for (const memberId of memberIds) {
            const profile = profiles.get(memberId);
            if (!profile) continue;

            const score = scoreFreelancerForTask(profile, template);
            // Reduce score if already has many tasks
            const currentCount = assignmentCounts.get(memberId) || 0;
            const adjustedScore = score - currentCount * 15;

            scores.push({ memberId, score: adjustedScore });
        }

        // Sort by score and assign to best match
        scores.sort((a, b) => b.score - a.score);
        const assignee = scores[0]?.memberId || null;

        if (assignee) {
            assignmentCounts.set(assignee, (assignmentCounts.get(assignee) || 0) + 1);
        }

        tasks.push({
            id: generateId(),
            groupId,
            title: template.title,
            description: template.description,
            assignedTo: assignee,
            completed: false,
        });
    }

    return tasks;
}
