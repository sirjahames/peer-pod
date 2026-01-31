'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getProjectsWithCompatibility,
  applyToProject,
  hasApplied,
} from '@/lib/actions';
import { Project } from '@/lib/types';
import { AVAILABLE_SKILLS } from '@/lib/constants';

interface ProjectWithScore {
  project: Project;
  compatibility: number;
  applied: boolean;
}

const formatPayment = (project: Project): string => {
  if (project.paymentType === 'negotiable') return 'Negotiable';
  if (project.paymentType === 'hourly') {
    if (project.paymentMax) {
      return `$${project.paymentAmount} - $${project.paymentMax}/hr`;
    }
    return `$${project.paymentAmount}/hr`;
  }
  if (project.paymentType === 'fixed') {
    return `$${project.paymentAmount?.toLocaleString()} fixed`;
  }
  if (project.paymentType === 'milestone') {
    return `$${project.paymentAmount?.toLocaleString()} milestone`;
  }
  return 'Contact for pricing';
};

const formatJobType = (type?: string): string => {
  const labels: Record<string, string> = {
    'project-based': 'Project-Based',
    'contract': 'Contract',
    'freelance': 'Freelance',
    'part-time': 'Part-Time',
    'full-time': 'Full-Time',
  };
  return labels[type || ''] || 'Project-Based';
};

const formatExperience = (level?: string): string => {
  const labels: Record<string, string> = {
    'entry': 'Entry Level',
    'intermediate': 'Intermediate',
    'senior': 'Senior',
    'expert': 'Expert',
  };
  return labels[level || ''] || 'Any Level';
};

const formatLocation = (project: Project): string => {
  if (project.workLocation === 'remote') return '🌍 Remote';
  if (project.workLocation === 'hybrid') return `🏢 Hybrid${project.location ? ` - ${project.location}` : ''}`;
  return `📍 ${project.location || 'On-Site'}`;
};

export default function DiscoverPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;

      const projectsWithScore = await getProjectsWithCompatibility(user.id);
      const withApplied = await Promise.all(
        projectsWithScore.map(async (p) => ({
          ...p,
          applied: await hasApplied(user.id, p.project.id),
        }))
      );

      setProjects(withApplied.sort((a, b) => b.compatibility - a.compatibility));
      setLoading(false);
    }
    loadProjects();
  }, [user]);

  const handleApply = async (projectId: string) => {
    if (!user) return;
    await applyToProject(user.id, projectId);
    setProjects(
      projects.map((p) =>
        p.project.id === projectId ? { ...p, applied: true } : p
      )
    );
  };

  const filteredProjects = projects.filter((p) => {
    if (skillFilter && !p.project.requiredSkills.includes(skillFilter)) {
      return false;
    }
    if (jobTypeFilter && p.project.jobType !== jobTypeFilter) {
      return false;
    }
    if (locationFilter && p.project.workLocation !== locationFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Discover Projects</h1>
      <p className="text-gray-600 mb-6">{filteredProjects.length} projects match your profile</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Skills</option>
          {AVAILABLE_SKILLS.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>

        <select
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Job Types</option>
          <option value="project-based">Project-Based</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
          <option value="part-time">Part-Time</option>
          <option value="full-time">Full-Time</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-Site</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <p className="text-gray-600">No projects found matching your filters.</p>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map(({ project, compatibility, applied }) => (
            <div
              key={project.id}
              className="bg-white border rounded-xl hover:border-black transition shadow-sm"
            >
              {/* Main Card */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-semibold">{project.title}</h2>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {formatJobType(project.jobType)}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div
                      className={`text-2xl font-bold ${
                        compatibility >= 70
                          ? 'text-green-600'
                          : compatibility >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {compatibility}%
                    </div>
                    <p className="text-xs text-gray-500">match</p>
                  </div>
                </div>

                {/* Key Details Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                    💰 {formatPayment(project)}
                  </span>
                  <span className="text-gray-600">
                    {formatLocation(project)}
                  </span>
                  <span className="text-gray-600">
                    📊 {formatExperience(project.experienceLevel)}
                  </span>
                  {project.estimatedDuration && (
                    <span className="text-gray-600">
                      ⏱️ {project.estimatedDuration}
                    </span>
                  )}
                  <span className="text-gray-600">
                    👥 Team of {project.teamSize}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-gray-100 text-sm rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Actions Row */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setExpandedProject(
                      expandedProject === project.id ? null : project.id
                    )}
                    className="text-sm text-gray-600 hover:text-black transition"
                  >
                    {expandedProject === project.id ? '▲ Hide Details' : '▼ View Full Details'}
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Due: {project.dueDate}
                    </span>
                    {applied ? (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(project.id)}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedProject === project.id && (
                <div className="border-t px-6 py-4 bg-gray-50">
                  <div className="grid md:grid-cols-3 gap-6">
                    {project.responsibilities && project.responsibilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">📋 Responsibilities</h3>
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
                      <div>
                        <h3 className="font-semibold mb-2">✅ Requirements</h3>
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
                      <div>
                        <h3 className="font-semibold mb-2">🎁 Benefits</h3>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
