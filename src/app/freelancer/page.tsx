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

      const profile = await getFreelancerProfile(user.id);
      if (!profile?.onboardingComplete) {
        router.push('/freelancer/onboarding');
        return;
      }

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
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
        {groups.length === 0 ? (
          <p className="text-gray-600">
            You haven&apos;t joined any groups yet.{' '}
            <Link href="/freelancer/discover" className="underline">
              Discover projects
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map(({ group, project }) => (
              <Link
                key={group.id}
                href={`/freelancer/groups/${group.id}`}
                className="p-4 border rounded-lg hover:border-black transition"
              >
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Due: {project.dueDate}
                </p>
                <p className="text-sm text-gray-600">
                  {group.members.length} team members
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-600">
            No pending applications.{' '}
            <Link href="/freelancer/discover" className="underline">
              Browse open projects
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map(({ application, project }) => (
              <div
                key={application.id}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Applied: {new Date(application.appliedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {project.isOpen ? 'Pending' : 'Closed'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
