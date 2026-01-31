'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { saveQuizResponse } from '@/lib/actions';
import type { QuizResponse } from '@/lib/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_BLOCKS = ['Morning', 'Afternoon', 'Evening'];

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalityScores, setPersonalityScores] = useState<number[]>(Array(9).fill(0));
  const [gradeExpectation, setGradeExpectation] = useState<'A' | 'B+' | 'B' | 'Pass'>('A');
  const [internalDeadline, setInternalDeadline] = useState<'Early' | 'OnTime' | 'Late' | 'UnderPressure'>('OnTime');
  const [ambiguityApproach, setAmbiguityApproach] = useState<'Initiative' | 'Propose' | 'Wait' | 'AskInstructor'>('Initiative');
  const [teamResponsiveness, setTeamResponsiveness] = useState<'Immediate' | 'Friendly' | 'Wait' | 'Alert'>('Friendly');
  const [contributionStyle, setContributionStyle] = useState<'Leader' | 'Workhorse' | 'Diplomat' | 'Specialist'>('Workhorse');
  const [responseTime, setResponseTime] = useState<'1-2hrs' | 'SameDay' | '24hrs' | 'FewDays'>('SameDay');
  const [meetingFormat, setMeetingFormat] = useState<'InPerson' | 'Hybrid' | 'VideoOnly' | 'Async'>('Hybrid');
  const [scheduleFullness, setScheduleFullness] = useState<string[]>([]);
  const [availabilityGrid, setAvailabilityGrid] = useState<{
    [day: string]: { morning: boolean; afternoon: boolean; evening: boolean };
  }>({
    Monday: { morning: false, afternoon: false, evening: false },
    Tuesday: { morning: false, afternoon: false, evening: false },
    Wednesday: { morning: false, afternoon: false, evening: false },
    Thursday: { morning: false, afternoon: false, evening: false },
    Friday: { morning: false, afternoon: false, evening: false },
    Saturday: { morning: false, afternoon: false, evening: false },
    Sunday: { morning: false, afternoon: false, evening: false },
  });
  const [scheduleFlexibility, setScheduleFlexibility] = useState<'Very' | 'Somewhat' | 'NotAtAll'>('Somewhat');

  const handlePersonalityScore = (index: number, score: number) => {
    const newScores = [...personalityScores];
    newScores[index] = score;
    setPersonalityScores(newScores);
  };

  const toggleScheduleFullness = (item: string) => {
    setScheduleFullness((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleAvailability = (day: string, timeBlock: string) => {
    setAvailabilityGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeBlock.toLowerCase()]: !prev[day][timeBlock.toLowerCase() as keyof typeof prev[typeof day]],
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    // Calculate Big Five traits from questions
    const personalityProfile = {
      extraversion: ((personalityScores[0] + (6 - personalityScores[5])) / 2), // Q1 + Reverse Q6
      agreeableness: ((personalityScores[2] + (6 - personalityScores[8])) / 2), // Q3 + Reverse Q9
      conscientiousness: ((personalityScores[0] + personalityScores[1] + personalityScores[4] + personalityScores[8]) / 4), // Q1, Q2, Q5, Q9
      neuroticism: ((personalityScores[2] + personalityScores[7]) / 2), // Q3, Q8
      openness: ((personalityScores[3] + personalityScores[6] + (6 - personalityScores[1])) / 3), // Q4, Q7, Reverse Q2
    };

    const response = {
      userId: user.id,
      completedAt: new Date().toISOString(),
      personalityScores,
      gradeExpectation,
      internalDeadline,
      ambiguityApproach,
      teamResponsiveness,
      contributionStyle,
      responseTime,
      meetingFormat,
      scheduleFullness,
      availabilityGrid,
      scheduleFlexibility,
      personalityProfile,
    } as QuizResponse;

    try {
      // TODO: Implement database save later
      // For now, just redirect to the app
      // const success = await saveQuizResponse(response);
      
      // Redirect based on user role
      if (user.role === 'client') {
        router.push('/dashboard');
      } else {
        router.push('/freelancer');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still redirect even if there's an error
      if (user.role === 'client') {
        router.push('/dashboard');
      } else {
        router.push('/freelancer');
      }
    }
  };

  const canProceedToNext =
    currentSection === 1
      ? personalityScores.every((s) => s > 0)
      : currentSection === 2
      ? gradeExpectation && internalDeadline && ambiguityApproach && teamResponsiveness && contributionStyle
      : responseTime && meetingFormat && availabilityGrid && scheduleFlexibility;

  return (
    <div className="min-h-screen bg-gradient-brand page-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-3">
            Group Compatibility & Synergy Quiz
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Discover your work style and find teammates who complement you
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>⏱️ 5–7 minutes</span>
            <span>•</span>
            <span>🔒 100% Confidential</span>
            <span>•</span>
            <span>✨ No wrong answers</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((section) => (
              <div
                key={section}
                className={`h-1 flex-1 rounded-full transition-all ${
                  section <= currentSection
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600'
                    : 'bg-light'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-right">
            Section {currentSection} of 3
          </p>
        </div>

        {/* Section 1: Personality & Dynamics */}
        {currentSection === 1 && (
          <div className="card animate-fadeIn space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Section 1: Personality & Dynamics</h2>
              <p className="text-gray-600">
                Rate how much you agree with each statement (1 = Strongly Disagree, 5 = Strongly Agree)
              </p>
            </div>

            {[
              "I usually take the lead in group discussions and ensure we stay on track with our goals.",
              "I prefer to stick with proven methods and clear rubrics rather than experimenting with unconventional approaches.",
              "When a teammate disagrees with my idea, I prioritize finding a compromise to keep the peace over winning the debate.",
              "I get energized by 'brainstorming sessions' where we can bounce wild, unfinished ideas off one another.",
              "I tend to stay calm and focused even when the group is facing a tight deadline or unexpected setback.",
              "I often wait for others to speak first so I can process their ideas before offering my own perspective.",
              "I am comfortable changing our project's entire direction mid-way if a more creative or effective path emerges.",
              "I feel a high level of anxiety if I don't know exactly what every group member is doing at all times.",
              "I am willing to challenge a teammate's logic if I think it will improve the final quality of our project.",
            ].map((question, idx) => (
              <div key={idx} className="space-y-3">
                <label className="block text-gray-900 font-medium">
                  {idx + 1}. {question}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handlePersonalityScore(idx, score)}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        personalityScores[idx] === score
                          ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                          : 'border-2 border-light text-gray-600 hover:border-accent-300'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Work Style & Academic Standards */}
        {currentSection === 2 && (
          <div className="card animate-fadeIn space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Section 2: Work Style & Standards</h2>
              <p className="text-gray-600">Select the option that best describes your actual habits and expectations</p>
            </div>

            {/* Grade Expectation */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                What is your "Minimum Acceptable" grade for this project?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'A' as const, label: 'A/A+ (I will do extra work to ensure excellence)' },
                  { value: 'B+' as const, label: 'B+/A- (I want a good grade but have other priorities)' },
                  { value: 'B' as const, label: 'B/B+ (I am happy with an average, solid performance)' },
                  { value: 'Pass' as const, label: 'Passing is the primary goal' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGradeExpectation(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      gradeExpectation === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Deadline */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                Which best describes your "Internal Deadline"?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Early' as const, label: 'I finish my parts days early to allow for review' },
                  { value: 'OnTime' as const, label: 'I finish exactly when they are due' },
                  { value: 'Late' as const, label: 'I usually need a small extension or finish right at the buzzer' },
                  { value: 'UnderPressure' as const, label: 'I work best under extreme pressure (the night before)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInternalDeadline(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      internalDeadline === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambiguity Approach */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                When a task is vague or unclear, you:
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Initiative' as const, label: 'Take initiative, figure it out, and start working immediately' },
                  { value: 'Propose' as const, label: 'Propose a potential plan to the group for feedback' },
                  { value: 'Wait' as const, label: 'Wait for a more assertive group member to clarify' },
                  { value: 'AskInstructor' as const, label: 'Reach out to the instructor before doing anything else' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAmbiguityApproach(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      ambiguityApproach === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Responsiveness */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                SCENARIO: A teammate hasn't uploaded their section 24 hours before the deadline. You:
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Immediate' as const, label: 'Do it yourself immediately to ensure it\'s done right' },
                  { value: 'Friendly' as const, label: 'Send a friendly check-in message offering help' },
                  { value: 'Wait' as const, label: 'Wait—it\'s their grade too; they\'ll get it done' },
                  { value: 'Alert' as const, label: 'Immediately alert the instructor that the member is non-responsive' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTeamResponsiveness(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      teamResponsiveness === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contribution Style */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                In past projects, how would teammates likely describe your contribution?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Leader' as const, label: 'The "Leader" who managed everyone' },
                  { value: 'Workhorse' as const, label: 'The "Workhorse" who did a lot of the heavy lifting' },
                  { value: 'Diplomat' as const, label: 'The "Diplomat" who kept everyone happy and bridged gaps' },
                  { value: 'Specialist' as const, label: 'The "Specialist" who did exactly what was asked' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContributionStyle(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      contributionStyle === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Scheduling & Communication */}
        {currentSection === 3 && (
          <div className="card animate-fadeIn space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Section 3: Scheduling & Communication</h2>
              <p className="text-gray-600">Let's get practical about when and how you actually work</p>
            </div>

            {/* Response Time */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                What is your preferred "Response Time" for group messages?
              </label>
              <div className="space-y-2">
                {[
                  { value: '1-2hrs' as const, label: 'Within 1–2 hours (I\'m always connected)' },
                  { value: 'SameDay' as const, label: 'Same day (I check in the evenings)' },
                  { value: '24hrs' as const, label: 'Within 24 hours' },
                  { value: 'FewDays' as const, label: 'Every few days or only when working on the project' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setResponseTime(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      responseTime === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Format */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                Which meeting format do you find most productive?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'InPerson' as const, label: 'In-Person (on campus)' },
                  { value: 'Hybrid' as const, label: 'Hybrid (mostly online, but 1-2 key in-person meetings)' },
                  { value: 'VideoOnly' as const, label: 'Video Calls only (Zoom/Teams)' },
                  { value: 'Async' as const, label: 'Asynchronous only (shared docs/chat; no live meetings)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMeetingFormat(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      meetingFormat === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Fullness */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                Outside of this class, how "Full" is your plate? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  'I work 20+ hours a week',
                  'I have significant family/caregiving duties',
                  'I am involved in intensive sports/clubs',
                  'I have a long commute (1hr+)',
                  'My schedule is relatively clear',
                ].map((item) => (
                  <label key={item} className="flex items-center gap-3 p-3 rounded-lg border-2 border-light cursor-pointer hover:border-accent-300 transition-all">
                    <input
                      type="checkbox"
                      checked={scheduleFullness.includes(item)}
                      onChange={() => toggleScheduleFullness(item)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-900">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Grid */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                Mark the times you are available to meet/work:
              </label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-light">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Time</th>
                      {DAYS.map((day) => (
                        <th key={day} className="text-center py-2 px-2 font-medium text-gray-700">
                          {day.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_BLOCKS.map((timeBlock) => (
                      <tr key={timeBlock} className="border-b border-light">
                        <td className="py-2 px-2 font-medium text-gray-700">{timeBlock}</td>
                        {DAYS.map((day) => (
                          <td key={`${day}-${timeBlock}`} className="text-center py-2 px-2">
                            <button
                              onClick={() => toggleAvailability(day, timeBlock)}
                              className={`w-6 h-6 rounded border-2 transition-all ${
                                availabilityGrid[day][timeBlock.toLowerCase() as keyof typeof availabilityGrid[typeof day]]
                                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 border-accent-600'
                                  : 'border-light hover:border-accent-300'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schedule Flexibility */}
            <div className="space-y-3">
              <label className="block text-gray-900 font-medium">
                How flexible is your schedule if an emergency meeting is needed?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'Very' as const, label: 'Very—I can shift things around easily' },
                  { value: 'Somewhat' as const, label: 'Somewhat—I can adjust with 24-hour notice' },
                  { value: 'NotAtAll' as const, label: 'Not at all—my schedule is fixed' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScheduleFlexibility(option.value)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      scheduleFlexibility === option.value
                        ? 'border-accent-600 bg-accent-50'
                        : 'border-light hover:border-accent-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <button
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentSection === 1
                ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-600'
                : 'btn-secondary'
            }`}
          >
            ← Previous
          </button>

          {currentSection < 3 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              disabled={!canProceedToNext}
              className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                !canProceedToNext
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-600'
                  : 'btn-primary'
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary px-8 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? 'Completing...' : 'Complete Quiz'}
            </button>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-12 p-4 bg-primary-50 border border-primary-200 rounded-lg text-sm text-gray-700 text-center">
          🔒 <strong>Privacy Note:</strong> Your individual answers are confidential and used only for matching purposes.
          There are no "right" or "wrong" answers—honesty ensures a smoother collaboration for everyone!
        </div>
      </div>
    </div>
  );
}
