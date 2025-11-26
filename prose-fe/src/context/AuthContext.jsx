import {createContext, useContext, useEffect, useState} from "react";
import {
    login as apiLogin,
    logout as apiLogout,
    registerEmployeur as apiRegisterEmployeur,
    registerEtudiant as apiRegisterEtudiant
} from "../services/UtilisateurService";
import { setAccessToken } from "../services/http";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [, setLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("user");
            if (raw) {
                const userData = JSON.parse(raw);
                setUser(userData);
                // Restaurer le token dans l'instance http
                if (userData.token) {
                    setAccessToken(userData.token);
                }
            }
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
                   setAccessToken(u?.token || u?.accessToken || null);
               return u;
    }

    async function registerEmployeur(payload) {
        const u = await apiRegisterEmployeur(payload);
        setUser(u);
        setAccessToken(u?.token || u?.accessToken || null);
        return u;
    }

    async function registerEtudiant(payload) {
        const u = await apiRegisterEtudiant(payload);
        setUser(u);
        setAccessToken(u?.token || u?.accessToken || null);
        return u;
    }

    async function logout() {
        await apiLogout();
        setUser(null);
        setAccessToken(null);
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