"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types";
import { getCurrentUser, setCurrentUser, logout as serverLogout } from "./actions";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then((u) => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        setCurrentUser(newUser.id);
    };

    const logout = () => {
        setUser(null);
        serverLogout();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
