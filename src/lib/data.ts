import {
  User,
  FreelancerProfile,
  Project,
  Group,
  Application,
  Task,
  ChatMessage,
} from './types';

// In-memory data stores - easily replaceable with database
export const users: Map<string, User> = new Map();
export const freelancerProfiles: Map<string, FreelancerProfile> = new Map();
export const projects: Map<string, Project> = new Map();
export const groups: Map<string, Group> = new Map();
export const applications: Map<string, Application> = new Map();
export const tasks: Map<string, Task> = new Map();
export const chatMessages: Map<string, ChatMessage> = new Map();

// Session store for simulated auth
export let currentUserId: string | null = null;

// Seed data
const seedUsers: User[] = [
  { id: 'u1', email: 'alice@example.com', name: 'Alice Johnson', role: 'freelancer' },
  { id: 'u2', email: 'bob@example.com', name: 'Bob Smith', role: 'freelancer' },
  { id: 'u3', email: 'carol@example.com', name: 'Carol Davis', role: 'client' },
  { id: 'u4', email: 'dan@example.com', name: 'Dan Wilson', role: 'freelancer' },
];

const seedProfiles: FreelancerProfile[] = [
  {
    userId: 'u1',
    personality: [4, 3, 5, 2, 4, 3, 5, 4, 3, 2, 4, 5, 3, 4, 2, 5, 3, 4, 5, 3],
    skills: [
      { skill: 'React', proficiency: 5 },
      { skill: 'TypeScript', proficiency: 4 },
      { skill: 'Node.js', proficiency: 3 },
    ],
    availability: { hoursPerWeek: 30, timezone: 'UTC-5' },
    onboardingComplete: true,
  },
  {
    userId: 'u2',
    personality: [3, 4, 4, 3, 3, 4, 4, 3, 4, 3, 3, 4, 4, 3, 3, 4, 4, 3, 4, 4],
    skills: [
      { skill: 'Python', proficiency: 5 },
      { skill: 'Django', proficiency: 4 },
      { skill: 'PostgreSQL', proficiency: 4 },
    ],
    availability: { hoursPerWeek: 40, timezone: 'UTC+0' },
    onboardingComplete: true,
  },
  {
    userId: 'u4',
    personality: [5, 2, 3, 4, 5, 2, 3, 5, 2, 4, 5, 3, 2, 5, 4, 3, 2, 5, 3, 2],
    skills: [
      { skill: 'React', proficiency: 4 },
      { skill: 'CSS', proficiency: 5 },
      { skill: 'Figma', proficiency: 4 },
    ],
    availability: { hoursPerWeek: 20, timezone: 'UTC+1' },
    onboardingComplete: true,
  },
];

const seedProjects: Project[] = [
  {
    id: 'p1',
    clientId: 'u3',
    title: 'E-commerce Platform',
    description: 'We are looking for talented developers to build a modern, scalable e-commerce platform. The project involves creating a full-stack solution with a React frontend and Node.js backend, including payment integration, inventory management, and a customer-facing storefront.',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
    teamSize: 3,
    dueDate: '2026-03-15',
    joinCode: 'ECOM2026',
    isOpen: true,
    createdAt: '2026-01-15',
    jobType: 'contract',
    experienceLevel: 'intermediate',
    paymentType: 'hourly',
    paymentAmount: 50,
    paymentMax: 75,
    workLocation: 'remote',
    estimatedDuration: '2-3 months',
    responsibilities: [
      'Design and implement scalable frontend components',
      'Build RESTful APIs and database schemas',
      'Integrate payment gateways (Stripe)',
      'Write unit and integration tests',
      'Participate in code reviews and team standups',
    ],
    requirements: [
      '3+ years of experience with React and Node.js',
      'Experience with PostgreSQL or similar databases',
      'Familiarity with e-commerce platforms',
      'Strong communication skills',
      'Available for weekly sync meetings',
    ],
    benefits: [
      'Flexible working hours',
      'Fully remote team',
      'Opportunity for long-term engagement',
      'Weekly payments via PayPal or bank transfer',
    ],
  },
  {
    id: 'p2',
    clientId: 'u3',
    title: 'Mobile App Backend',
    description: 'We need experienced backend developers to build a robust REST API for our fitness tracking mobile application. The API will handle user authentication, workout logging, progress tracking, and social features.',
    requiredSkills: ['Python', 'Django', 'PostgreSQL'],
    teamSize: 2,
    dueDate: '2026-02-28',
    joinCode: 'FIT2026',
    isOpen: true,
    createdAt: '2026-01-20',
    jobType: 'contract',
    experienceLevel: 'senior',
    paymentType: 'fixed',
    paymentAmount: 8000,
    workLocation: 'remote',
    estimatedDuration: '6 weeks',
    responsibilities: [
      'Design and implement REST API endpoints',
      'Set up authentication and authorization',
      'Optimize database queries for performance',
      'Write comprehensive API documentation',
      'Deploy to cloud infrastructure (AWS)',
    ],
    requirements: [
      '5+ years of Python/Django experience',
      'Experience building mobile app backends',
      'Strong understanding of REST principles',
      'Experience with AWS or similar cloud platforms',
      'Ability to work independently',
    ],
    benefits: [
      'Competitive fixed-price contract',
      'Potential for follow-up projects',
      'Work with a passionate startup team',
      'Milestone-based payments',
    ],
  },
];

const seedApplications: Application[] = [
  { id: 'a1', projectId: 'p1', freelancerId: 'u1', appliedAt: '2026-01-16T10:00:00Z' },
  { id: 'a2', projectId: 'p1', freelancerId: 'u2', appliedAt: '2026-01-16T11:00:00Z' },
  { id: 'a3', projectId: 'p1', freelancerId: 'u4', appliedAt: '2026-01-16T12:00:00Z' },
  { id: 'a4', projectId: 'p2', freelancerId: 'u2', appliedAt: '2026-01-21T10:00:00Z' },
];

// Seed group - a formed team for project p2 (Data Dashboard)
const seedGroups: Group[] = [
  {
    id: 'g1',
    projectId: 'p2',
    members: ['u2'], // Bob Smith is on the Data Dashboard team
    status: 'ACTIVE',
  },
];

// Seed tasks for the group
const seedTasks: Task[] = [
  {
    id: 't1',
    groupId: 'g1',
    title: 'Set up Python environment',
    description: 'Initialize the project with Python 3.11, set up virtual environment and install core dependencies (pandas, plotly, dash)',
    assignedTo: 'u2',
    completed: true,
  },
  {
    id: 't2',
    groupId: 'g1',
    title: 'Design dashboard layout',
    description: 'Create wireframes for the main dashboard view including charts, filters, and navigation components',
    assignedTo: 'u2',
    completed: true,
  },
  {
    id: 't3',
    groupId: 'g1',
    title: 'Build data ingestion pipeline',
    description: 'Create ETL scripts to pull data from various sources (CSV, API, database) and normalize into a common format',
    assignedTo: 'u2',
    completed: false,
  },
  {
    id: 't4',
    groupId: 'g1',
    title: 'Implement interactive charts',
    description: 'Build reusable chart components using Plotly - bar charts, line charts, and pie charts with hover interactions',
    assignedTo: 'u2',
    completed: false,
  },
  {
    id: 't5',
    groupId: 'g1',
    title: 'Add filtering and date range selection',
    description: 'Implement filter dropdowns and date pickers that update all dashboard components in real-time',
    assignedTo: 'u2',
    completed: false,
  },
];

let initialized = false;

function initializeData() {
  if (initialized) return;
  initialized = true;
  
  seedUsers.forEach((u) => users.set(u.id, u));
  seedProfiles.forEach((p) => freelancerProfiles.set(p.userId, p));
  seedProjects.forEach((p) => projects.set(p.id, p));
  seedApplications.forEach((a) => applications.set(a.id, a));
  seedGroups.forEach((g) => groups.set(g.id, g));
  seedTasks.forEach((t) => tasks.set(t.id, t));
}

// Ensure initialization
initializeData();

// Export an ensureInitialized function that can be called from actions
export function ensureInitialized() {
  initializeData();
}

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
