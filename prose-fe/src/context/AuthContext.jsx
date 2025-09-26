import {createContext, useContext, useEffect, useState} from "react";
import { login as apiLogin, registerEmployeur as apiRegisterEmployeur, registerEtudiant as apiRegisterEtudiant, logout as apiLogout } from "../services/AuthService";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("user");
            if (raw) setUser(JSON.parse(raw));
        } catch {
            sessionStorage.removeItem("user");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            sessionStorage.setItem("user", JSON.stringify(user));
        } else {
            sessionStorage.removeItem("user");
        }
    }, [user]);

    async function login(email, password) {
        const u = await apiLogin(email, password);
        setUser(u);
        return u;
    }

    async function registerEmployeur(payload) {
        const u = await apiRegisterEmployeur(payload);
        setUser(u);
        return u;
    }

    async function registerEtudiant(payload) {
        const u = await apiRegisterEtudiant(payload);
        setUser(u);
        return u;
    }

    async function logout() {
        await apiLogout();
        setUser(null);
    }

    return (
        <AuthCtx.Provider value={{ user, isAuthed: !!user, login, registerEmployeur, registerEtudiant, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}