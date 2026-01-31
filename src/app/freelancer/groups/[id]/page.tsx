"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
    getGroup,
    getProject,
    getGroupTasks,
    getGroupMessages,
    getUsers,
    getFreelancerProfile,
    updateTask,
    sendMessage,
    computeGroupStatus,
} from "@/lib/actions";
import {
    Group,
    Project,
    Task,
    ChatMessage,
    User,
    GroupStatus,
    FreelancerProfile,
} from "@/lib/types";

export default function GroupDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [group, setGroup] = useState<Group | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [profiles, setProfiles] = useState<Map<string, FreelancerProfile>>(new Map());
    const [status, setStatus] = useState<GroupStatus>("ACTIVE");
    const [newMessage, setNewMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"tasks" | "chat">("tasks");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadData() {
            const groupData = await getGroup(id);
            if (!groupData) return;
            setGroup(groupData);

            const projectData = await getProject(groupData.projectId);
            if (!projectData) return;
            setProject(projectData);

            const computedStatus = await computeGroupStatus(groupData, projectData);
            setStatus(computedStatus);

            const [tasksData, messagesData, membersData] = await Promise.all([
                getGroupTasks(id),
                getGroupMessages(id),
                getUsers(groupData.members),
            ]);

            setTasks(tasksData);
            setMessages(messagesData);
            setMembers(membersData);

            const profilesMap = new Map<string, FreelancerProfile>();
            for (const member of groupData.members) {
                const profile = await getFreelancerProfile(member);
                if (profile) profilesMap.set(member, profile);
            }
            setProfiles(profilesMap);

            setLoading(false);
        }
        loadData();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        if (status === "CLOSED") return;
        await updateTask(taskId, { completed: !completed });
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t)));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim() || status === "CLOSED") return;

        const message = await sendMessage(id, user.id, newMessage.trim());
        setMessages([...messages, message]);
        setNewMessage("");
    };

    const getMemberName = (userId: string) =>
        members.find((m) => m.id === userId)?.name || "Unknown";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto">
                    <div className="h-10 bg-gradient-to-r from-primary-300 to-accent-300 rounded-lg w-64 loading-shimmer mb-4"></div>
                    <div className="h-6 bg-light rounded-lg w-48 loading-shimmer mb-8"></div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 card loading-shimmer h-64"></div>
                        <div className="card loading-shimmer h-64"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!group || !project) {
        return (
            <div className="min-h-screen bg-gradient-brand page-container">
                <div className="max-w-7xl mx-auto text-center py-12">
                    <p className="text-gray-600">Group not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-brand page-container">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{project.title}</h1>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                status === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : status === "OPEN"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                            }`}>
                            {status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Due: {project.dueDate}</p>
                </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab("tasks")}
                            className={`px-4 py-2 rounded-lg transition ${
                                activeTab === "tasks"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                            }`}>
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`px-4 py-2 rounded-lg transition ${
                                activeTab === "chat"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                            }`}>
                            Chat
                        </button>
                    </div>

                    {activeTab === "tasks" && (
                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <p className="text-gray-600">No tasks assigned yet.</p>
                            ) : (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-4 border rounded-lg ${
                                            task.completed ? "bg-gray-50" : ""
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() =>
                                                    handleToggleTask(task.id, task.completed)
                                                }
                                                disabled={status === "CLOSED"}
                                                className={`mt-1 w-5 h-5 border-2 rounded flex-shrink-0 ${
                                                    task.completed
                                                        ? "bg-black border-black text-white"
                                                        : "border-gray-300"
                                                } ${status === "CLOSED" ? "opacity-50 cursor-not-allowed" : ""}`}>
                                                {task.completed && "✓"}
                                            </button>
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
                                                        Assigned to:{" "}
                                                        {getMemberName(task.assignedTo)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="border rounded-lg">
                            <div className="h-96 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <p className="text-gray-600 text-center py-8">
                                        No messages yet. Start the conversation!
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`${
                                                msg.userId === user?.id ? "text-right" : ""
                                            }`}>
                                            <div
                                                className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                                                    msg.userId === user?.id
                                                        ? "bg-black text-white"
                                                        : "bg-gray-100"
                                                }`}>
                                                <p className="text-xs opacity-70 mb-1">
                                                    {getMemberName(msg.userId)}
                                                </p>
                                                <p>{msg.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            {status !== "CLOSED" ? (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="border-t p-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
                                        Send
                                    </button>
                                </form>
                            ) : (
                                <div className="border-t p-4 text-center text-gray-500">
                                    Chat is disabled for closed groups
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="font-semibold mb-4">Team Members</h2>
                    <div className="space-y-4">
                        {members.map((member) => {
                            const profile = profiles.get(member.id);
                            return (
                                <div key={member.id} className="card">
                                    <p className="font-medium text-gray-900">{member.name}</p>
                                    {profile && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {profile.skills.slice(0, 3).map((s) => (
                                                <span
                                                    key={s.skill}
                                                    className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs rounded-full">
                                                    {s.skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
