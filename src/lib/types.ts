export type Role = 'client' | 'freelancer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface FreelancerProfile {
  userId: string;
  personality: number[];
  skills: SkillEntry[];
  availability: Availability;
  onboardingComplete: boolean;
}

export interface SkillEntry {
  skill: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
}

export interface Availability {
  hoursPerWeek: number;
  timezone: string;
}

export type JobType = 'contract' | 'freelance' | 'part-time' | 'full-time' | 'project-based';
export type ExperienceLevel = 'entry' | 'intermediate' | 'senior' | 'expert';
export type PaymentType = 'hourly' | 'fixed' | 'milestone' | 'negotiable';
export type WorkLocation = 'remote' | 'hybrid' | 'onsite';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  dueDate: string;
  joinCode: string;
  isOpen: boolean;
  createdAt: string;
  // Job details (optional for backward compatibility)
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

export type GroupStatus = 'ACTIVE' | 'OPEN' | 'CLOSED';

export interface Group {
  id: string;
  projectId: string;
  members: string[];
  status: GroupStatus;
}

export interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  appliedAt: string;
}

export interface Task {
  id: string;
  groupId: string;
  title: string;
  description: string;
  assignedTo: string | null;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  message: string;
  timestamp: string;
}

export interface CompatibilityScore {
  freelancerId: string;
  projectScore: number;
  memberScores: { memberId: string; score: number }[];
  totalScore: number;
}
export interface QuizResponse {
  userId: string;
  completedAt: string;
  // Section 1: Personality (Big Five scores 1-5 for each question)
  personalityScores: number[]; // 9 questions
  // Section 2: Work Style (letter-based answers)
  gradeExpectation: 'A' | 'B+' | 'B' | 'Pass';
  internalDeadline: 'Early' | 'OnTime' | 'Late' | 'UnderPressure';
  ambiguityApproach: 'Initiative' | 'Propose' | 'Wait' | 'AskInstructor';
  teamResponsiveness: 'Immediate' | 'Friendly' | 'Wait' | 'Alert';
  contributionStyle: 'Leader' | 'Workhorse' | 'Diplomat' | 'Specialist';
  // Section 3: Scheduling & Communication
  responseTime: '1-2hrs' | 'SameDay' | '24hrs' | 'FewDays';
  meetingFormat: 'InPerson' | 'Hybrid' | 'VideoOnly' | 'Async';
  scheduleFullness: string[]; // array of commitments
  availabilityGrid: {
    [day: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
  scheduleFlexibility: 'Very' | 'Somewhat' | 'NotAtAll';
  // Derived personality profile
  personalityProfile?: {
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    neuroticism: number;
    openness: number;
  };
}