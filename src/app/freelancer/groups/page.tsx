"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getFreelancerGroups, getProject, computeGroupStatus } from "@/lib/actions";
import { Group, Project, GroupStatus } from "@/lib/types";

interface GroupWithProject {
    group: Group;
    project: Project;
    status: GroupStatus;
}

export default function GroupsPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<GroupWithProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadGroups() {
            if (!user) return;

            const userGroups = await getFreelancerGroups(user.id);
            const groupsWithProjects = await Promise.all(
                userGroups.map(async (group) => {
                    const project = await getProject(group.projectId);
                    const status = project ? await computeGroupStatus(group, project) : "CLOSED";
                    return { group, project: project!, status };
                }),
            );

            setGroups(groupsWithProjects.filter((g) => g.project));
            setLoading(false);
        }
        loadGroups();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto">
                    <div className="h-10 bg-gradient-to-r from-primary-300 to-accent-300 rounded-lg w-48 loading-shimmer mb-8"></div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card loading-shimmer h-40"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-brand page-container">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-8">Your Groups</h1>

            {groups.length === 0 ? (
                <div className="card text-center py-16 animate-fadeIn">
                    <div className="text-5xl mb-4">👥</div>
                    <p className="text-gray-600 text-lg mb-2">No groups yet</p>
                    <p className="text-gray-500 mb-6">Start applying to projects and join amazing teams</p>
                    <Link
                        href="/freelancer/discover"
                        className="btn-primary inline-block">
                        Discover Projects
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map(({ group, project, status }, idx) => (
                        <Link
                            key={group.id}
                            href={`/freelancer/groups/${group.id}`}
                            className="card-interactive group animate-fadeIn"
                            style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-accent-600">{project.title}</h2>
                                <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        status === "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : status === "OPEN"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {status}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                            <div className="flex gap-4 text-sm text-gray-600 pt-4 border-t border-light/50">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
                                    </svg>
                                    {group.members.length} members
                                </span>
                                <span className="text-accent-600 font-medium">Due: {project.dueDate}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
