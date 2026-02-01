"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User } from "./types";
import { createClient } from "./supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const fetchUserProfile = useCallback(async (authUserId: string): Promise<User | null> => {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUserId)
            .single();

        if (error || !data) {
            console.error("Error fetching user profile:", error);
            return null;
        }

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role as "client" | "freelancer",
        };
    }, [supabase]);

    const refreshUser = useCallback(async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const profile = await fetchUserProfile(authUser.id);
            setUser(profile);
        } else {
            setUser(null);
        }
    }, [supabase, fetchUserProfile]);

    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const profile = await fetchUserProfile(authUser.id);
                    setUser(profile);
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    setUser(profile);
                } else if (event === "SIGNED_OUT") {
                    setUser(null);
                } else if (event === "TOKEN_REFRESHED" && session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    setUser(profile);
                }
                router.refresh();
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, fetchUserProfile, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
