import {createContext, useContext, useEffect, useState} from "react";
import {
    login as apiLogin,
    logout as apiLogout,
    registerEmployeur as apiRegisterEmployeur,
    registerEtudiant as apiRegisterEtudiant
} from "../services/AuthService";
import {createStage as apiCreateStage} from "../services/StageService.js";

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
        setUser(u.data);
        return u;
    }

    async function registerEmployeur(payload) {
        const u = await apiRegisterEmployeur(payload);
        setUser(u.data);
        return u;
    }

    async function registerEtudiant(payload) {
        const u = await apiRegisterEtudiant(payload);
        setUser(u.data);
        return u;
    }

    async function logout() {
        await apiLogout();
        setUser(null);
    }

    async function createStage(payload, token) {
        await apiCreateStage(payload, token);
    }

    return (
        <AuthCtx.Provider value={{ user, isAuthed: !!user, login, registerEmployeur, registerEtudiant, logout, createStage }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}