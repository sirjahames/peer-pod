"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRole="freelancer">{children}</AuthGuard>;
}
