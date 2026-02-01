"use client";

import Link from "next/link";

export default function AuthCodeErrorPage() {
    return (
        <main className="min-h-screen bg-gradient-brand relative overflow-hidden flex items-center justify-center p-6">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                <div className="card text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">Authentication Error</h1>
                    <p className="text-gray-600 mb-6">
                        There was a problem verifying your email. The link may have expired or
                        already been used.
                    </p>
                    <div className="space-y-3">
                        <Link href="/login" className="btn-primary w-full block text-center">
                            Back to Login
                        </Link>
                        <Link href="/signup" className="btn-secondary w-full block text-center">
                            Create New Account
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
