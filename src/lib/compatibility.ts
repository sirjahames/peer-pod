import { FreelancerProfile, Project, SkillEntry } from './types';
import { freelancerProfiles, ensureInitialized } from './data';

// Ensure data is initialized when this module is used
ensureInitialized();

const PERSONALITY_WEIGHT = 0.3;
const SKILL_WEIGHT = 0.5;
const AVAILABILITY_WEIGHT = 0.2;

/**
 * Compare two personality profiles (arrays of 20 numeric answers, 1-5 scale)
 * Returns a score from -40 to +40
 */
function computePersonalityScore(p1: number[], p2: number[]): number {
  let score = 0;
  for (let i = 0; i < 20; i++) {
    const diff = Math.abs((p1[i] || 3) - (p2[i] || 3));
    if (diff === 0) score += 2; // Strong similarity
    else if (diff === 1) score += 1; // Partial similarity
    else if (diff >= 3) score -= 2; // Strong conflict
    // diff === 2 is neutral (0)
  }
  return score;
}

/**
 * Normalize personality score to 0-100 range
 */
function normalizePersonalityScore(raw: number): number {
  // Raw range: -40 to +40
  return Math.round(((raw + 40) / 80) * 100);
}

/**
 * Compute skill match score between freelancer and project requirements
 */
function computeSkillScore(
  freelancerSkills: SkillEntry[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;

  let totalScore = 0;
  let matchedCount = 0;

  const skillMap = new Map(
    freelancerSkills.map((s) => [s.skill.toLowerCase(), s.proficiency])
  );

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
  const normalized =
    ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;

  return Math.max(0, Math.min(100, Math.round(normalized)));
}

/**
 * Compute availability overlap score
 * Higher hours = better, matching timezone = bonus
 */
function computeAvailabilityScore(
  hoursPerWeek: number,
  minRequired: number = 10
): number {
  if (hoursPerWeek >= 40) return 100;
  if (hoursPerWeek >= 30) return 85;
  if (hoursPerWeek >= 20) return 70;
  if (hoursPerWeek >= minRequired) return 50;
  return 25;
}

/**
 * Compute compatibility between a freelancer and a project
 */
export function computeProjectCompatibility(
  profile: FreelancerProfile,
  project: Project
): number {
  const skillScore = computeSkillScore(profile.skills, project.requiredSkills);
  const availScore = computeAvailabilityScore(profile.availability.hoursPerWeek);

  // Use a neutral personality baseline for project (middle of scale)
  const neutralPersonality = Array(20).fill(3);
  const personalityRaw = computePersonalityScore(
    profile.personality,
    neutralPersonality
  );
  const personalityScore = normalizePersonalityScore(personalityRaw);

  const total =
    personalityScore * PERSONALITY_WEIGHT +
    skillScore * SKILL_WEIGHT +
    availScore * AVAILABILITY_WEIGHT;

  return Math.round(total);
}

/**
 * Compute compatibility between two freelancers
 */
export function computeFreelancerCompatibility(
  profile1: FreelancerProfile,
  profile2: FreelancerProfile
): number {
  const personalityRaw = computePersonalityScore(
    profile1.personality,
    profile2.personality
  );
  const personalityScore = normalizePersonalityScore(personalityRaw);

  // Skill complementarity - reward having different skills
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

  // Slight penalty for too much overlap (diminishing returns)
  const complementScore = unique > overlap ? 80 : 60;

  // Availability overlap
  const hoursDiff = Math.abs(
    profile1.availability.hoursPerWeek - profile2.availability.hoursPerWeek
  );
  const availScore = hoursDiff < 10 ? 90 : hoursDiff < 20 ? 70 : 50;

  const total =
    personalityScore * 0.5 + complementScore * 0.3 + availScore * 0.2;

  return Math.round(total);
}

/**
 * Rank candidates for a project based on compatibility
 */
export function rankCandidates(
  projectId: string,
  candidateIds: string[],
  project: Project,
  existingMemberIds: string[] = []
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
    const profile = freelancerProfiles.get(candidateId);
    if (!profile) continue;

    const projectScore = computeProjectCompatibility(profile, project);

    // Compute average compatibility with existing members
    let memberScoreSum = 0;
    let memberCount = 0;

    for (const memberId of existingMemberIds) {
      const memberProfile = freelancerProfiles.get(memberId);
      if (memberProfile) {
        memberScoreSum += computeFreelancerCompatibility(profile, memberProfile);
        memberCount++;
      }
    }

    const avgMemberScore =
      memberCount > 0 ? Math.round(memberScoreSum / memberCount) : 100;

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
 */
export function suggestTeamCombinations(
  projectId: string,
  candidateIds: string[],
  project: Project,
  teamSize: number
): { members: string[]; avgScore: number }[] {
  if (candidateIds.length < teamSize) {
    return candidateIds.length > 0
      ? [{ members: candidateIds, avgScore: 50 }]
      : [];
  }

  const combinations: { members: string[]; avgScore: number }[] = [];

  // Generate combinations (limited to avoid combinatorial explosion)
  function generateCombinations(
    arr: string[],
    size: number,
    start = 0,
    current: string[] = [],
    results: string[][] = []
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
      const p1 = freelancerProfiles.get(combo[i]);
      if (!p1) continue;

      // Project compatibility
      totalCompatibility += computeProjectCompatibility(p1, project);
      pairCount++;

      for (let j = i + 1; j < combo.length; j++) {
        const p2 = freelancerProfiles.get(combo[j]);
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
