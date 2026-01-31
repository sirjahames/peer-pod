import { FreelancerProfile, Project, SkillEntry, BigFiveScores, WorkStyleAssessment, SchedulingAssessment, AvailabilityGrid } from "./types";

const PERSONALITY_WEIGHT = 0.25;
const WORK_STYLE_WEIGHT = 0.25;
const SKILL_WEIGHT = 0.30;
const AVAILABILITY_WEIGHT = 0.20;

/**
 * Compute Big Five personality compatibility between two profiles
 * Returns a score from 0 to 100
 */
function computeBigFiveCompatibility(scores1: BigFiveScores, scores2: BigFiveScores): number {
    // For team compatibility, we look for:
    // - Similar conscientiousness (work ethic alignment)
    // - Complementary extraversion (balanced team dynamics)
    // - Similar agreeableness (conflict avoidance)
    // - Lower combined neuroticism (stability)
    // - Complementary openness (diverse perspectives)
    
    const conscientiousnessMatch = 100 - Math.abs(scores1.conscientiousness - scores2.conscientiousness);
    const agreeablenessMatch = 100 - Math.abs(scores1.agreeableness - scores2.agreeableness);
    
    // Complementary extraversion is good - one introvert + one extrovert works well
    const extraversionComplement = 50 + (100 - Math.abs((scores1.extraversion + scores2.extraversion) - 100)) / 2;
    
    // Lower combined neuroticism is better
    const stabilityScore = 100 - ((scores1.neuroticism + scores2.neuroticism) / 2);
    
    // Some diversity in openness is good
    const opennessBalance = 50 + (100 - Math.abs((scores1.openness + scores2.openness) - 100)) / 4;
    
    return Math.round(
        conscientiousnessMatch * 0.3 +
        agreeablenessMatch * 0.25 +
        extraversionComplement * 0.2 +
        stabilityScore * 0.15 +
        opennessBalance * 0.1
    );
}

/**
 * Compute work style compatibility between two profiles
 * Returns a score from 0 to 100
 */
function computeWorkStyleCompatibility(ws1: WorkStyleAssessment, ws2: WorkStyleAssessment): number {
    let score = 0;
    
    // Grade expectation alignment (very important)
    const gradeOrder = ['A', 'B+', 'B', 'passing'];
    const gradeDiff = Math.abs(gradeOrder.indexOf(ws1.gradeExpectation) - gradeOrder.indexOf(ws2.gradeExpectation));
    score += gradeDiff === 0 ? 30 : gradeDiff === 1 ? 20 : gradeDiff === 2 ? 10 : 0;
    
    // Deadline style alignment
    const deadlineOrder = ['early', 'ontime', 'lastminute', 'pressure'];
    const deadlineDiff = Math.abs(deadlineOrder.indexOf(ws1.deadlineStyle) - deadlineOrder.indexOf(ws2.deadlineStyle));
    score += deadlineDiff === 0 ? 25 : deadlineDiff === 1 ? 15 : deadlineDiff === 2 ? 5 : 0;
    
    // Team role complementarity (different roles work better together)
    const roles = [ws1.teamRole, ws2.teamRole];
    if (roles.includes('leader') && roles.includes('workhorse')) score += 20;
    else if (roles.includes('leader') && roles.includes('diplomat')) score += 18;
    else if (roles.includes('workhorse') && roles.includes('diplomat')) score += 16;
    else if (roles.includes('specialist')) score += 12;
    else if (ws1.teamRole === ws2.teamRole) score += 8; // Same role is less ideal
    else score += 14;
    
    // Vague task response compatibility
    if (ws1.vagueTaskResponse === ws2.vagueTaskResponse) score += 10;
    else if (
        (ws1.vagueTaskResponse === 'initiative' && ws2.vagueTaskResponse === 'wait') ||
        (ws1.vagueTaskResponse === 'wait' && ws2.vagueTaskResponse === 'initiative')
    ) score += 12; // Complementary styles
    else score += 6;
    
    // Missing work response
    if (ws1.missingWorkResponse === ws2.missingWorkResponse) score += 15;
    else if (
        (ws1.missingWorkResponse === 'checkIn' || ws2.missingWorkResponse === 'checkIn')
    ) score += 10;
    else score += 5;
    
    return Math.min(100, score);
}

/**
 * Compute scheduling compatibility between two profiles
 * Returns a score from 0 to 100
 */
function computeSchedulingCompatibility(sched1: SchedulingAssessment, sched2: SchedulingAssessment): number {
    let score = 0;
    
    // Response time alignment
    const responseOrder = ['1-2hours', 'sameDay', '24hours', 'fewDays'];
    const responseDiff = Math.abs(responseOrder.indexOf(sched1.responseTime) - responseOrder.indexOf(sched2.responseTime));
    score += responseDiff === 0 ? 20 : responseDiff === 1 ? 15 : responseDiff === 2 ? 8 : 0;
    
    // Meeting format compatibility
    if (sched1.meetingFormat === sched2.meetingFormat) score += 15;
    else if (
        (sched1.meetingFormat === 'hybrid' || sched2.meetingFormat === 'hybrid')
    ) score += 10;
    else if (
        (sched1.meetingFormat === 'async' && sched2.meetingFormat === 'video') ||
        (sched1.meetingFormat === 'video' && sched2.meetingFormat === 'async')
    ) score += 5;
    else score += 3;
    
    // Availability grid overlap
    const grid1 = sched1.availabilityGrid;
    const grid2 = sched2.availabilityGrid;
    let overlapCount = 0;
    let totalSlots = 0;
    
    const days: (keyof AvailabilityGrid)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const times: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
    
    for (const day of days) {
        for (const time of times) {
            if (grid1[day][time] && grid2[day][time]) {
                overlapCount++;
            }
            if (grid1[day][time] || grid2[day][time]) {
                totalSlots++;
            }
        }
    }
    
    const overlapScore = totalSlots > 0 ? (overlapCount / Math.max(totalSlots / 2, 1)) * 40 : 20;
    score += Math.min(40, overlapScore);
    
    // Flexibility alignment
    if (sched1.flexibility === sched2.flexibility) score += 15;
    else if (
        (sched1.flexibility === 'very' || sched2.flexibility === 'very')
    ) score += 10;
    else score += 5;
    
    // Commitment compatibility (busy people should work with busy people)
    const busy1 = Object.values(sched1.commitments).filter(v => v && !sched1.commitments.scheduleClear).length;
    const busy2 = Object.values(sched2.commitments).filter(v => v && !sched2.commitments.scheduleClear).length;
    const busyDiff = Math.abs(busy1 - busy2);
    score += busyDiff === 0 ? 10 : busyDiff === 1 ? 7 : 3;
    
    return Math.min(100, score);
}

/**
 * Compare two personality profiles (arrays of numeric answers, 1-5 scale)
 * Legacy support for profiles without full quiz data
 */
function computePersonalityScore(p1: number[], p2: number[]): number {
    let score = 0;
    const len = Math.min(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
        const diff = Math.abs((p1[i] || 3) - (p2[i] || 3));
        if (diff === 0)
            score += 2;
        else if (diff === 1)
            score += 1;
        else if (diff >= 3) score -= 2;
    }
    // Normalize based on actual length
    const maxScore = len * 2;
    const minScore = len * -2;
    return Math.round(((score - minScore) / (maxScore - minScore)) * 100);
}

/**
 * Compute skill match score between freelancer and project requirements
 */
function computeSkillScore(freelancerSkills: SkillEntry[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;

    let totalScore = 0;
    let matchedCount = 0;

    const skillMap = new Map(freelancerSkills.map((s) => [s.skill.toLowerCase(), s.proficiency]));

    for (const required of requiredSkills) {
        const proficiency = skillMap.get(required.toLowerCase());
        if (proficiency) {
            totalScore += proficiency * 20; // Max 100 per skill
            matchedCount++;
        } else {
            totalScore -= 30; // Penalty for missing skill
        }
    }

    // Normalize to 0-100
    const maxPossible = requiredSkills.length * 100;
    const minPossible = -requiredSkills.length * 30;
    const normalized = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;

    return Math.max(0, Math.min(100, Math.round(normalized)));
}

/**
 * Compute availability overlap score
 * Higher hours = better, matching timezone = bonus
 */
function computeAvailabilityScore(hoursPerWeek: number, minRequired: number = 10): number {
    if (hoursPerWeek >= 40) return 100;
    if (hoursPerWeek >= 30) return 85;
    if (hoursPerWeek >= 20) return 70;
    if (hoursPerWeek >= minRequired) return 50;
    return 25;
}

/**
 * Compute compatibility between a freelancer and a project
 */
export function computeProjectCompatibility(profile: FreelancerProfile, project: Project): number {
    const skillScore = computeSkillScore(profile.skills, project.requiredSkills);
    const availScore = computeAvailabilityScore(profile.availability.hoursPerWeek);

    // If we have the new quiz data, use Big Five scores
    if (profile.quizResult?.bigFiveScores) {
        const bf = profile.quizResult.bigFiveScores;
        // For project fit, we value conscientiousness, low neuroticism, and balanced openness
        const personalityScore = Math.round(
            bf.conscientiousness * 0.4 +
            (100 - bf.neuroticism) * 0.3 +
            bf.openness * 0.2 +
            bf.agreeableness * 0.1
        );
        
        // Also consider work style for project fit
        let workStyleBonus = 0;
        const ws = profile.quizResult.workStyle;
        if (ws.gradeExpectation === 'A') workStyleBonus += 15;
        else if (ws.gradeExpectation === 'B+') workStyleBonus += 10;
        if (ws.deadlineStyle === 'early') workStyleBonus += 10;
        else if (ws.deadlineStyle === 'ontime') workStyleBonus += 7;
        
        const total =
            personalityScore * PERSONALITY_WEIGHT +
            workStyleBonus * WORK_STYLE_WEIGHT +
            skillScore * SKILL_WEIGHT +
            availScore * AVAILABILITY_WEIGHT;
        
        return Math.min(100, Math.round(total));
    }

    // Legacy fallback for profiles without quiz data
    const neutralPersonality = Array(profile.personality.length || 9).fill(3);
    const personalityScore = computePersonalityScore(profile.personality, neutralPersonality);

    const total =
        personalityScore * PERSONALITY_WEIGHT +
        skillScore * SKILL_WEIGHT +
        availScore * AVAILABILITY_WEIGHT;

    return Math.round(total);
}

/**
 * Compute compatibility between two freelancers
 * Uses comprehensive quiz data when available
 */
export function computeFreelancerCompatibility(
    profile1: FreelancerProfile,
    profile2: FreelancerProfile,
): number {
    // Check if both profiles have the new quiz data
    const hasQuizData1 = profile1.quizResult?.bigFiveScores && profile1.quizResult.workStyle && profile1.quizResult.scheduling;
    const hasQuizData2 = profile2.quizResult?.bigFiveScores && profile2.quizResult.workStyle && profile2.quizResult.scheduling;
    
    if (hasQuizData1 && hasQuizData2) {
        // Use comprehensive compatibility scoring
        const bigFiveScore = computeBigFiveCompatibility(
            profile1.quizResult!.bigFiveScores,
            profile2.quizResult!.bigFiveScores
        );
        
        const workStyleScore = computeWorkStyleCompatibility(
            profile1.quizResult!.workStyle,
            profile2.quizResult!.workStyle
        );
        
        const schedulingScore = computeSchedulingCompatibility(
            profile1.quizResult!.scheduling,
            profile2.quizResult!.scheduling
        );
        
        // Skill complementarity
        const skills1 = new Set(profile1.skills.map((s) => s.skill.toLowerCase()));
        const skills2 = new Set(profile2.skills.map((s) => s.skill.toLowerCase()));
        
        let overlap = 0;
        let unique = 0;
        skills1.forEach((s) => {
            if (skills2.has(s)) overlap++;
            else unique++;
        });
        skills2.forEach((s) => {
            if (!skills1.has(s)) unique++;
        });
        
        // Different skills are good for teams
        const skillComplementScore = unique >= overlap ? 85 : 70;
        
        // Weighted total - prioritize work style and scheduling for team compatibility
        const total = 
            bigFiveScore * 0.25 +
            workStyleScore * 0.35 +
            schedulingScore * 0.25 +
            skillComplementScore * 0.15;
        
        return Math.round(total);
    }
    
    // Legacy fallback
    const personalityScore = computePersonalityScore(profile1.personality, profile2.personality);

    // Skill complementarity
    const skills1 = new Set(profile1.skills.map((s) => s.skill.toLowerCase()));
    const skills2 = new Set(profile2.skills.map((s) => s.skill.toLowerCase()));

    let overlap = 0;
    let unique = 0;
    skills1.forEach((s) => {
        if (skills2.has(s)) overlap++;
        else unique++;
    });
    skills2.forEach((s) => {
        if (!skills1.has(s)) unique++;
    });

    const complementScore = unique > overlap ? 80 : 60;

    // Availability overlap
    const hoursDiff = Math.abs(
        profile1.availability.hoursPerWeek - profile2.availability.hoursPerWeek,
    );
    const availScore = hoursDiff < 10 ? 90 : hoursDiff < 20 ? 70 : 50;

    const total = personalityScore * 0.5 + complementScore * 0.3 + availScore * 0.2;

    return Math.round(total);
}

/**
 * Rank candidates for a project based on compatibility
 * Now accepts profiles as a Map parameter instead of using in-memory store
 */
export function rankCandidates(
    projectId: string,
    candidateIds: string[],
    project: Project,
    existingMemberIds: string[] = [],
    profiles: Map<string, FreelancerProfile> = new Map(),
): {
    freelancerId: string;
    projectScore: number;
    avgMemberScore: number;
    totalScore: number;
}[] {
    const results: {
        freelancerId: string;
        projectScore: number;
        avgMemberScore: number;
        totalScore: number;
    }[] = [];

    for (const candidateId of candidateIds) {
        const profile = profiles.get(candidateId);
        if (!profile) continue;

        const projectScore = computeProjectCompatibility(profile, project);

        // Compute average compatibility with existing members
        let memberScoreSum = 0;
        let memberCount = 0;

        for (const memberId of existingMemberIds) {
            const memberProfile = profiles.get(memberId);
            if (memberProfile) {
                memberScoreSum += computeFreelancerCompatibility(profile, memberProfile);
                memberCount++;
            }
        }

        const avgMemberScore = memberCount > 0 ? Math.round(memberScoreSum / memberCount) : 100;

        // Weighted combination
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

/**
 * Suggest optimal team combinations from candidates
 * Now accepts profiles as a Map parameter instead of using in-memory store
 */
export function suggestTeamCombinations(
    projectId: string,
    candidateIds: string[],
    project: Project,
    teamSize: number,
    profiles: Map<string, FreelancerProfile> = new Map(),
): { members: string[]; avgScore: number }[] {
    if (candidateIds.length < teamSize) {
        return candidateIds.length > 0 ? [{ members: candidateIds, avgScore: 50 }] : [];
    }

    const combinations: { members: string[]; avgScore: number }[] = [];

    // Generate combinations (limited to avoid combinatorial explosion)
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

        // Sum pairwise compatibility
        for (let i = 0; i < combo.length; i++) {
            const p1 = profiles.get(combo[i]);
            if (!p1) continue;

            // Project compatibility
            totalCompatibility += computeProjectCompatibility(p1, project);
            pairCount++;

            for (let j = i + 1; j < combo.length; j++) {
                const p2 = profiles.get(combo[j]);
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
