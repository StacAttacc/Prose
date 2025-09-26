import { createContext, useContext, useState } from "react";
import { login as apiLogin, registerEmployeur as apiRegisterEmployeur, registerEtudiant as apiRegisterEtudiant, logout as apiLogout } from "../services/AuthService";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

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