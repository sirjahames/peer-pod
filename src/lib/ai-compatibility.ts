  "use server";

import OpenAI from "openai";
import {
    FreelancerProfile,
    Project,
    CompatibilityQuizResult,
    BigFiveScores,
} from "./types";

// Initialize OpenAI client
function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    return new OpenAI({ apiKey });
}

// Check if AI is enabled
export async function isAIEnabled(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
}

interface CompatibilityResult {
    score: number; // 0-100
    reasoning: string;
    strengths: string[];
    concerns: string[];
    teamDynamicsInsight: string;
}

interface FreelancerRanking {
    freelancerId: string;
    score: number;
    reasoning: string;
    strengths: string[];
    concerns: string[];
}

/**
 * Format a freelancer profile for AI analysis
 */
function formatProfileForAI(profile: FreelancerProfile, name: string): string {
    const quiz = profile.quizResult;
    
    let profileText = `**${name}**\n`;
    profileText += `Skills: ${profile.skills.map(s => `${s.skill} (${s.proficiency}/5)`).join(", ")}\n`;
    profileText += `Availability: ${profile.availability.hoursPerWeek} hrs/week, Timezone: ${profile.availability.timezone}\n`;
    
    if (quiz) {
        // Big Five Personality
        if (quiz.bigFiveScores) {
            profileText += `\nPersonality (Big Five):\n`;
            profileText += `- Openness: ${quiz.bigFiveScores.openness}/100\n`;
            profileText += `- Conscientiousness: ${quiz.bigFiveScores.conscientiousness}/100\n`;
            profileText += `- Extraversion: ${quiz.bigFiveScores.extraversion}/100\n`;
            profileText += `- Agreeableness: ${quiz.bigFiveScores.agreeableness}/100\n`;
            profileText += `- Emotional Stability: ${100 - quiz.bigFiveScores.neuroticism}/100\n`;
        }
        
        // Work Style
        if (quiz.workStyle) {
            profileText += `\nWork Style:\n`;
            profileText += `- Grade Expectation: ${quiz.workStyle.gradeExpectation}\n`;
            profileText += `- Deadline Approach: ${quiz.workStyle.deadlineStyle}\n`;
            profileText += `- Response to Vague Tasks: ${quiz.workStyle.vagueTaskResponse}\n`;
            profileText += `- Team Role Preference: ${quiz.workStyle.teamRole}\n`;
        }
        
        // Scheduling
        if (quiz.scheduling) {
            profileText += `\nScheduling:\n`;
            profileText += `- Response Time: ${quiz.scheduling.responseTime}\n`;
            profileText += `- Meeting Preference: ${quiz.scheduling.meetingFormat}\n`;
            profileText += `- Schedule Flexibility: ${quiz.scheduling.flexibility}\n`;
        }
    }
    
    return profileText;
}

/**
 * Format a project for AI analysis
 */
function formatProjectForAI(project: Project): string {
    let projectText = `**${project.title}**\n`;
    projectText += `Description: ${project.description}\n`;
    projectText += `Required Skills: ${project.requiredSkills.join(", ")}\n`;
    projectText += `Team Size: ${project.teamSize}\n`;
    projectText += `Due Date: ${project.dueDate}\n`;
    
    if (project.jobType) projectText += `Job Type: ${project.jobType}\n`;
    if (project.experienceLevel) projectText += `Experience Level: ${project.experienceLevel}\n`;
    if (project.workLocation) projectText += `Work Location: ${project.workLocation}\n`;
    if (project.estimatedDuration) projectText += `Duration: ${project.estimatedDuration}\n`;
    
    if (project.responsibilities?.length) {
        projectText += `Responsibilities: ${project.responsibilities.join("; ")}\n`;
    }
    if (project.requirements?.length) {
        projectText += `Requirements: ${project.requirements.join("; ")}\n`;
    }
    
    return projectText;
}

/**
 * Use AI to compute compatibility between a freelancer and a project
 */
export async function computeProjectCompatibilityAI(
    profile: FreelancerProfile,
    project: Project,
    freelancerName: string = "Freelancer"
): Promise<CompatibilityResult> {
    const openai = getOpenAI();
    
    const systemPrompt = `You are an expert team formation analyst specializing in freelance team compatibility. 
Your job is to analyze how well a freelancer would fit a specific project based on their skills, personality, work style, and availability.

Consider these factors:
1. **Skill Match**: Do their skills align with project requirements?
2. **Personality Fit**: Will their Big Five personality traits work well for this type of project?
3. **Work Style Alignment**: Does their approach to deadlines, communication, and teamwork fit the project needs?
4. **Availability**: Can they commit the required time?
5. **Experience Level**: Does their proficiency match what's needed?

Provide your analysis as a JSON object with this exact structure:
{
    "score": <number 0-100>,
    "reasoning": "<2-3 sentence explanation>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "concerns": ["<concern 1>", "<concern 2>"],
    "teamDynamicsInsight": "<how they might contribute to team dynamics>"
}`;

    const userPrompt = `Analyze the compatibility between this freelancer and project:

## Freelancer Profile
${formatProfileForAI(profile, freelancerName)}

## Project
${formatProjectForAI(project)}

Provide your compatibility analysis as JSON.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const result = JSON.parse(content) as CompatibilityResult;
        
        // Ensure score is within bounds
        result.score = Math.max(0, Math.min(100, Math.round(result.score)));
        
        return result;
    } catch (error) {
        console.error("AI compatibility error:", error);
        // Fallback to a neutral score if AI fails
        return {
            score: 50,
            reasoning: "Unable to perform AI analysis. Using default compatibility score.",
            strengths: ["Skills partially match project requirements"],
            concerns: ["AI analysis unavailable"],
            teamDynamicsInsight: "Further analysis needed."
        };
    }
}

/**
 * Use AI to compute compatibility between two freelancers for team formation
 */
export async function computeFreelancerCompatibilityAI(
    profile1: FreelancerProfile,
    profile2: FreelancerProfile,
    name1: string = "Freelancer 1",
    name2: string = "Freelancer 2"
): Promise<CompatibilityResult> {
    const openai = getOpenAI();
    
    const systemPrompt = `You are an expert team formation analyst specializing in interpersonal compatibility for freelance teams.
Your job is to analyze how well two freelancers would work together based on their personalities, work styles, and schedules.

Consider these factors:
1. **Personality Complementarity**: Do their Big Five traits complement each other? (e.g., one leader + one supporter)
2. **Work Style Compatibility**: Are their approaches to deadlines, communication, and quality aligned?
3. **Schedule Overlap**: Can they collaborate effectively given their availability?
4. **Communication Styles**: Will they communicate well together?
5. **Conflict Potential**: Are there areas where they might clash?

Provide your analysis as a JSON object with this exact structure:
{
    "score": <number 0-100>,
    "reasoning": "<2-3 sentence explanation>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "concerns": ["<concern 1>", "<concern 2>"],
    "teamDynamicsInsight": "<how they would work together as a pair>"
}`;

    const userPrompt = `Analyze the compatibility between these two freelancers for team formation:

## Freelancer 1
${formatProfileForAI(profile1, name1)}

## Freelancer 2
${formatProfileForAI(profile2, name2)}

Provide your compatibility analysis as JSON.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const result = JSON.parse(content) as CompatibilityResult;
        result.score = Math.max(0, Math.min(100, Math.round(result.score)));
        
        return result;
    } catch (error) {
        console.error("AI compatibility error:", error);
        return {
            score: 50,
            reasoning: "Unable to perform AI analysis. Using default compatibility score.",
            strengths: ["Both are available for collaboration"],
            concerns: ["AI analysis unavailable"],
            teamDynamicsInsight: "Further analysis needed."
        };
    }
}

/**
 * Use AI to rank multiple candidates for a project
 */
export async function rankCandidatesAI(
    candidates: { profile: FreelancerProfile; name: string; userId: string }[],
    project: Project,
    existingMembers: { profile: FreelancerProfile; name: string }[] = []
): Promise<FreelancerRanking[]> {
    const openai = getOpenAI();
    
    const systemPrompt = `You are an expert team formation analyst. Your job is to rank freelance candidates for a project based on:
1. How well their skills match the project
2. How their personality would fit the team
3. Their work style and availability
4. How they would complement existing team members (if any)

Provide your ranking as a JSON object with this structure:
{
    "rankings": [
        {
            "candidateIndex": <0-based index>,
            "score": <number 0-100>,
            "reasoning": "<1-2 sentence explanation>",
            "strengths": ["<strength 1>", "<strength 2>"],
            "concerns": ["<concern if any>"]
        }
    ]
}

Rank from best fit (highest score) to worst fit (lowest score).`;

    let userPrompt = `Rank these candidates for the following project:\n\n`;
    userPrompt += `## Project\n${formatProjectForAI(project)}\n\n`;
    
    if (existingMembers.length > 0) {
        userPrompt += `## Existing Team Members\n`;
        existingMembers.forEach((m, i) => {
            userPrompt += formatProfileForAI(m.profile, m.name) + "\n";
        });
        userPrompt += "\n";
    }
    
    userPrompt += `## Candidates to Rank\n`;
    candidates.forEach((c, i) => {
        userPrompt += `### Candidate ${i + 1}\n`;
        userPrompt += formatProfileForAI(c.profile, c.name) + "\n";
    });
    
    userPrompt += "\nProvide your ranking as JSON.";

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const parsed = JSON.parse(content) as { 
            rankings: { candidateIndex: number; score: number; reasoning: string; strengths: string[]; concerns: string[] }[] 
        };
        
        // Map back to freelancer IDs
        return parsed.rankings.map(r => ({
            freelancerId: candidates[r.candidateIndex]?.userId || "",
            score: Math.max(0, Math.min(100, Math.round(r.score))),
            reasoning: r.reasoning,
            strengths: r.strengths || [],
            concerns: r.concerns || []
        })).filter(r => r.freelancerId);
        
    } catch (error) {
        console.error("AI ranking error:", error);
        // Fallback to equal scores
        return candidates.map(c => ({
            freelancerId: c.userId,
            score: 50,
            reasoning: "AI analysis unavailable",
            strengths: [],
            concerns: []
        }));
    }
}

/**
 * Use AI to suggest optimal team combinations
 */
export async function suggestTeamCombinationsAI(
    candidates: { profile: FreelancerProfile; name: string; userId: string }[],
    project: Project,
    teamSize: number
): Promise<{ members: string[]; avgScore: number; reasoning: string; teamStrengths: string[] }[]> {
    const openai = getOpenAI();
    
    if (candidates.length < teamSize) {
        return [{
            members: candidates.map(c => c.userId),
            avgScore: 50,
            reasoning: "Not enough candidates for full team",
            teamStrengths: []
        }];
    }
    
    const systemPrompt = `You are an expert team formation analyst. Your job is to suggest optimal team combinations from a pool of candidates.

Consider:
1. **Skill Coverage**: Does the team have all required skills?
2. **Personality Balance**: Is there a good mix of leaders, workers, and diplomats?
3. **Work Style Harmony**: Will they work well together given their styles?
4. **Schedule Compatibility**: Can they all collaborate effectively?
5. **Complementary Strengths**: Do members cover each other's weaknesses?

Suggest up to 3 optimal team combinations. Provide as JSON:
{
    "teams": [
        {
            "memberIndices": [<0-based indices>],
            "avgScore": <0-100>,
            "reasoning": "<why this team works well>",
            "teamStrengths": ["<strength 1>", "<strength 2>"]
        }
    ]
}`;

    let userPrompt = `Suggest optimal team combinations of ${teamSize} members for this project:\n\n`;
    userPrompt += `## Project\n${formatProjectForAI(project)}\n\n`;
    userPrompt += `## Available Candidates\n`;
    candidates.forEach((c, i) => {
        userPrompt += `### Candidate ${i + 1}\n`;
        userPrompt += formatProfileForAI(c.profile, c.name) + "\n";
    });
    
    userPrompt += "\nSuggest up to 3 optimal team combinations as JSON.";

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const parsed = JSON.parse(content) as {
            teams: { memberIndices: number[]; avgScore: number; reasoning: string; teamStrengths: string[] }[]
        };
        
        return parsed.teams.map(team => ({
            members: team.memberIndices.map(i => candidates[i]?.userId).filter(Boolean) as string[],
            avgScore: Math.max(0, Math.min(100, Math.round(team.avgScore))),
            reasoning: team.reasoning,
            teamStrengths: team.teamStrengths || []
        }));
        
    } catch (error) {
        console.error("AI team suggestion error:", error);
        // Fallback to first N candidates
        return [{
            members: candidates.slice(0, teamSize).map(c => c.userId),
            avgScore: 50,
            reasoning: "AI analysis unavailable - using first available candidates",
            teamStrengths: []
        }];
    }
}

/**
 * Get AI-powered team insights for an existing group
 */
export async function getTeamInsightsAI(
    members: { profile: FreelancerProfile; name: string }[],
    project: Project
): Promise<{
    overallCompatibility: number;
    teamStrengths: string[];
    potentialChallenges: string[];
    recommendations: string[];
    roleAssignments: { name: string; suggestedRole: string; reasoning: string }[];
}> {
    const openai = getOpenAI();
    
    const systemPrompt = `You are an expert team dynamics analyst. Analyze this formed team and provide insights.

Consider:
1. How well the team's combined skills cover project needs
2. Personality dynamics and potential conflicts
3. Work style alignment
4. Schedule compatibility
5. Suggested roles for each member based on their strengths

Provide as JSON:
{
    "overallCompatibility": <0-100>,
    "teamStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "potentialChallenges": ["<challenge 1>", "<challenge 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"],
    "roleAssignments": [
        {
            "name": "<member name>",
            "suggestedRole": "<e.g., Project Lead, Backend Developer, etc.>",
            "reasoning": "<why this role fits them>"
        }
    ]
}`;

    let userPrompt = `Analyze this team for the following project:\n\n`;
    userPrompt += `## Project\n${formatProjectForAI(project)}\n\n`;
    userPrompt += `## Team Members\n`;
    members.forEach((m, i) => {
        userPrompt += formatProfileForAI(m.profile, m.name) + "\n";
    });
    
    userPrompt += "\nProvide team insights as JSON.";

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const result = JSON.parse(content);
        result.overallCompatibility = Math.max(0, Math.min(100, Math.round(result.overallCompatibility)));
        
        return result;
    } catch (error) {
        console.error("AI team insights error:", error);
        return {
            overallCompatibility: 50,
            teamStrengths: ["Team assembled and ready to collaborate"],
            potentialChallenges: ["AI analysis unavailable"],
            recommendations: ["Hold a kickoff meeting to align on goals"],
            roleAssignments: members.map(m => ({
                name: m.name,
                suggestedRole: "Team Member",
                reasoning: "Role to be determined by team"
            }))
        };
    }
}
