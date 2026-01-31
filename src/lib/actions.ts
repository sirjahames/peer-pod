'use server';

import {
  users,
  freelancerProfiles,
  projects,
  groups,
  applications,
  tasks,
  chatMessages,
  generateId,
  generateJoinCode,
  ensureInitialized,
} from './data';
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
} from './types';
import { computeProjectCompatibility, rankCandidates, suggestTeamCombinations } from './compatibility';
import { assignTasksToTeam } from './task-distribution';

// Ensure data is initialized on every server action call
ensureInitialized();

// Session storage (simulated - in real app would use cookies/JWT)
let sessionUserId: string | null = null;

// ============ AUTH ============

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  sessionUserId = user.id;
  return { success: true, user };
}

export async function signup(
  email: string,
  password: string,
  name: string,
  role: 'client' | 'freelancer'
): Promise<{ success: boolean; user?: User; error?: string }> {
  const existing = Array.from(users.values()).find((u) => u.email === email);
  if (existing) {
    return { success: false, error: 'Email already registered' };
  }

  const user: User = {
    id: generateId(),
    email,
    name,
    role,
  };

  users.set(user.id, user);
  sessionUserId = user.id;

  if (role === 'freelancer') {
    freelancerProfiles.set(user.id, {
      userId: user.id,
      personality: [],
      skills: [],
      availability: { hoursPerWeek: 0, timezone: 'UTC' },
      onboardingComplete: false,
    });
  }

  return { success: true, user };
}

export async function logout(): Promise<void> {
  sessionUserId = null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!sessionUserId) return null;
  return users.get(sessionUserId) || null;
}

export async function setCurrentUser(userId: string): Promise<void> {
  sessionUserId = userId;
}

// ============ FREELANCER PROFILE ============

export async function getFreelancerProfile(
  userId: string
): Promise<FreelancerProfile | null> {
  return freelancerProfiles.get(userId) || null;
}

export async function savePersonalityAssessment(
  userId: string,
  answers: number[]
): Promise<void> {
  const profile = freelancerProfiles.get(userId);
  if (profile) {
    profile.personality = answers;
    freelancerProfiles.set(userId, profile);
  }
}

export async function saveSkills(
  userId: string,
  skills: SkillEntry[]
): Promise<void> {
  const profile = freelancerProfiles.get(userId);
  if (profile) {
    profile.skills = skills;
    freelancerProfiles.set(userId, profile);
  }
}

export async function saveAvailability(
  userId: string,
  availability: Availability
): Promise<void> {
  const profile = freelancerProfiles.get(userId);
  if (profile) {
    profile.availability = availability;
    freelancerProfiles.set(userId, profile);
  }
}

export async function completeOnboarding(userId: string): Promise<void> {
  const profile = freelancerProfiles.get(userId);
  if (profile) {
    profile.onboardingComplete = true;
    freelancerProfiles.set(userId, profile);
  }
}

// ============ PROJECTS ============

export async function getProjects(): Promise<Project[]> {
  return Array.from(projects.values());
}

export async function getOpenProjects(): Promise<Project[]> {
  return Array.from(projects.values()).filter((p) => p.isOpen);
}

export async function getProject(projectId: string): Promise<Project | null> {
  return projects.get(projectId) || null;
}

export async function getClientProjects(clientId: string): Promise<Project[]> {
  return Array.from(projects.values()).filter((p) => p.clientId === clientId);
}

export async function createProject(
  clientId: string,
  data: {
    title: string;
    description: string;
    requiredSkills: string[];
    teamSize: number;
    dueDate: string;
    isOpen: boolean;
    jobType?: 'contract' | 'freelance' | 'part-time' | 'full-time' | 'project-based';
    experienceLevel?: 'entry' | 'intermediate' | 'senior' | 'expert';
    paymentType?: 'hourly' | 'fixed' | 'milestone' | 'negotiable';
    paymentAmount?: number;
    paymentMax?: number;
    workLocation?: 'remote' | 'hybrid' | 'onsite';
    location?: string;
    estimatedDuration?: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
  }
): Promise<Project> {
  const project: Project = {
    id: generateId(),
    clientId,
    ...data,
    joinCode: generateJoinCode(),
    createdAt: new Date().toISOString().split('T')[0],
  };

  projects.set(project.id, project);
  return project;
}

export async function updateProject(
  projectId: string,
  data: Partial<{
    title: string;
    description: string;
    requiredSkills: string[];
    teamSize: number;
    dueDate: string;
    isOpen: boolean;
    jobType?: 'contract' | 'freelance' | 'part-time' | 'full-time' | 'project-based';
    experienceLevel?: 'entry' | 'intermediate' | 'senior' | 'expert';
    paymentType?: 'hourly' | 'fixed' | 'milestone' | 'negotiable';
    paymentAmount?: number;
    paymentMax?: number;
    workLocation?: 'remote' | 'hybrid' | 'onsite';
    location?: string;
    estimatedDuration?: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
  }>
): Promise<Project | null> {
  const project = projects.get(projectId);
  if (!project) return null;

  const updated = { ...project, ...data };
  projects.set(projectId, updated);
  return updated;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const project = projects.get(projectId);
  if (!project) return false;

  // Delete associated applications
  Array.from(applications.values())
    .filter((a) => a.projectId === projectId)
    .forEach((a) => applications.delete(a.id));

  // Delete associated group and tasks
  const group = Array.from(groups.values()).find((g) => g.projectId === projectId);
  if (group) {
    Array.from(tasks.values())
      .filter((t) => t.groupId === group.id)
      .forEach((t) => tasks.delete(t.id));
    Array.from(chatMessages.values())
      .filter((m) => m.groupId === group.id)
      .forEach((m) => chatMessages.delete(m.id));
    groups.delete(group.id);
  }

  projects.delete(projectId);
  return true;
}

// ============ APPLICATIONS ============

export async function applyToProject(
  freelancerId: string,
  projectId: string
): Promise<Application> {
  const application: Application = {
    id: generateId(),
    projectId,
    freelancerId,
    appliedAt: new Date().toISOString(),
  };

  applications.set(application.id, application);
  return application;
}

export async function getProjectApplications(
  projectId: string
): Promise<Application[]> {
  return Array.from(applications.values()).filter(
    (a) => a.projectId === projectId
  );
}

export async function getFreelancerApplications(
  freelancerId: string
): Promise<Application[]> {
  return Array.from(applications.values()).filter(
    (a) => a.freelancerId === freelancerId
  );
}

export async function hasApplied(
  freelancerId: string,
  projectId: string
): Promise<boolean> {
  return Array.from(applications.values()).some(
    (a) => a.freelancerId === freelancerId && a.projectId === projectId
  );
}

// ============ COMPATIBILITY ============

export async function getProjectCompatibility(
  freelancerId: string,
  projectId: string
): Promise<number> {
  const profile = freelancerProfiles.get(freelancerId);
  const project = projects.get(projectId);
  if (!profile || !project) return 0;
  return computeProjectCompatibility(profile, project);
}

export async function getProjectsWithCompatibility(
  freelancerId: string
): Promise<{ project: Project; compatibility: number }[]> {
  const profile = freelancerProfiles.get(freelancerId);
  if (!profile) return [];

  const openProjects = Array.from(projects.values()).filter((p) => p.isOpen);
  return openProjects.map((project) => ({
    project,
    compatibility: computeProjectCompatibility(profile, project),
  }));
}

export async function getRankedCandidates(projectId: string) {
  const project = projects.get(projectId);
  if (!project) return [];

  const projectApps = await getProjectApplications(projectId);
  const candidateIds = projectApps.map((a) => a.freelancerId);

  const group = Array.from(groups.values()).find(
    (g) => g.projectId === projectId
  );
  const existingMembers = group?.members || [];

  return rankCandidates(projectId, candidateIds, project, existingMembers);
}

export async function getTeamSuggestions(projectId: string) {
  const project = projects.get(projectId);
  if (!project) return [];

  const projectApps = await getProjectApplications(projectId);
  const candidateIds = projectApps.map((a) => a.freelancerId);

  return suggestTeamCombinations(
    projectId,
    candidateIds,
    project,
    project.teamSize
  );
}

// ============ GROUPS ============

export async function getGroup(groupId: string): Promise<Group | null> {
  return groups.get(groupId) || null;
}

export async function getProjectGroup(projectId: string): Promise<Group | null> {
  return (
    Array.from(groups.values()).find((g) => g.projectId === projectId) || null
  );
}

export async function getFreelancerGroups(freelancerId: string): Promise<Group[]> {
  return Array.from(groups.values()).filter((g) =>
    g.members.includes(freelancerId)
  );
}

export async function createGroup(
  projectId: string,
  memberIds: string[]
): Promise<Group> {
  const group: Group = {
    id: generateId(),
    projectId,
    members: memberIds,
    status: 'ACTIVE',
  };

  groups.set(group.id, group);

  // Close the project
  const project = projects.get(projectId);
  if (project) {
    project.isOpen = false;
    projects.set(projectId, project);
  }

  // Generate tasks
  if (project) {
    const generatedTasks = assignTasksToTeam(
      group.id,
      memberIds,
      project.title,
      project.requiredSkills
    );
    generatedTasks.forEach((t) => tasks.set(t.id, t));
  }

  return group;
}

export async function computeGroupStatus(
  group: Group,
  project: Project
): Promise<GroupStatus> {
  const now = new Date();
  const dueDate = new Date(project.dueDate);
  const openPeriodEnd = new Date(dueDate);
  openPeriodEnd.setDate(openPeriodEnd.getDate() + 7);

  if (now < dueDate) return 'ACTIVE';
  if (now < openPeriodEnd) return 'OPEN';
  return 'CLOSED';
}

// ============ TASKS ============

export async function getGroupTasks(groupId: string): Promise<Task[]> {
  return Array.from(tasks.values()).filter((t) => t.groupId === groupId);
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, 'completed' | 'assignedTo'>>
): Promise<void> {
  const task = tasks.get(taskId);
  if (task) {
    tasks.set(taskId, { ...task, ...updates });
  }
}

// ============ CHAT ============

export async function getGroupMessages(groupId: string): Promise<ChatMessage[]> {
  return Array.from(chatMessages.values())
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function sendMessage(
  groupId: string,
  userId: string,
  message: string
): Promise<ChatMessage> {
  const chatMessage: ChatMessage = {
    id: generateId(),
    groupId,
    userId,
    message,
    timestamp: new Date().toISOString(),
  };

  chatMessages.set(chatMessage.id, chatMessage);
  return chatMessage;
}

// ============ USERS ============

export async function getUser(userId: string): Promise<User | null> {
  return users.get(userId) || null;
}

export async function getUsers(userIds: string[]): Promise<User[]> {
  return userIds.map((id) => users.get(id)).filter((u): u is User => u !== null);
}
