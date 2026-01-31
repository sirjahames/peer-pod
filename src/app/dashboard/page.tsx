'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getClientProjects, getProjectGroup } from '@/lib/actions';
import { Project, Group } from '@/lib/types';

interface ProjectWithGroup {
  project: Project;
  group: Group | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;

      const clientProjects = await getClientProjects(user.id);
      const projectsWithGroups = await Promise.all(
        clientProjects.map(async (project) => ({
          project,
          group: await getProjectGroup(project.id),
        }))
      );

      setProjects(projectsWithGroups);
      setLoading(false);
    }
    loadProjects();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/create"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-600 mb-4">You haven&apos;t created any projects yet.</p>
          <Link
            href="/dashboard/create"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition inline-block"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(({ project, group }) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="p-6 border rounded-lg hover:border-black transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    group
                      ? 'bg-green-100 text-green-700'
                      : project.isOpen
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {group ? 'Team Formed' : project.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-sm rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mt-4 text-sm text-gray-600">
                <span>Team size: {project.teamSize}</span>
                <span>Due: {project.dueDate}</span>
                <span>Join code: {project.joinCode}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
