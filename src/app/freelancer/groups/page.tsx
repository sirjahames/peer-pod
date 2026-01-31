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
        return <p>Loading groups...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Your Groups</h1>

            {groups.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven&apos;t joined any groups yet.</p>
                    <Link
                        href="/freelancer/discover"
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition inline-block">
                        Discover Projects
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {groups.map(({ group, project, status }) => (
                        <Link
                            key={group.id}
                            href={`/freelancer/groups/${group.id}`}
                            className="p-6 border rounded-lg hover:border-black transition">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-semibold">{project.title}</h2>
                                <span
                                    className={`px-2 py-1 text-xs rounded ${
                                        status === "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : status === "OPEN"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-gray-100 text-gray-700"
                                    }`}>
                                    {status}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>{group.members.length} members</span>
                                <span>Due: {project.dueDate}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
