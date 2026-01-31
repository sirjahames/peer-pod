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
    return (
      <div className="min-h-screen bg-gradient-brand page-container">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center section-md animate-fadeIn">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Dashboard</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card loading-shimmer h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-brand page-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 section-md animate-fadeIn">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your projects and assemble your teams</p>
          </div>
          <Link
            href="/dashboard/create"
            className="btn-primary group whitespace-nowrap"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-20 animate-fadeIn">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-gray-600 mb-6 text-lg">You haven&apos;t created any projects yet.</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Start by creating your first project and build an amazing team around it.</p>
            <Link
              href="/dashboard/create"
              className="btn-primary inline-block"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Project
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(({ project, group }, idx) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="card-interactive animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Status badge */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-accent-600 transition-colors line-clamp-2">
                      {project.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {group ? (
                      <span className="badge-success">
                        <span className="pulse-dot"></span>
                        Team Formed
                      </span>
                    ) : project.isOpen ? (
                      <span className="badge-pending">
                        <span className="pulse-dot"></span>
                        Open
                      </span>
                    ) : (
                      <span className="badge-neutral">
                        Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary-100 to-accent-100 text-gray-700 group-hover:from-primary-200 group-hover:to-accent-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.requiredSkills.length > 3 && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-light text-gray-600">
                      +{project.requiredSkills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer info */}
                <div className="pt-4 border-t border-light/50 flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.teamSize} spots
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {project.dueDate}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
