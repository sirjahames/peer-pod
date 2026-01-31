'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { Role } from '@/lib/types';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('freelancer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signup(email, password, name, role);

    if (result.success && result.user) {
      login(result.user);
      if (role === 'client') {
        router.push('/dashboard');
      } else {
        router.push('/quiz');
      }
    } else {
      setError(result.error || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-brand relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
      </div>

      {/* Form */}
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 group hover:scale-105 transition-transform">
          <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            PeerPod
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Join PeerPod</h1>
          <p className="text-gray-600">Create your account and start building amazing teams</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-accent-500 focus:outline-none transition-colors placeholder:text-gray-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-accent-500 focus:outline-none transition-colors placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-accent-500 focus:outline-none transition-colors placeholder:text-gray-400"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
                    role === 'freelancer'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-lg'
                      : 'border-light text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
                    role === 'client'
                      ? 'border-accent-600 bg-accent-50 text-accent-700 shadow-lg'
                      : 'border-light text-gray-600 hover:border-accent-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Client
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent-600 hover:text-accent-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
