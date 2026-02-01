"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Navigation() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const isFreelancer = user.role === "freelancer";

    const links = isFreelancer
        ? [
              { href: "/freelancer", label: "Home" },
              { href: "/freelancer/discover", label: "Discover" },
              { href: "/freelancer/groups", label: "Groups" },
          ]
        : [
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/create", label: "New Project" },
          ];

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-light/50 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and brand */}
                    <Link
                        href={isFreelancer ? "/freelancer" : "/dashboard"}
                        className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            PeerPod
                        </span>
                    </Link>

                    {/* Navigation links */}
                    <div className="flex gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? "active" : ""}`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-light/50">
                            <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                {user.name}
                            </span>
                        </div>
                        <button
                            onClick={signOut}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-accent-600 border-2 border-accent-600/20 hover:bg-accent-50 hover:border-accent-600 transform hover:scale-105 active:scale-95 transition-all duration-200">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
