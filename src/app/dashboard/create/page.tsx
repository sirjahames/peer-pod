"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createProject } from "@/lib/actions";
import { AVAILABLE_SKILLS } from "@/lib/constants";
import { JobType, ExperienceLevel, PaymentType, WorkLocation } from "@/lib/types";

export default function CreateProjectPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Basic info
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
    const [teamSize, setTeamSize] = useState(3);
    const [dueDate, setDueDate] = useState("");
    const [isOpen, setIsOpen] = useState(true);

    // Job details
    const [jobType, setJobType] = useState<JobType>("project-based");
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("intermediate");
    const [paymentType, setPaymentType] = useState<PaymentType>("hourly");
    const [paymentAmount, setPaymentAmount] = useState<number>(50);
    const [paymentMax, setPaymentMax] = useState<number | undefined>(undefined);
    const [workLocation, setWorkLocation] = useState<WorkLocation>("remote");
    const [location, setLocation] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");

    // Details lists
    const [responsibilities, setResponsibilities] = useState("");
    const [requirements, setRequirements] = useState("");
    const [benefits, setBenefits] = useState("");

    const [loading, setLoading] = useState(false);

    const toggleSkill = (skill: string) => {
        if (requiredSkills.includes(skill)) {
            setRequiredSkills(requiredSkills.filter((s) => s !== skill));
        } else {
            setRequiredSkills([...requiredSkills, skill]);
        }
    };

    const parseListInput = (text: string): string[] => {
        return text
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        await createProject(user.id, {
            title,
            description,
            requiredSkills,
            teamSize,
            dueDate,
            isOpen,
            jobType,
            experienceLevel,
            paymentType,
            paymentAmount,
            paymentMax: paymentMax || undefined,
            workLocation,
            location: location || undefined,
            estimatedDuration: estimatedDuration || undefined,
            responsibilities: parseListInput(responsibilities),
            requirements: parseListInput(requirements),
            benefits: parseListInput(benefits),
        });

        router.push("/dashboard");
    };

    const jobTypeOptions: { value: JobType; label: string }[] = [
        { value: "project-based", label: "Project-Based" },
        { value: "contract", label: "Contract" },
        { value: "freelance", label: "Freelance" },
        { value: "part-time", label: "Part-Time" },
        { value: "full-time", label: "Full-Time" },
    ];

    const experienceLevelOptions: { value: ExperienceLevel; label: string }[] = [
        { value: "entry", label: "Entry Level" },
        { value: "intermediate", label: "Intermediate" },
        { value: "senior", label: "Senior" },
        { value: "expert", label: "Expert" },
    ];

    const paymentTypeOptions: { value: PaymentType; label: string }[] = [
        { value: "hourly", label: "Hourly Rate" },
        { value: "fixed", label: "Fixed Price" },
        { value: "milestone", label: "Milestone-Based" },
        { value: "negotiable", label: "Negotiable" },
    ];

    const workLocationOptions: { value: WorkLocation; label: string }[] = [
        { value: "remote", label: "Remote" },
        { value: "hybrid", label: "Hybrid" },
        { value: "onsite", label: "On-Site" },
    ];

    return (
        <div className="min-h-screen bg-gradient-brand page-container">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-8">
                    Create New Project
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">📋 Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block font-medium mb-1">
                                    Project Title *
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., E-commerce Platform Development"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block font-medium mb-1">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Describe your project, goals, and what you're looking for..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Required Skills *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {AVAILABLE_SKILLS.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-3 py-2 text-sm border rounded transition ${
                                                requiredSkills.includes(skill)
                                                    ? "bg-black text-white border-black"
                                                    : "border-gray-300 hover:border-black"
                                            }`}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">💼 Job Details</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jobType" className="block font-medium mb-1">
                                    Job Type
                                </label>
                                <select
                                    id="jobType"
                                    value={jobType}
                                    onChange={(e) => setJobType(e.target.value as JobType)}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                                    {jobTypeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="experienceLevel" className="block font-medium mb-1">
                                    Experience Level
                                </label>
                                <select
                                    id="experienceLevel"
                                    value={experienceLevel}
                                    onChange={(e) =>
                                        setExperienceLevel(e.target.value as ExperienceLevel)
                                    }
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                                    {experienceLevelOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="workLocation" className="block font-medium mb-1">
                                    Work Location
                                </label>
                                <select
                                    id="workLocation"
                                    value={workLocation}
                                    onChange={(e) =>
                                        setWorkLocation(e.target.value as WorkLocation)
                                    }
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                                    {workLocationOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="location" className="block font-medium mb-1">
                                    Location {workLocation !== "remote" && "*"}
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., San Francisco, CA"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    required={workLocation !== "remote"}
                                />
                            </div>

                            <div>
                                <label htmlFor="teamSize" className="block font-medium mb-1">
                                    Team Size *
                                </label>
                                <input
                                    id="teamSize"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(Number(e.target.value))}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="estimatedDuration"
                                    className="block font-medium mb-1">
                                    Estimated Duration
                                </label>
                                <input
                                    id="estimatedDuration"
                                    type="text"
                                    value={estimatedDuration}
                                    onChange={(e) => setEstimatedDuration(e.target.value)}
                                    placeholder="e.g., 3-6 months"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="dueDate" className="block font-medium mb-1">
                                    Due Date *
                                </label>
                                <input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">💰 Payment</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium mb-2">Payment Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {paymentTypeOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPaymentType(opt.value)}
                                            className={`px-3 py-2 text-sm border rounded-lg transition ${
                                                paymentType === opt.value
                                                    ? "bg-black text-white border-black"
                                                    : "border-gray-300 hover:border-black"
                                            }`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {paymentType !== "negotiable" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="paymentAmount"
                                            className="block font-medium mb-1">
                                            {paymentType === "hourly"
                                                ? "Hourly Rate ($)"
                                                : paymentType === "fixed"
                                                  ? "Project Budget ($)"
                                                  : "Base Amount ($)"}
                                        </label>
                                        <input
                                            id="paymentAmount"
                                            type="number"
                                            min="0"
                                            value={paymentAmount}
                                            onChange={(e) =>
                                                setPaymentAmount(Number(e.target.value))
                                            }
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>

                                    {paymentType === "hourly" && (
                                        <div>
                                            <label
                                                htmlFor="paymentMax"
                                                className="block font-medium mb-1">
                                                Max Rate ($) - Optional
                                            </label>
                                            <input
                                                id="paymentMax"
                                                type="number"
                                                min="0"
                                                value={paymentMax || ""}
                                                onChange={(e) =>
                                                    setPaymentMax(
                                                        e.target.value
                                                            ? Number(e.target.value)
                                                            : undefined,
                                                    )
                                                }
                                                placeholder="Leave blank for single rate"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-gray-600">
                                {paymentType === "hourly" && paymentMax
                                    ? `Freelancers will see: $${paymentAmount} - $${paymentMax}/hour`
                                    : paymentType === "hourly"
                                      ? `Freelancers will see: $${paymentAmount}/hour`
                                      : paymentType === "fixed"
                                        ? `Freelancers will see: $${paymentAmount.toLocaleString()} fixed price`
                                        : paymentType === "milestone"
                                          ? `Freelancers will see: $${paymentAmount.toLocaleString()} milestone-based`
                                          : "Freelancers will see: Payment negotiable"}
                            </p>
                        </div>
                    </div>

                    {/* Responsibilities, Requirements & Benefits Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">📝 Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="responsibilities"
                                    className="block font-medium mb-1">
                                    Key Responsibilities
                                </label>
                                <textarea
                                    id="responsibilities"
                                    value={responsibilities}
                                    onChange={(e) => setResponsibilities(e.target.value)}
                                    rows={4}
                                    placeholder="Enter each responsibility on a new line:&#10;Build responsive user interfaces&#10;Collaborate with backend developers&#10;Write clean, maintainable code"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="requirements" className="block font-medium mb-1">
                                    Requirements
                                </label>
                                <textarea
                                    id="requirements"
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    rows={4}
                                    placeholder="Enter each requirement on a new line:&#10;3+ years of experience with React&#10;Strong understanding of TypeScript&#10;Portfolio of relevant projects"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="benefits" className="block font-medium mb-1">
                                    Benefits & Perks
                                </label>
                                <textarea
                                    id="benefits"
                                    value={benefits}
                                    onChange={(e) => setBenefits(e.target.value)}
                                    rows={3}
                                    placeholder="Enter each benefit on a new line:&#10;Flexible working hours&#10;Long-term collaboration opportunity&#10;Performance bonuses"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visibility Section */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">👁️ Visibility</h2>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className={`flex-1 py-3 border rounded-lg transition ${
                                    isOpen
                                        ? "border-black bg-black text-white"
                                        : "border-gray-300 hover:border-black"
                                }`}>
                                🌐 Open Listing
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={`flex-1 py-3 border rounded-lg transition ${
                                    !isOpen
                                        ? "border-black bg-black text-white"
                                        : "border-gray-300 hover:border-black"
                                }`}>
                                🔒 Join Code Only
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {isOpen
                                ? "Your project will be visible to all freelancers in the discover feed"
                                : "Freelancers will need the join code to find your project"}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || requiredSkills.length === 0}
                        className="w-full py-4 bg-gradient-to-r from-accent-600 to-primary-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition text-lg font-semibold">
                        {loading ? "Creating Project..." : "🚀 Create Project"}
                    </button>
                </form>
            </div>
        </div>
    );
}
