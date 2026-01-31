# PeerPod - AI Integration

## Overview

PeerPod uses **OpenAI GPT-4o-mini** to provide intelligent compatibility analysis beyond traditional algorithmic matching. The AI integration is optional and gracefully falls back to algorithmic matching when unavailable.

## Configuration

### Environment Variable
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Checking AI Availability
```typescript
import { isAICompatibilityEnabled } from '@/lib/actions';

const aiEnabled = await isAICompatibilityEnabled();
```

## AI Functions

All AI functions are in `src/lib/ai-compatibility.ts`.

### computeProjectCompatibilityAI()
Analyzes how well a freelancer fits a specific project.

**Input:**
- `profile: FreelancerProfile` - Freelancer's quiz results and skills
- `project: Project` - Project details and requirements
- `freelancerName: string` - For personalized analysis

**Output:**
```typescript
{
  score: number;           // 0-100 compatibility score
  reasoning: string;       // 2-3 sentence explanation
  strengths: string[];     // What makes them a good fit
  concerns: string[];      // Potential issues
  teamDynamicsInsight: string; // How they'd contribute
}
```

### computeFreelancerCompatibilityAI()
Analyzes how well two freelancers would work together.

**Input:**
- `profile1: FreelancerProfile` - First freelancer
- `profile2: FreelancerProfile` - Second freelancer
- `name1: string`, `name2: string` - Names for context

**Output:** Same structure as project compatibility.

### rankCandidatesAI()
Ranks multiple candidates for a project considering existing team.

**Input:**
- `candidates: { profile, name, userId }[]` - Candidates to rank
- `project: Project` - Target project
- `existingMembers: { profile, name }[]` - Current team (if any)

**Output:**
```typescript
{
  freelancerId: string;
  score: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
}[]
```

### suggestTeamCombinationsAI()
Suggests optimal team combinations from candidates.

**Input:**
- `candidates: { profile, name, userId }[]` - Available candidates
- `project: Project` - Target project
- `teamSize: number` - Desired team size

**Output:**
```typescript
{
  members: string[];      // User IDs
  avgScore: number;       // Team compatibility score
  reasoning: string;      // Why this team works
  teamStrengths: string[]; // Combined strengths
}[]
```

### getTeamInsightsAI()
Provides deep analysis of a formed team.

**Input:**
- `members: { profile, name }[]` - Team members
- `project: Project` - The project

**Output:**
```typescript
{
  overallCompatibility: number;  // 0-100
  teamStrengths: string[];       // What the team does well
  potentialChallenges: string[]; // Areas to watch
  recommendations: string[];     // Advice for the team
  roleAssignments: {
    name: string;
    suggestedRole: string;
    reasoning: string;
  }[];
}
```

## AI Model Configuration

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",           // Cost-effective model
  messages: [...],
  temperature: 0.3,               // Low for consistency
  response_format: { type: "json_object" }  // Structured output
});
```

### Why GPT-4o-mini?
- **Cost-effective** - ~10x cheaper than GPT-4
- **Fast** - Low latency for real-time scoring
- **Capable** - Sufficient for compatibility analysis
- **JSON mode** - Reliable structured responses

## Profile Formatting

Profiles are formatted for AI analysis:

```typescript
function formatProfileForAI(profile: FreelancerProfile, name: string): string {
  return `
**${name}**
Skills: React (5/5), TypeScript (4/5), Node.js (3/5)
Availability: 30 hrs/week, Timezone: UTC-5

Personality (Big Five):
- Openness: 75/100
- Conscientiousness: 80/100
- Extraversion: 60/100
- Agreeableness: 70/100
- Emotional Stability: 70/100

Work Style:
- Grade Expectation: A
- Deadline Approach: early
- Response to Vague Tasks: initiative
- Team Role Preference: leader

Scheduling:
- Response Time: sameDay
- Meeting Preference: hybrid
- Schedule Flexibility: somewhat
  `;
}
```

## System Prompts

### Project Compatibility Prompt
```
You are an expert team formation analyst specializing in freelance team compatibility.
Your job is to analyze how well a freelancer would fit a specific project based on their skills, personality, work style, and availability.

Consider these factors:
1. Skill Match: Do their skills align with project requirements?
2. Personality Fit: Will their Big Five personality traits work well?
3. Work Style Alignment: Does their approach match project needs?
4. Availability: Can they commit the required time?
5. Experience Level: Does their proficiency match what's needed?

Provide your analysis as a JSON object...
```

### Team Compatibility Prompt
```
You are an expert team formation analyst specializing in interpersonal compatibility.
Your job is to analyze how well two freelancers would work together.

Consider these factors:
1. Personality Complementarity: Do traits complement each other?
2. Work Style Compatibility: Are approaches aligned?
3. Schedule Overlap: Can they collaborate effectively?
4. Communication Styles: Will they communicate well?
5. Conflict Potential: Are there areas of potential clash?
```

## Error Handling

All AI functions include fallback behavior:

```typescript
try {
  const aiResult = await computeProjectCompatibilityAI(...);
  return aiResult;
} catch (error) {
  console.error("AI compatibility error:", error);
  // Fallback to algorithmic scoring
  return {
    score: 50,
    reasoning: "Unable to perform AI analysis. Using default score.",
    strengths: ["Skills partially match"],
    concerns: ["AI analysis unavailable"],
    teamDynamicsInsight: "Further analysis needed."
  };
}
```

## Usage in Actions

### With useAI Flag
```typescript
// In actions.ts
export async function getProjectsWithCompatibility(
  freelancerId: string,
  useAI: boolean = false
) {
  const aiEnabled = useAI && !!process.env.OPENAI_API_KEY;
  
  if (aiEnabled) {
    // Use AI matching
    const { computeProjectCompatibilityAI } = await import("./ai-compatibility");
    // ...
  } else {
    // Use algorithmic matching
    const { computeProjectCompatibility } = await import("./compatibility");
    // ...
  }
}
```

### In Components
```typescript
// Component can request AI analysis
const projects = await getProjectsWithCompatibility(user.id, true);

// Each project has AI insights if available
projects.forEach(p => {
  console.log(p.compatibility);     // Score
  console.log(p.aiReasoning);       // AI explanation
  console.log(p.strengths);         // Strengths array
});
```

## Rate Limiting Considerations

- AI calls are made per-request, no caching
- Consider implementing caching for production
- Rate limit: ~500 RPM for GPT-4o-mini
- Average latency: 1-3 seconds per call

## Cost Estimation

GPT-4o-mini pricing (approximate):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

Per compatibility check: ~1000 tokens = ~$0.0003

At scale:
- 1,000 daily users × 10 checks = 10,000 checks
- Daily cost: ~$3
- Monthly cost: ~$90

## Future Improvements

1. **Caching** - Cache AI results for same profile/project pairs
2. **Batch processing** - Rank all candidates in single API call
3. **Fine-tuning** - Train custom model on successful team data
4. **Embeddings** - Use embeddings for faster similarity matching
5. **Streaming** - Stream AI responses for better UX
