"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
    saveCompatibilityQuiz,
    saveSkills,
    completeOnboarding,
} from "@/lib/actions";
import {
    PERSONALITY_QUIZ_QUESTIONS,
    WORK_STYLE_OPTIONS,
    SCHEDULING_OPTIONS,
    DAYS_OF_WEEK,
    TIME_BLOCKS,
    AVAILABLE_SKILLS,
    TIMEZONES,
} from "@/lib/constants";
import {
    SkillEntry,
    PersonalityAssessment,
    WorkStyleAssessment,
    SchedulingAssessment,
    AvailabilityGrid,
    ScheduleCommitments,
    GradeExpectation,
    DeadlineStyle,
    VagueTaskResponse,
    MissingWorkResponse,
    TeamRole,
    ResponseTime,
    MeetingFormat,
    ScheduleFlexibility,
} from "@/lib/types";

type Step = "intro" | "personality" | "workstyle" | "scheduling" | "skills";

const defaultAvailabilityGrid: AvailabilityGrid = {
    monday: { morning: false, afternoon: false, evening: false },
    tuesday: { morning: false, afternoon: false, evening: false },
    wednesday: { morning: false, afternoon: false, evening: false },
    thursday: { morning: false, afternoon: false, evening: false },
    friday: { morning: false, afternoon: false, evening: false },
    saturday: { morning: false, afternoon: false, evening: false },
    sunday: { morning: false, afternoon: false, evening: false },
};

const defaultCommitments: ScheduleCommitments = {
    works20PlusHours: false,
    familyCaregiver: false,
    intensiveSportsClubs: false,
    longCommute: false,
    scheduleClear: false,
};

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>("intro");

    // Section 1: Personality Assessment (1-5 scale for each question)
    const [personalityAnswers, setPersonalityAnswers] = useState<PersonalityAssessment>({
        leadership: 3,
        traditionalism: 3,
        peacekeeper: 3,
        brainstormer: 3,
        calmUnderPressure: 3,
        listener: 3,
        adaptable: 3,
        controlNeed: 3,
        challenger: 3,
    });

    // Section 2: Work Style Assessment
    const [workStyle, setWorkStyle] = useState<WorkStyleAssessment>({
        gradeExpectation: "B+",
        deadlineStyle: "ontime",
        vagueTaskResponse: "propose",
        missingWorkResponse: "checkIn",
        teamRole: "workhorse",
    });

    // Section 3: Scheduling Assessment
    const [scheduling, setScheduling] = useState<SchedulingAssessment>({
        responseTime: "sameDay",
        meetingFormat: "hybrid",
        commitments: defaultCommitments,
        availabilityGrid: defaultAvailabilityGrid,
        flexibility: "somewhat",
    });

    // Section 4: Skills
    const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>([]);
    const [hoursPerWeek, setHoursPerWeek] = useState(20);
    const [timezone, setTimezone] = useState("UTC+0");

    const steps: Step[] = ["intro", "personality", "workstyle", "scheduling", "skills"];
    const currentStepIndex = steps.indexOf(step);

    const handleNext = async () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setStep(steps[nextIndex]);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setStep(steps[prevIndex]);
        }
    };

    const handleComplete = async () => {
        if (!user) return;
        await saveCompatibilityQuiz(user.id, personalityAnswers, workStyle, scheduling, hoursPerWeek, timezone);
        await saveSkills(user.id, selectedSkills);
        await completeOnboarding(user.id);
        router.push("/freelancer");
    };

    const toggleSkill = (skill: string) => {
        const existing = selectedSkills.find((s) => s.skill === skill);
        if (existing) {
            setSelectedSkills(selectedSkills.filter((s) => s.skill !== skill));
        } else {
            setSelectedSkills([...selectedSkills, { skill, proficiency: 3 }]);
        }
    };

    const updateProficiency = (skill: string, proficiency: 1 | 2 | 3 | 4 | 5) => {
        setSelectedSkills(
            selectedSkills.map((s) => (s.skill === skill ? { ...s, proficiency } : s)),
        );
    };

    const toggleAvailability = (day: keyof AvailabilityGrid, time: "morning" | "afternoon" | "evening") => {
        setScheduling((prev) => ({
            ...prev,
            availabilityGrid: {
                ...prev.availabilityGrid,
                [day]: {
                    ...prev.availabilityGrid[day],
                    [time]: !prev.availabilityGrid[day][time],
                },
            },
        }));
    };

    const toggleCommitment = (id: keyof ScheduleCommitments) => {
        setScheduling((prev) => ({
            ...prev,
            commitments: {
                ...prev.commitments,
                [id]: !prev.commitments[id],
            },
        }));
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex gap-2 mb-4">
                    {steps.slice(1).map((s, i) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 rounded-full transition-all ${
                                currentStepIndex > i + 1
                                    ? "bg-emerald-500"
                                    : currentStepIndex === i + 1
                                      ? "bg-black"
                                      : "bg-gray-200"
                            }`}
                        />
                    ))}
                </div>
                {step !== "intro" && (
                    <p className="text-sm text-gray-500">
                        Step {currentStepIndex} of {steps.length - 1}
                    </p>
                )}
            </div>

            {/* Intro Section */}
            {step === "intro" && (
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold">Group Compatibility & Synergy Quiz</h1>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        To match you with teammates who share your work ethic, complement your personality, and fit your schedule.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-gray-700"><strong>Time:</strong> 5–7 minutes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <span className="text-gray-700"><strong>Privacy:</strong> Answers are confidential</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-gray-700"><strong>No wrong answers:</strong> Just be honest!</span>
                        </div>
                    </div>
                    <button
                        onClick={handleNext}
                        className="mt-6 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium">
                        Start Quiz →
                    </button>
                </div>
            )}

            {/* Section 1: Personality & Dynamics */}
            {step === "personality" && (
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Personality & Dynamics</h2>
                        <p className="text-gray-600">
                            Rate how much you agree with each statement on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree).
                        </p>
                    </div>
                    <div className="space-y-8">
                        {PERSONALITY_QUIZ_QUESTIONS.map((q) => (
                            <div key={q.id} className="bg-white border rounded-xl p-6 shadow-sm">
                                <p className="mb-4 text-lg">{q.text}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Strongly Disagree</span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    setPersonalityAnswers((prev) => ({
                                                        ...prev,
                                                        [q.id]: value,
                                                    }));
                                                }}
                                                className={`w-12 h-12 rounded-full border-2 font-semibold transition ${
                                                    personalityAnswers[q.id as keyof PersonalityAssessment] === value
                                                        ? "bg-black text-white border-black"
                                                        : "border-gray-300 hover:border-black"
                                                }`}>
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">Strongly Agree</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            ← Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Section 2: Work Style & Academic Standards */}
            {step === "workstyle" && (
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Work Style & Standards</h2>
                        <p className="text-gray-600">
                            Select the option that best describes your actual habits and expectations.
                        </p>
                    </div>
                    <div className="space-y-8">
                        {/* Grade Expectation */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">{"What is your \"Minimum Acceptable\" quality standard for projects?"}</p>
                            <div className="space-y-3">
                                {WORK_STYLE_OPTIONS.gradeExpectation.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gradeExpectation"
                                            checked={workStyle.gradeExpectation === opt.value}
                                            onChange={() => setWorkStyle((prev) => ({ ...prev, gradeExpectation: opt.value as GradeExpectation }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Deadline Style */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">{"Which best describes your \"Internal Deadline\"?"}</p>
                            <div className="space-y-3">
                                {WORK_STYLE_OPTIONS.deadlineStyle.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="deadlineStyle"
                                            checked={workStyle.deadlineStyle === opt.value}
                                            onChange={() => setWorkStyle((prev) => ({ ...prev, deadlineStyle: opt.value as DeadlineStyle }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Vague Task Response */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">When a task is vague or the requirements are unclear, you:</p>
                            <div className="space-y-3">
                                {WORK_STYLE_OPTIONS.vagueTaskResponse.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="vagueTaskResponse"
                                            checked={workStyle.vagueTaskResponse === opt.value}
                                            onChange={() => setWorkStyle((prev) => ({ ...prev, vagueTaskResponse: opt.value as VagueTaskResponse }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Missing Work Response - Scenario */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-2">SCENARIO:</p>
                            <p className="text-gray-700 mb-4">{"A teammate hasn't uploaded their section 24 hours before the deadline. You:"}</p>
                            <div className="space-y-3">
                                {WORK_STYLE_OPTIONS.missingWorkResponse.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="missingWorkResponse"
                                            checked={workStyle.missingWorkResponse === opt.value}
                                            onChange={() => setWorkStyle((prev) => ({ ...prev, missingWorkResponse: opt.value as MissingWorkResponse }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Team Role */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">In past projects, how would previous teammates likely describe your contribution?</p>
                            <div className="space-y-3">
                                {WORK_STYLE_OPTIONS.teamRole.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="teamRole"
                                            checked={workStyle.teamRole === opt.value}
                                            onChange={() => setWorkStyle((prev) => ({ ...prev, teamRole: opt.value as TeamRole }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            ← Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Section 3: Scheduling & Communication */}
            {step === "scheduling" && (
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Scheduling & Communication</h2>
                        <p className="text-gray-600">
                            {"Let's get practical about when and how you actually work."}
                        </p>
                    </div>
                    <div className="space-y-8">
                        {/* Response Time */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">{"What is your preferred communication \"Response Time\" for group messages?"}</p>
                            <div className="space-y-3">
                                {SCHEDULING_OPTIONS.responseTime.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="responseTime"
                                            checked={scheduling.responseTime === opt.value}
                                            onChange={() => setScheduling((prev) => ({ ...prev, responseTime: opt.value as ResponseTime }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Meeting Format */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">Which meeting format do you find most productive?</p>
                            <div className="space-y-3">
                                {SCHEDULING_OPTIONS.meetingFormat.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="meetingFormat"
                                            checked={scheduling.meetingFormat === opt.value}
                                            onChange={() => setScheduling((prev) => ({ ...prev, meetingFormat: opt.value as MeetingFormat }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Schedule Commitments */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">{"Outside of freelancing, how \"Full\" is your plate? (Select all that apply)"}</p>
                            <div className="space-y-3">
                                {SCHEDULING_OPTIONS.commitments.map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={scheduling.commitments[opt.id as keyof ScheduleCommitments]}
                                            onChange={() => toggleCommitment(opt.id as keyof ScheduleCommitments)}
                                            className="w-5 h-5 accent-black rounded"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Availability Grid */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">Availability Grid: Mark the blocks where you are PREPARED to meet/work:</p>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left py-2 pr-4 text-sm text-gray-500">Time</th>
                                            {DAYS_OF_WEEK.map((day) => (
                                                <th key={day} className="py-2 px-2 text-sm font-medium capitalize">
                                                    {day.slice(0, 3)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TIME_BLOCKS.map((time) => (
                                            <tr key={time}>
                                                <td className="py-2 pr-4 text-sm text-gray-600 capitalize">{time}</td>
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <td key={`${day}-${time}`} className="py-2 px-2 text-center">
                                                        <button
                                                            onClick={() => toggleAvailability(day as keyof AvailabilityGrid, time as "morning" | "afternoon" | "evening")}
                                                            className={`w-8 h-8 rounded border-2 transition ${
                                                                scheduling.availabilityGrid[day as keyof AvailabilityGrid][time as "morning" | "afternoon" | "evening"]
                                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                                    : "border-gray-300 hover:border-emerald-300"
                                                            }`}>
                                                            {scheduling.availabilityGrid[day as keyof AvailabilityGrid][time as "morning" | "afternoon" | "evening"] && (
                                                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Flexibility */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <p className="font-medium mb-4">How flexible is your schedule if an emergency meeting is needed?</p>
                            <div className="space-y-3">
                                {SCHEDULING_OPTIONS.flexibility.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="flexibility"
                                            checked={scheduling.flexibility === opt.value}
                                            onChange={() => setScheduling((prev) => ({ ...prev, flexibility: opt.value as ScheduleFlexibility }))}
                                            className="w-5 h-5 accent-black"
                                        />
                                        <span className="group-hover:text-black transition">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Hours per week and Timezone */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm">
                            <div className="mb-6">
                                <label className="block font-medium mb-4">
                                    Hours per week you can work
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="60"
                                    value={hoursPerWeek}
                                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                />
                                <p className="text-center mt-3 text-2xl font-bold">{hoursPerWeek} hours</p>
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Your timezone</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                                    {TIMEZONES.map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            ← Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Section 4: Skills */}
            {step === "skills" && (
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Your Skills</h2>
                        <p className="text-gray-600">
                            Select your skills and rate your proficiency level (1=Beginner, 5=Expert)
                        </p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
                        <p className="font-medium mb-4">Select all skills you have:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {AVAILABLE_SKILLS.map((skill) => {
                                const selected = selectedSkills.find((s) => s.skill === skill);
                                return (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-4 py-2 text-sm border rounded-lg transition ${
                                            selected
                                                ? "bg-black text-white border-black"
                                                : "border-gray-300 hover:border-black"
                                        }`}>
                                        {skill}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedSkills.length > 0 && (
                        <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
                            <p className="font-medium mb-4">Set your proficiency levels:</p>
                            <div className="space-y-4">
                                {selectedSkills.map((entry) => (
                                    <div key={entry.skill} className="flex items-center gap-4">
                                        <span className="w-32 font-medium">{entry.skill}</span>
                                        <div className="flex gap-2">
                                            {([1, 2, 3, 4, 5] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => updateProficiency(entry.skill, level)}
                                                    className={`w-10 h-10 rounded-full border-2 font-semibold transition ${
                                                        entry.proficiency === level
                                                            ? "bg-black text-white border-black"
                                                            : "border-gray-300 hover:border-black"
                                                    }`}>
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {entry.proficiency === 1 && "Beginner"}
                                            {entry.proficiency === 2 && "Basic"}
                                            {entry.proficiency === 3 && "Intermediate"}
                                            {entry.proficiency === 4 && "Advanced"}
                                            {entry.proficiency === 5 && "Expert"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            ← Back
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={selectedSkills.length === 0}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium">
                            ✓ Complete Setup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
