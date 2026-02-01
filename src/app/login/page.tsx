"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/actions";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await login(email, password);

        if (result.success && result.user) {
            await refreshUser();
            const redirectTo = searchParams.get("redirectTo");
            if (redirectTo) {
                router.push(redirectTo);
            } else if (result.user.role === "client") {
                router.push("/dashboard");
            } else {
                router.push("/quiz");
            }
        } else {
            setError(result.error || "Login failed");
        }
        setLoading(false);
    };

    return (
        <>
            {/* Header */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 mb-8 group hover:scale-105 transition-transform">
                <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    PeerPod
                </span>
            </Link>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome back</h1>
                <p className="text-gray-600">Log in to your account and get collaborating</p>
            </div>

            {/* Form Card */}
            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-900 mb-2">
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

                    {/* Password Input */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-900 mb-2">
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

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="font-semibold text-accent-600 hover:text-accent-700 transition-colors">
                    Create one now
                </Link>
            </p>
        </>
    );
}

function LoginFormLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-gradient-brand relative overflow-hidden flex items-center justify-center p-6">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
            </div>

            {/* Form */}
            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                <Suspense fallback={<LoginFormLoading />}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}
