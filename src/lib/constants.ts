// ============ COMPATIBILITY QUIZ QUESTIONS ============

// Section 1: Personality & Dynamics (Big Five)
export const PERSONALITY_QUIZ_QUESTIONS = [
    {
        id: "leadership",
        text: "I usually take the lead in group discussions and ensure we stay on track with our goals.",
        traits: ["extraversion", "conscientiousness"],
    },
    {
        id: "traditionalism",
        text: "I prefer to stick with proven methods and clear rubrics rather than experimenting with unconventional approaches.",
        traits: ["openness_reverse", "conscientiousness"],
    },
    {
        id: "peacekeeper",
        text: "When a teammate disagrees with my idea, I prioritize finding a compromise to keep the peace over winning the debate.",
        traits: ["agreeableness", "stability"],
    },
    {
        id: "brainstormer",
        text: "I get energized by 'brainstorming sessions' where we can bounce wild, unfinished ideas off one another.",
        traits: ["extraversion", "openness"],
    },
    {
        id: "calmUnderPressure",
        text: "I tend to stay calm and focused even when the group is facing a tight deadline or unexpected setback.",
        traits: ["stability", "conscientiousness"],
    },
    {
        id: "listener",
        text: "I often wait for others to speak first so I can process their ideas before offering my own perspective.",
        traits: ["extraversion_reverse", "agreeableness"],
    },
    {
        id: "adaptable",
        text: "I am comfortable changing our project's entire direction mid-way if a more creative or effective path emerges.",
        traits: ["openness", "stability"],
    },
    {
        id: "controlNeed",
        text: "I feel a high level of anxiety if I don't know exactly what every group member is doing at all times.",
        traits: ["neuroticism", "conscientiousness"],
    },
    {
        id: "challenger",
        text: "I am willing to challenge a teammate's logic if I think it will improve the final quality of our project.",
        traits: ["agreeableness_reverse", "conscientiousness"],
    },
] as const;

// Section 2: Work Style Options
export const WORK_STYLE_OPTIONS = {
    gradeExpectation: [
        { value: "A", label: "A/A+ (I will do extra work to ensure excellence)" },
        { value: "B+", label: "B+/A- (I want a good grade but have other priorities)" },
        { value: "B", label: "B/B+ (I am happy with an average, solid performance)" },
        { value: "passing", label: "Passing is the primary goal" },
    ],
    deadlineStyle: [
        { value: "early", label: "I finish my parts days early to allow for review" },
        { value: "ontime", label: "I finish exactly when they are due" },
        { value: "lastminute", label: "I usually need a small extension or finish right at the buzzer" },
        { value: "pressure", label: "I work best under extreme pressure (the night before)" },
    ],
    vagueTaskResponse: [
        { value: "initiative", label: "Take initiative, figure it out, and start working immediately" },
        { value: "propose", label: "Propose a potential plan to the group for feedback" },
        { value: "wait", label: "Wait for a more assertive group member to clarify" },
        { value: "askInstructor", label: "Reach out to the instructor/client before doing anything else" },
    ],
    missingWorkResponse: [
        { value: "doIt", label: "Do it yourself immediately to ensure it's done right" },
        { value: "checkIn", label: "Send a friendly check-in message offering help" },
        { value: "wait", label: "Wait—it's their responsibility too; they'll get it done" },
        { value: "alert", label: "Immediately alert the client that the member is non-responsive" },
    ],
    teamRole: [
        { value: "leader", label: "The 'Leader' who managed everyone" },
        { value: "workhorse", label: "The 'Workhorse' who did a lot of the heavy lifting" },
        { value: "diplomat", label: "The 'Diplomat' who kept everyone happy and bridged gaps" },
        { value: "specialist", label: "The 'Specialist' who did exactly what was asked and nothing more" },
    ],
} as const;

// Section 3: Scheduling Options
export const SCHEDULING_OPTIONS = {
    responseTime: [
        { value: "1-2hours", label: "Within 1–2 hours (I'm always on my phone/laptop)" },
        { value: "sameDay", label: "Same day (I check in the evenings)" },
        { value: "24hours", label: "Within 24 hours" },
        { value: "fewDays", label: "Every few days or only when I'm working on the project" },
    ],
    meetingFormat: [
        { value: "inPerson", label: "Strictly In-Person (on location)" },
        { value: "hybrid", label: "Hybrid (mostly online, but 1-2 key in-person meetings)" },
        { value: "video", label: "Strictly Video Calls (Zoom/Teams)" },
        { value: "async", label: "Asynchronous only (shared docs/chat; no live meetings)" },
    ],
    commitments: [
        { id: "works20PlusHours", label: "I work 20+ hours a week" },
        { id: "familyCaregiver", label: "I have significant family/caregiving duties" },
        { id: "intensiveSportsClubs", label: "I am involved in intensive sports/clubs" },
        { id: "longCommute", label: "I have a long commute (1hr+)" },
        { id: "scheduleClear", label: "My schedule is relatively clear" },
    ],
    flexibility: [
        { value: "very", label: "Very—I can shift things around easily" },
        { value: "somewhat", label: "Somewhat—I can adjust with 24-hour notice" },
        { value: "notAtAll", label: "Not at all—my work/life schedule is fixed" },
    ],
} as const;

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export const TIME_BLOCKS = ["morning", "afternoon", "evening"] as const;

// Legacy personality questions (kept for backward compatibility)
export const PERSONALITY_QUESTIONS = [
    { id: 1, text: "I prefer working independently over collaborating with others." },
    { id: 2, text: "I pay close attention to small details in my work." },
    { id: 3, text: "I enjoy brainstorming creative solutions to problems." },
    { id: 4, text: "I prefer following structured processes over improvising." },
    { id: 5, text: "I feel comfortable leading team discussions." },
    { id: 6, text: "I double-check my work before submitting it." },
    { id: 7, text: "I like exploring new technologies and approaches." },
    { id: 8, text: "I prefer having clear deadlines and milestones." },
    { id: 9, text: "I enjoy mentoring or helping less experienced team members." },
    { id: 10, text: "I find it easy to spot errors in code or documents." },
    { id: 11, text: "I enjoy designing user interfaces and experiences." },
    { id: 12, text: "I prefer working on one task at a time rather than multitasking." },
    { id: 13, text: "I am comfortable presenting my work to others." },
    { id: 14, text: "I enjoy writing documentation and technical specs." },
    { id: 15, text: "I like solving complex algorithmic challenges." },
    { id: 16, text: "I adapt quickly when project requirements change." },
    { id: 17, text: "I prefer async communication over real-time meetings." },
    { id: 18, text: "I enjoy optimizing and refactoring existing code." },
    { id: 19, text: "I prefer working on frontend over backend tasks." },
    { id: 20, text: "I thrive under pressure and tight deadlines." },
];

export const AVAILABLE_SKILLS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express",
    "Python",
    "Django",
    "Flask",
    "Java",
    "Spring",
    "Go",
    "Rust",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "GraphQL",
    "REST API",
    "Docker",
    "Kubernetes",
    "AWS",
    "GCP",
    "Azure",
    "Git",
    "CI/CD",
    "Testing",
    "CSS",
    "Tailwind",
    "Figma",
    "UI/UX",
    "Mobile Development",
    "React Native",
];

export const TIMEZONES = [
    "UTC-12",
    "UTC-11",
    "UTC-10",
    "UTC-9",
    "UTC-8",
    "UTC-7",
    "UTC-6",
    "UTC-5",
    "UTC-4",
    "UTC-3",
    "UTC-2",
    "UTC-1",
    "UTC+0",
    "UTC+1",
    "UTC+2",
    "UTC+3",
    "UTC+4",
    "UTC+5",
    "UTC+6",
    "UTC+7",
    "UTC+8",
    "UTC+9",
    "UTC+10",
    "UTC+11",
    "UTC+12",
];
