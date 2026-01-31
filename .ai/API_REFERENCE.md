# PeerPod - API Reference

## Overview

PeerPod uses **Next.js Server Actions** instead of traditional REST APIs. All functions are defined in `src/lib/actions.ts` with the `"use server"` directive.

## Authentication Actions

### login(email, password)
Authenticates a user and creates a session.

```typescript
async function login(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }>
```

**Returns:**
- `success: true` + `user` object on successful login
- `success: false` + `error` message on failure

### signup(email, password, name, role)
Creates a new user account.

```typescript
async function signup(
  email: string,
  password: string,
  name: string,
  role: 'client' | 'freelancer'
): Promise<{ success: boolean; user?: User; error?: string }>
```

**Side effects:** Creates `freelancer_profiles` entry for freelancer role.

### logout()
Ends the current session.

```typescript
async function logout(): Promise<void>
```

### getCurrentUser()
Gets the currently logged-in user.

```typescript
async function getCurrentUser(): Promise<User | null>
```

### setCurrentUser(userId)
Sets the session to a specific user (used after login).

```typescript
async function setCurrentUser(userId: string): Promise<void>
```

---

## User & Profile Actions

### getUser(userId)
Gets a user by ID.

```typescript
async function getUser(userId: string): Promise<User | null>
```

### getUsers(userIds)
Gets multiple users by IDs.

```typescript
async function getUsers(userIds: string[]): Promise<User[]>
```

### getFreelancerProfile(userId)
Gets a freelancer's complete profile.

```typescript
async function getFreelancerProfile(userId: string): Promise<FreelancerProfile | null>
```

---

## Quiz & Onboarding Actions

### savePersonalityAssessment(userId, answers)
Saves personality quiz answers (legacy).

```typescript
async function savePersonalityAssessment(
  userId: string, 
  answers: number[]
): Promise<void>
```

### saveSkills(userId, skills)
Saves freelancer skills.

```typescript
async function saveSkills(
  userId: string, 
  skills: SkillEntry[]
): Promise<void>
```

### saveAvailability(userId, availability)
Saves availability settings.

```typescript
async function saveAvailability(
  userId: string, 
  availability: Availability
): Promise<void>
```

### saveQuizResponse(response)
Saves complete compatibility quiz (new quiz page).

```typescript
async function saveQuizResponse(
  response: QuizResponse
): Promise<{ success: boolean }>
```

### saveCompatibilityQuiz(userId, quizResult)
Saves comprehensive quiz result.

```typescript
async function saveCompatibilityQuiz(
  userId: string,
  quizResult: CompatibilityQuizResult
): Promise<void>
```

### completeOnboarding(userId)
Marks onboarding as complete.

```typescript
async function completeOnboarding(userId: string): Promise<void>
```

---

## Project Actions

### getProjects()
Gets all projects.

```typescript
async function getProjects(): Promise<Project[]>
```

### getOpenProjects()
Gets all open projects accepting applications.

```typescript
async function getOpenProjects(): Promise<Project[]>
```

### getProject(projectId)
Gets a single project by ID.

```typescript
async function getProject(projectId: string): Promise<Project | null>
```

### getClientProjects(clientId)
Gets all projects owned by a client.

```typescript
async function getClientProjects(clientId: string): Promise<Project[]>
```

### createProject(clientId, projectData)
Creates a new project.

```typescript
async function createProject(
  clientId: string,
  projectData: {
    title: string;
    description: string;
    requiredSkills: string[];
    teamSize: number;
    dueDate: string;
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
  }
): Promise<Project>
```

### updateProject(projectId, updates)
Updates an existing project.

```typescript
async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project | null>
```

### deleteProject(projectId)
Deletes a project.

```typescript
async function deleteProject(projectId: string): Promise<boolean>
```

---

## Application Actions

### applyToProject(projectId, freelancerId)
Submits an application to a project.

```typescript
async function applyToProject(
  projectId: string,
  freelancerId: string
): Promise<Application>
```

### getProjectApplications(projectId)
Gets all applications for a project.

```typescript
async function getProjectApplications(
  projectId: string
): Promise<Application[]>
```

### getFreelancerApplications(freelancerId)
Gets all applications by a freelancer.

```typescript
async function getFreelancerApplications(
  freelancerId: string
): Promise<Application[]>
```

### hasApplied(projectId, freelancerId)
Checks if a freelancer has applied to a project.

```typescript
async function hasApplied(
  projectId: string, 
  freelancerId: string
): Promise<boolean>
```

---

## Compatibility Actions

### getCompatibilityScore(profile, project)
Calculates compatibility between a freelancer and project.

```typescript
async function getCompatibilityScore(
  profile: FreelancerProfile,
  project: Project
): Promise<number>
```

### isAICompatibilityEnabled()
Checks if AI matching is available.

```typescript
async function isAICompatibilityEnabled(): Promise<boolean>
```

### getProjectsWithCompatibility(freelancerId, useAI?)
Gets open projects with compatibility scores.

```typescript
async function getProjectsWithCompatibility(
  freelancerId: string,
  useAI?: boolean
): Promise<{
  project: Project;
  compatibility: number;
  aiReasoning?: string;
  strengths?: string[];
  concerns?: string[];
}[]>
```

### getRankedCandidates(projectId, useAI?)
Gets applicants ranked by compatibility.

```typescript
async function getRankedCandidates(
  projectId: string,
  useAI?: boolean
): Promise<{
  freelancerId: string;
  projectScore: number;
  avgMemberScore: number;
  totalScore: number;
  aiReasoning?: string;
  strengths?: string[];
  concerns?: string[];
}[]>
```

### getTeamSuggestions(projectId, useAI?)
Gets AI-suggested team combinations.

```typescript
async function getTeamSuggestions(
  projectId: string,
  useAI?: boolean
): Promise<{
  members: string[];
  avgScore: number;
  aiReasoning?: string;
  teamStrengths?: string[];
}[]>
```

### getTeamInsights(groupId)
Gets AI-powered insights for a formed team.

```typescript
async function getTeamInsights(
  groupId: string
): Promise<{
  overallCompatibility: number;
  teamStrengths: string[];
  potentialChallenges: string[];
  recommendations: string[];
  roleAssignments: {
    name: string;
    suggestedRole: string;
    reasoning: string;
  }[];
} | null>
```

---

## Group Actions

### getGroup(groupId)
Gets a group by ID.

```typescript
async function getGroup(groupId: string): Promise<Group | null>
```

### getProjectGroup(projectId)
Gets the group for a project.

```typescript
async function getProjectGroup(projectId: string): Promise<Group | null>
```

### getFreelancerGroups(freelancerId)
Gets all groups a freelancer belongs to.

```typescript
async function getFreelancerGroups(freelancerId: string): Promise<Group[]>
```

### createGroup(projectId, memberIds)
Creates a new group from selected members.

```typescript
async function createGroup(
  projectId: string,
  memberIds: string[]
): Promise<Group>
```

### addMemberToGroup(groupId, memberId)
Adds a member to an existing group.

```typescript
async function addMemberToGroup(
  groupId: string,
  memberId: string
): Promise<Group | null>
```

### computeGroupStatus(group)
Computes the current status of a group.

```typescript
async function computeGroupStatus(group: Group): Promise<GroupStatus>
```

---

## Task Actions

### getGroupTasks(groupId)
Gets all tasks for a group.

```typescript
async function getGroupTasks(groupId: string): Promise<Task[]>
```

### createTask(groupId, title, description, assignedTo?)
Creates a new task.

```typescript
async function createTask(
  groupId: string,
  title: string,
  description: string,
  assignedTo?: string
): Promise<Task>
```

### updateTask(taskId, updates)
Updates a task.

```typescript
async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null>
```

### toggleTaskComplete(taskId)
Toggles task completion status.

```typescript
async function toggleTaskComplete(taskId: string): Promise<Task | null>
```

---

## Chat Actions

### getGroupMessages(groupId)
Gets all messages for a group.

```typescript
async function getGroupMessages(groupId: string): Promise<ChatMessage[]>
```

### sendMessage(groupId, userId, message)
Sends a chat message.

```typescript
async function sendMessage(
  groupId: string,
  userId: string,
  message: string
): Promise<ChatMessage>
```

---

## Error Handling

All actions follow this pattern:
- Return `null` or empty array on not found
- Throw errors for database failures
- Log errors to console
- Graceful fallbacks for AI features
