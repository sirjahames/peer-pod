"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({
    children,
    requiredRole,
}: {
    children: React.ReactNode;
    requiredRole?: "client" | "freelancer";
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        }
        if (!loading && user && requiredRole && user.role !== requiredRole) {
            router.push(user.role === "client" ? "/dashboard" : "/freelancer");
        }
    }, [user, loading, router, requiredRole, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-brand">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}
