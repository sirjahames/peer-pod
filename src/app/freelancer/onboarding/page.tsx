'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  savePersonalityAssessment,
  saveSkills,
  saveAvailability,
  completeOnboarding,
} from '@/lib/actions';
import { PERSONALITY_QUESTIONS, AVAILABLE_SKILLS, TIMEZONES } from '@/lib/constants';
import { SkillEntry } from '@/lib/types';

type Step = 'personality' | 'skills' | 'availability';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('personality');

  // Personality state
  const [answers, setAnswers] = useState<number[]>(Array(20).fill(3));

  // Skills state
  const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>([]);

  // Availability state
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [timezone, setTimezone] = useState('UTC+0');

  const handlePersonalitySubmit = async () => {
    if (!user) return;
    await savePersonalityAssessment(user.id, answers);
    setStep('skills');
  };

  const handleSkillsSubmit = async () => {
    if (!user) return;
    await saveSkills(user.id, selectedSkills);
    setStep('availability');
  };

  const handleAvailabilitySubmit = async () => {
    if (!user) return;
    await saveAvailability(user.id, { hoursPerWeek, timezone });
    await completeOnboarding(user.id);
    router.push('/freelancer');
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
      selectedSkills.map((s) =>
        s.skill === skill ? { ...s, proficiency } : s
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          {(['personality', 'skills', 'availability'] as const).map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                step === s
                  ? 'bg-black'
                  : i < ['personality', 'skills', 'availability'].indexOf(step)
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold">
          {step === 'personality' && 'Personality Assessment'}
          {step === 'skills' && 'Your Skills'}
          {step === 'availability' && 'Your Availability'}
        </h1>
      </div>

      {step === 'personality' && (
        <div>
          <p className="text-gray-600 mb-6">
            Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)
          </p>
          <div className="space-y-6">
            {PERSONALITY_QUESTIONS.map((q, index) => (
              <div key={q.id} className="border-b pb-4">
                <p className="mb-2">{q.text}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        const newAnswers = [...answers];
                        newAnswers[index] = value;
                        setAnswers(newAnswers);
                      }}
                      className={`w-10 h-10 rounded-full border transition ${
                        answers[index] === value
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handlePersonalitySubmit}
            className="mt-8 w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'skills' && (
        <div>
          <p className="text-gray-600 mb-6">
            Select your skills and rate your proficiency (1-5)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {AVAILABLE_SKILLS.map((skill) => {
              const selected = selectedSkills.find((s) => s.skill === skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 text-sm border rounded transition ${
                    selected
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>

          {selectedSkills.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Set proficiency levels:</h3>
              {selectedSkills.map((entry) => (
                <div key={entry.skill} className="flex items-center gap-4">
                  <span className="w-32">{entry.skill}</span>
                  <div className="flex gap-1">
                    {([1, 2, 3, 4, 5] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateProficiency(entry.skill, level)}
                        className={`w-8 h-8 rounded border text-sm transition ${
                          entry.proficiency === level
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSkillsSubmit}
            disabled={selectedSkills.length === 0}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'availability' && (
        <div>
          <div className="mb-6">
            <label className="block font-medium mb-2">
              Hours per week you can work
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-center mt-2 text-xl font-bold">{hoursPerWeek} hours</p>
          </div>

          <div className="mb-8">
            <label className="block font-medium mb-2">Your timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAvailabilitySubmit}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
}
