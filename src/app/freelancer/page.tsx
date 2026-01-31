'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getFreelancerProfile,
  getFreelancerApplications,
  getFreelancerGroups,
  getProject,
} from '@/lib/actions';
import { Application, Group, Project } from '@/lib/types';

export default function FreelancerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<
    { application: Application; project: Project }[]
  >([]);
  const [groups, setGroups] = useState<{ group: Group; project: Project }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      // TODO: Enable quiz completion check when database is implemented
      // const profile = await getFreelancerProfile(user.id);
      // if (!profile?.onboardingComplete) {
      //   router.push('/quiz');
      //   return;
      // }

      const apps = await getFreelancerApplications(user.id);
      const appsWithProjects = await Promise.all(
        apps.map(async (app) => {
          const project = await getProject(app.projectId);
          return { application: app, project: project! };
        })
      );
      setApplications(appsWithProjects.filter((a) => a.project));

      const userGroups = await getFreelancerGroups(user.id);
      const groupsWithProjects = await Promise.all(
        userGroups.map(async (group) => {
          const project = await getProject(group.projectId);
          return { group, project: project! };
        })
      );
      setGroups(groupsWithProjects.filter((g) => g.project));

      setLoading(false);
    }
    loadData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-brand page-container">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 animate-fadeIn">
            <div className="h-10 bg-gradient-to-r from-primary-300 to-accent-300 rounded-lg w-64 loading-shimmer mb-4"></div>
            <div className="h-6 bg-light rounded-lg w-48 loading-shimmer"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
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
        {/* Welcome header */}
        <div className="section-md animate-fadeIn">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome, <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{user?.name}</span>
              </h1>
              <p className="text-gray-600 mt-1">Find your perfect team and collaborate on amazing projects</p>
            </div>
          </div>
        </div>

        {/* Stats and CTA */}
        <div className="grid md:grid-cols-3 gap-6 section-md">
          <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-2">
              {groups.length}
            </div>
            <p className="text-gray-600">Active Teams</p>
          </div>
          <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent mb-2">
              {applications.length}
            </div>
            <p className="text-gray-600">Pending Applications</p>
          </div>
          <div className="card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/freelancer/discover"
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Find Projects</span>
            </Link>
          </div>
        </div>

        {/* Groups Section */}
        <section className="section-md">
          <div className="flex items-center justify-between mb-6 animate-slideInLeft">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Teams</h2>
              <p className="text-gray-600 text-sm mt-1">Active projects you&apos;re collaborating on</p>
            </div>
            {groups.length > 0 && (
              <Link href="/freelancer/groups" className="btn-ghost">
                View All
              </Link>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="card text-center py-16 animate-fadeIn">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-600 text-lg mb-2">No teams yet</p>
              <p className="text-gray-500 mb-6">Start applying to projects and join amazing teams</p>
              <Link
                href="/freelancer/discover"
                className="btn-primary inline-block"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover Projects
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map(({ group, project }, idx) => (
                <Link
                  key={group.id}
                  href={`/freelancer/groups/${group.id}`}
                  className="card-interactive group animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-accent-600 line-clamp-2 flex-1">
                      {project.title}
                    </h3>
                    <span className="badge-success flex-shrink-0">
                      <span className="pulse-dot"></span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-light/50">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
                      </svg>
                      {group.members.length} members
                    </span>
                    <span className="text-xs font-semibold text-accent-600">
                      Due {project.dueDate}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Applications Section */}
        <section>
          <div className="flex items-center justify-between mb-6 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
              <p className="text-gray-600 text-sm mt-1">Track the status of your project applications</p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="card text-center py-16 animate-fadeIn">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-600 text-lg mb-2">No pending applications</p>
              <p className="text-gray-500 mb-6">Apply to projects to get started with collaboration</p>
              <Link
                href="/freelancer/discover"
                className="btn-primary inline-block"
              >
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map(({ application, project }, idx) => (
                <div
                  key={application.id}
                  className="card group animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                      {project.title}
                    </h3>
                    <span className="badge-pending flex-shrink-0">
                      <span className="pulse-dot"></span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.requiredSkills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.requiredSkills.length > 2 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-light text-gray-600">
                        +{project.requiredSkills.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-light/50 text-xs text-gray-600">
                    <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-accent-600">
                      {project.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
