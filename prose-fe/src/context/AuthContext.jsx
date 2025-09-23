
import { createContext, useContext, useState } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../services/AuthService";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    async function login(email, password) {
        const u = await apiLogin(email, password);
        setUser(u);
        return u;
    }

    async function register(payload) {
        const u = await apiRegister(payload);
        setUser(u);
        return u;
    }

    async function logout() {
        await apiLogout();
        setUser(null);
    }

    return (
        <AuthCtx.Provider value={{ user, isAuthed: !!user, login, register, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}
