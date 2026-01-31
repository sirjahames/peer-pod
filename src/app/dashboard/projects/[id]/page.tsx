"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    getProject,
    getRankedCandidates,
    getTeamSuggestions,
    getUsers,
    getFreelancerProfile,
    getProjectGroup,
    getGroupTasks,
    createGroup,
    updateProject,
    deleteProject,
    computeGroupStatus,
} from "@/lib/actions";
import {
    Project,
    User,
    FreelancerProfile,
    Group,
    Task,
    GroupStatus,
    JobType,
    ExperienceLevel,
    PaymentType,
    WorkLocation,
} from "@/lib/types";
import { AVAILABLE_SKILLS } from "@/lib/constants";

interface CandidateWithData {
    user: User;
    profile: FreelancerProfile;
    projectScore: number;
    avgMemberScore: number;
    totalScore: number;
}

interface TeamSuggestion {
    members: string[];
    avgScore: number;
}

interface MemberWithProfile {
    user: User;
    profile: FreelancerProfile;
}

const formatPayment = (project: Project): string => {
    if (project.paymentType === "negotiable" || !project.paymentType) return "Negotiable";
    if (project.paymentType === "hourly") {
        if (project.paymentMax) {
            return `$${project.paymentAmount} - $${project.paymentMax}/hr`;
        }
        return `$${project.paymentAmount}/hr`;
    }
    if (project.paymentType === "fixed") {
        return `$${project.paymentAmount?.toLocaleString()} fixed`;
    }
    if (project.paymentType === "milestone") {
        return `$${project.paymentAmount?.toLocaleString()} milestone`;
    }
    return "Contact for pricing";
};

const formatJobType = (type?: string): string => {
    const labels: Record<string, string> = {
        "project-based": "Project-Based",
        contract: "Contract",
        freelance: "Freelance",
        "part-time": "Part-Time",
        "full-time": "Full-Time",
    };
    return labels[type || ""] || "Project-Based";
};

const formatExperience = (level?: string): string => {
    const labels: Record<string, string> = {
        entry: "Entry Level",
        intermediate: "Intermediate",
        senior: "Senior",
        expert: "Expert",
    };
    return labels[level || ""] || "Any Level";
};

const formatLocation = (project: Project): string => {
    if (project.workLocation === "remote" || !project.workLocation) return "Remote";
    if (project.workLocation === "hybrid")
        return `Hybrid${project.location ? ` - ${project.location}` : ""}`;
    return project.location || "On-Site";
};

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [candidates, setCandidates] = useState<CandidateWithData[]>([]);
    const [suggestions, setSuggestions] = useState<TeamSuggestion[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [existingGroup, setExistingGroup] = useState<Group | null>(null);
    const [groupStatus, setGroupStatus] = useState<GroupStatus>("ACTIVE");
    const [teamMembers, setTeamMembers] = useState<MemberWithProfile[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [forming, setForming] = useState(false);
    const [activeTab, setActiveTab] = useState<"candidates" | "settings">("candidates");
    const [teamTab, setTeamTab] = useState<"members" | "tasks" | "settings">("members");

    // Edit form state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editSkills, setEditSkills] = useState<string[]>([]);
    const [editTeamSize, setEditTeamSize] = useState(3);
    const [editDueDate, setEditDueDate] = useState("");
    const [editIsOpen, setEditIsOpen] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function loadData() {
            const projectData = await getProject(id);
            if (!projectData) return;
            setProject(projectData);
            setEditTitle(projectData.title);
            setEditDescription(projectData.description);
            setEditSkills(projectData.requiredSkills);
            setEditTeamSize(projectData.teamSize);
            setEditDueDate(projectData.dueDate);
            setEditIsOpen(projectData.isOpen);

            const group = await getProjectGroup(id);
            setExistingGroup(group);

            if (group) {
                const status = await computeGroupStatus(group, projectData);
                setGroupStatus(status);

                const members = await getUsers(group.members);
                const membersWithProfiles = await Promise.all(
                    members.map(async (user) => {
                        const profile = await getFreelancerProfile(user.id);
                        return { user, profile: profile! };
                    }),
                );
                setTeamMembers(membersWithProfiles.filter((m) => m.profile));

                const groupTasks = await getGroupTasks(group.id);
                setTasks(groupTasks);

                setLoading(false);
                return;
            }

            const ranked = await getRankedCandidates(id);
            const users = await getUsers(ranked.map((r) => r.freelancerId));

            const candidatesData = await Promise.all(
                ranked.map(async (r) => {
                    const user = users.find((u) => u.id === r.freelancerId);
                    const profile = await getFreelancerProfile(r.freelancerId);
                    return {
                        user: user!,
                        profile: profile!,
                        projectScore: r.projectScore,
                        avgMemberScore: r.avgMemberScore,
                        totalScore: r.totalScore,
                    };
                }),
            );

            setCandidates(candidatesData.filter((c) => c.user && c.profile));

            const teamSuggestions = await getTeamSuggestions(id);
            setSuggestions(teamSuggestions);

            setLoading(false);
        }
        loadData();
    }, [id]);

    const toggleMember = (userId: string) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter((m) => m !== userId));
        } else if (selectedMembers.length < (project?.teamSize || 10)) {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const selectSuggestion = (members: string[]) => {
        setSelectedMembers(members);
    };

    const handleFormTeam = async () => {
        if (selectedMembers.length === 0) return;
        setForming(true);
        await createGroup(id, selectedMembers);
        router.refresh();
        window.location.reload();
    };

    const toggleEditSkill = (skill: string) => {
        if (editSkills.includes(skill)) {
            setEditSkills(editSkills.filter((s) => s !== skill));
        } else {
            setEditSkills([...editSkills, skill]);
        }
    };

    const handleSaveProject = async () => {
        setSaving(true);
        const updated = await updateProject(id, {
            title: editTitle,
            description: editDescription,
            requiredSkills: editSkills,
            teamSize: editTeamSize,
            dueDate: editDueDate,
            isOpen: editIsOpen,
        });
        if (updated) {
            setProject(updated);
            setIsEditing(false);
        }
        setSaving(false);
    };

    const handleDeleteProject = async () => {
        if (!confirm("Are you sure you want to delete this project? This cannot be undone."))
            return;
        setDeleting(true);
        await deleteProject(id);
        router.push("/dashboard");
    };

    const getMemberName = (userId: string) =>
        teamMembers.find((m) => m.user.id === userId)?.user.name || "Unknown";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto">
                    <div className="h-10 bg-gradient-to-r from-primary-300 to-accent-300 rounded-lg w-64 loading-shimmer mb-8"></div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card loading-shimmer h-48"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto text-center py-12">
                    <p className="text-gray-600">Project not found</p>
                </div>
            </div>
        );
    }

    // Team has been formed - show team management view
    if (existingGroup) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard" className="text-gray-500 hover:text-accent-600 transition">
                                ← Back
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{project.title}</h1>
                        <p className="text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                            groupStatus === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : groupStatus === "OPEN"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}>
                        {groupStatus}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="text-2xl font-bold">{existingGroup.members.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="text-2xl font-bold">{project.dueDate}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tasks</p>
                        <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold">
                            {tasks.filter((t) => t.completed).length}/{tasks.length}
                        </p>
                    </div>
                </div>

                {/* Job Details Summary */}
                <div className="mb-8 p-6 bg-white border rounded-xl">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                            💰 {formatPayment(project)}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                            💼 {formatJobType(project.jobType)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg">
                            📊 {formatExperience(project.experienceLevel)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg">
                            📍 {formatLocation(project)}
                        </span>
                        {project.estimatedDuration && (
                            <span className="px-3 py-1 bg-gray-100 rounded-lg">
                                ⏱️ {project.estimatedDuration}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 mb-6 border-b">
                    {(["members", "tasks", "settings"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setTeamTab(tab)}
                            className={`px-4 py-2 font-medium capitalize transition ${
                                teamTab === tab
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-500 hover:text-black"
                            }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {teamTab === "members" && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map(({ user, profile }) => (
                            <div key={user.id} className="p-6 border rounded-lg">
                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>

                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 uppercase mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-1">
                                        {profile.skills.map((s) => (
                                            <span
                                                key={s.skill}
                                                className="px-2 py-1 bg-gray-100 text-xs rounded">
                                                {s.skill} ({s.proficiency})
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p>{profile.availability.hoursPerWeek} hrs/week</p>
                                    <p>{profile.availability.timezone}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {teamTab === "tasks" && (
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-gray-600">No tasks generated yet.</p>
                        ) : (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`p-4 border rounded-lg ${
                                        task.completed ? "bg-gray-50" : ""
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-1 w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                                                task.completed
                                                    ? "bg-black border-black text-white"
                                                    : "border-gray-300"
                                            }`}>
                                            {task.completed && "✓"}
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className={`font-medium ${
                                                    task.completed
                                                        ? "line-through text-gray-500"
                                                        : ""
                                                }`}>
                                                {task.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {task.description}
                                            </p>
                                            {task.assignedTo && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Assigned to: {getMemberName(task.assignedTo)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {teamTab === "settings" && (
                    <div className="max-w-2xl">
                        <div className="p-6 border rounded-lg mb-6">
                            <h3 className="font-semibold mb-4">Project Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Join Code</span>
                                    <span className="font-mono">{project.joinCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created</span>
                                    <span>{project.createdAt}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span>{project.isOpen ? "Open" : "Closed"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border rounded-lg mb-6">
                            <h3 className="font-semibold mb-4">💼 Job Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Job Type</span>
                                    <p className="font-medium">{formatJobType(project.jobType)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Experience Level</span>
                                    <p className="font-medium">
                                        {formatExperience(project.experienceLevel)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Payment</span>
                                    <p className="font-medium text-green-700">
                                        {formatPayment(project)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Location</span>
                                    <p className="font-medium">{formatLocation(project)}</p>
                                </div>
                                {project.estimatedDuration && (
                                    <div>
                                        <span className="text-gray-600">Duration</span>
                                        <p className="font-medium">{project.estimatedDuration}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border rounded-lg mb-6">
                            <h3 className="font-semibold mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.requiredSkills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 bg-gray-100 rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Responsibilities, Requirements, Benefits */}
                        {(project.responsibilities?.length ||
                            project.requirements?.length ||
                            project.benefits?.length) && (
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                {project.responsibilities &&
                                    project.responsibilities.length > 0 && (
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">
                                                📋 Responsibilities
                                            </h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {project.responsibilities.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-gray-400">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                {project.requirements && project.requirements.length > 0 && (
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">✅ Requirements</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {project.requirements.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-gray-400">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {project.benefits && project.benefits.length > 0 && (
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">🎁 Benefits</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {project.benefits.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-green-500">✓</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                            <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                            <p className="text-sm text-red-600 mb-4">
                                Deleting this project will remove all associated data including the
                                team and tasks.
                            </p>
                            <button
                                onClick={handleDeleteProject}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                                {deleting ? "Deleting..." : "Delete Project"}
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        );
    }

    // No team yet - show candidate selection view
    return (
        <div className="min-h-screen bg-gradient-brand page-container">
            <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="text-gray-500 hover:text-accent-600 transition">
                            ← Back
                        </Link>
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-3xl font-bold w-full border-b-2 border-accent-500 focus:outline-none bg-transparent"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{project.title}</h1>
                    )}
                    {isEditing ? (
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            rows={2}
                        />
                    ) : (
                        <p className="text-gray-600 mt-1">{project.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProject}
                                disabled={saving}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {!isEditing && (
                <>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <span>Team size: {project.teamSize}</span>
                        <span>Due: {project.dueDate}</span>
                        <span>
                            Join code: <strong>{project.joinCode}</strong>
                        </span>
                    </div>

                    {/* Job Details Summary */}
                    <div className="mb-6 p-4 bg-white border rounded-xl">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                                💰 {formatPayment(project)}
                            </span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                                💼 {formatJobType(project.jobType)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-lg">
                                📊 {formatExperience(project.experienceLevel)}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-lg">
                                📍 {formatLocation(project)}
                            </span>
                            {project.estimatedDuration && (
                                <span className="px-3 py-1 bg-gray-100 rounded-lg">
                                    ⏱️ {project.estimatedDuration}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setActiveTab("candidates")}
                    className={`px-4 py-2 font-medium transition ${
                        activeTab === "candidates"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                    }`}>
                    Candidates ({candidates.length})
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-4 py-2 font-medium transition ${
                        activeTab === "settings"
                            ? "border-b-2 border-black text-black"
                            : "text-gray-500 hover:text-black"
                    }`}>
                    Settings
                </button>
            </div>

            {activeTab === "candidates" && (
                <>
                    {candidates.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg">
                            <p className="text-gray-600">No applications yet.</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Share your join code: <strong>{project.joinCode}</strong>
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <div className="space-y-3">
                                    {candidates.map((candidate) => (
                                        <div
                                            key={candidate.user.id}
                                            onClick={() => toggleMember(candidate.user.id)}
                                            className={`p-4 border rounded-lg cursor-pointer transition ${
                                                selectedMembers.includes(candidate.user.id)
                                                    ? "border-black bg-gray-50"
                                                    : "hover:border-gray-400"
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {candidate.user.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {candidate.profile.skills.map((s) => (
                                                            <span
                                                                key={s.skill}
                                                                className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                                                                {s.skill} ({s.proficiency})
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {
                                                            candidate.profile.availability
                                                                .hoursPerWeek
                                                        }{" "}
                                                        hrs/week •{" "}
                                                        {candidate.profile.availability.timezone}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`text-xl font-bold ${
                                                            candidate.totalScore >= 70
                                                                ? "text-green-600"
                                                                : candidate.totalScore >= 50
                                                                  ? "text-yellow-600"
                                                                  : "text-red-600"
                                                        }`}>
                                                        {candidate.totalScore}%
                                                    </div>
                                                    <p className="text-xs text-gray-500">match</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Suggested Teams</h2>
                                <div className="space-y-3 mb-6">
                                    {suggestions.map((suggestion, idx) => {
                                        const memberNames = suggestion.members
                                            .map(
                                                (memberId) =>
                                                    candidates.find((c) => c.user.id === memberId)
                                                        ?.user.name,
                                            )
                                            .filter(Boolean);

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => selectSuggestion(suggestion.members)}
                                                className={`w-full p-3 border rounded-lg text-left transition ${
                                                    JSON.stringify(selectedMembers.sort()) ===
                                                    JSON.stringify(suggestion.members.sort())
                                                        ? "border-black bg-gray-50"
                                                        : "hover:border-gray-400"
                                                }`}>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm">
                                                        {memberNames.join(", ")}
                                                    </div>
                                                    <span className="text-green-600 font-medium">
                                                        {suggestion.avgScore}%
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">
                                        Selected ({selectedMembers.length}/{project.teamSize})
                                    </h3>
                                    <div className="space-y-2 mb-4">
                                        {selectedMembers.map((memberId) => {
                                            const candidate = candidates.find(
                                                (c) => c.user.id === memberId,
                                            );
                                            return (
                                                <div
                                                    key={memberId}
                                                    className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                                    <span className="text-sm">
                                                        {candidate?.user.name}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMember(memberId);
                                                        }}
                                                        className="text-red-600 text-sm hover:underline">
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={handleFormTeam}
                                        disabled={selectedMembers.length === 0 || forming}
                                        className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
                                        {forming ? "Forming Team..." : "Form Team"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === "settings" && (
                <div className="max-w-2xl space-y-6">
                    {isEditing ? (
                        <>
                            <div>
                                <label className="block font-medium mb-2">Required Skills</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {AVAILABLE_SKILLS.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleEditSkill(skill)}
                                            className={`px-3 py-2 text-sm border rounded transition ${
                                                editSkills.includes(skill)
                                                    ? "bg-black text-white border-black"
                                                    : "border-gray-300 hover:border-black"
                                            }`}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1">Team Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={editTeamSize}
                                        onChange={(e) => setEditTeamSize(Number(e.target.value))}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Listing Status</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditIsOpen(true)}
                                        className={`flex-1 py-3 border rounded-lg transition ${
                                            editIsOpen
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300 hover:border-black"
                                        }`}>
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditIsOpen(false)}
                                        className={`flex-1 py-3 border rounded-lg transition ${
                                            !editIsOpen
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300 hover:border-black"
                                        }`}>
                                        Closed
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-6 border rounded-lg">
                                <h3 className="font-semibold mb-4">Project Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Join Code</span>
                                        <span className="font-mono">{project.joinCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Team Size</span>
                                        <span>{project.teamSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Due Date</span>
                                        <span>{project.dueDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created</span>
                                        <span>{project.createdAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <span>{project.isOpen ? "Open" : "Closed"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border rounded-lg">
                                <h3 className="font-semibold mb-4">💼 Job Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Job Type</span>
                                        <p className="font-medium">
                                            {formatJobType(project.jobType)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Experience Level</span>
                                        <p className="font-medium">
                                            {formatExperience(project.experienceLevel)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Payment</span>
                                        <p className="font-medium text-green-700">
                                            {formatPayment(project)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Location</span>
                                        <p className="font-medium">{formatLocation(project)}</p>
                                    </div>
                                    {project.estimatedDuration && (
                                        <div>
                                            <span className="text-gray-600">Duration</span>
                                            <p className="font-medium">
                                                {project.estimatedDuration}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border rounded-lg">
                                <h3 className="font-semibold mb-4">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.requiredSkills.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-gray-100 rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Responsibilities, Requirements, Benefits */}
                            {(project.responsibilities?.length ||
                                project.requirements?.length ||
                                project.benefits?.length) && (
                                <div className="grid md:grid-cols-3 gap-4">
                                    {project.responsibilities &&
                                        project.responsibilities.length > 0 && (
                                            <div className="p-4 border rounded-lg">
                                                <h4 className="font-semibold mb-2">
                                                    📋 Responsibilities
                                                </h4>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {project.responsibilities.map((item, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-2">
                                                            <span className="text-gray-400">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                    {project.requirements && project.requirements.length > 0 && (
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">✅ Requirements</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {project.requirements.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-gray-400">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {project.benefits && project.benefits.length > 0 && (
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">🎁 Benefits</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {project.benefits.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-green-500">✓</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                                <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Deleting this project will remove all associated data.
                                </p>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                                    {deleting ? "Deleting..." : "Delete Project"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            </div>
        </div>
    );
}
