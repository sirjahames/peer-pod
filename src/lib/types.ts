export type Role = "client" | "freelancer";

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

// Big Five personality trait mapping
export interface BigFiveScores {
    extraversion: number;      // 0-100
    openness: number;          // 0-100
    agreeableness: number;     // 0-100
    conscientiousness: number; // 0-100
    neuroticism: number;       // 0-100 (lower = more stable)
}

// Section 1: Personality assessment answers (1-5 scale)
export interface PersonalityAssessment {
    // Q1: "I usually take the lead..." - Extraversion + Conscientiousness
    leadership: number;
    // Q2: "I prefer proven methods..." - Openness (Reverse) + Conscientiousness
    traditionalism: number;
    // Q3: "When a teammate disagrees..." - Agreeableness + Stability
    peacekeeper: number;
    // Q4: "I get energized by brainstorming..." - Extraversion + Openness
    brainstormer: number;
    // Q5: "I stay calm under pressure..." - Stability + Conscientiousness
    calmUnderPressure: number;
    // Q6: "I wait for others to speak first..." - Extraversion (Reverse) + Agreeableness
    listener: number;
    // Q7: "I am comfortable changing direction..." - Openness + Stability
    adaptable: number;
    // Q8: "I feel anxiety if I don't know what everyone is doing..." - Neuroticism + Conscientiousness
    controlNeed: number;
    // Q9: "I am willing to challenge logic..." - Agreeableness (Reverse) + Conscientiousness
    challenger: number;
}

// Section 2: Work style preferences
export type GradeExpectation = 'A' | 'B+' | 'B' | 'passing';
export type DeadlineStyle = 'early' | 'ontime' | 'lastminute' | 'pressure';
export type VagueTaskResponse = 'initiative' | 'propose' | 'wait' | 'askInstructor';
export type MissingWorkResponse = 'doIt' | 'checkIn' | 'wait' | 'alert';
export type TeamRole = 'leader' | 'workhorse' | 'diplomat' | 'specialist';

export interface WorkStyleAssessment {
    gradeExpectation: GradeExpectation;
    deadlineStyle: DeadlineStyle;
    vagueTaskResponse: VagueTaskResponse;
    missingWorkResponse: MissingWorkResponse;
    teamRole: TeamRole;
}

// Section 3: Scheduling and communication
export type ResponseTime = '1-2hours' | 'sameDay' | '24hours' | 'fewDays';
export type MeetingFormat = 'inPerson' | 'hybrid' | 'video' | 'async';
export type ScheduleFlexibility = 'very' | 'somewhat' | 'notAtAll';

export interface ScheduleCommitments {
    works20PlusHours: boolean;
    familyCaregiver: boolean;
    intensiveSportsClubs: boolean;
    longCommute: boolean;
    scheduleClear: boolean;
}

export interface AvailabilityGrid {
    // Each day has morning, afternoon, evening availability
    monday: { morning: boolean; afternoon: boolean; evening: boolean };
    tuesday: { morning: boolean; afternoon: boolean; evening: boolean };
    wednesday: { morning: boolean; afternoon: boolean; evening: boolean };
    thursday: { morning: boolean; afternoon: boolean; evening: boolean };
    friday: { morning: boolean; afternoon: boolean; evening: boolean };
    saturday: { morning: boolean; afternoon: boolean; evening: boolean };
    sunday: { morning: boolean; afternoon: boolean; evening: boolean };
}

export interface SchedulingAssessment {
    responseTime: ResponseTime;
    meetingFormat: MeetingFormat;
    commitments: ScheduleCommitments;
    availabilityGrid: AvailabilityGrid;
    flexibility: ScheduleFlexibility;
}

// Complete quiz result
export interface CompatibilityQuizResult {
    personality: PersonalityAssessment;
    workStyle: WorkStyleAssessment;
    scheduling: SchedulingAssessment;
    bigFiveScores: BigFiveScores;
}

export interface FreelancerProfile {
    userId: string;
    personality: number[]; // Legacy support
    quizResult?: CompatibilityQuizResult; // New comprehensive quiz
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

export type JobType = "contract" | "freelance" | "part-time" | "full-time" | "project-based";
export type ExperienceLevel = "entry" | "intermediate" | "senior" | "expert";
export type PaymentType = "hourly" | "fixed" | "milestone" | "negotiable";
export type WorkLocation = "remote" | "hybrid" | "onsite";

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

export type GroupStatus = "ACTIVE" | "OPEN" | "CLOSED";

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