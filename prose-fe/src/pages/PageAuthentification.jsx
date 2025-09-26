// src/pages/PageAuthentification.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

export default function PageAuthentification() {
    const location = useLocation();

    // Détermine l’écran initial à partir de l’URL (/signup -> signup, sinon login)
    const initialMode = useMemo(() => {
        const path = location.pathname.toLowerCase();
        return path.includes("signup") ? "signup" : "login";
    }, [location.pathname]);

    const [mode, setMode] = useState(initialMode);
    useEffect(() => setMode(initialMode), [initialMode]);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT HERO (unique, commun aux deux) */}
            <div className="relative overflow-hidden bg-teal-700/95 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_35%)]" />
                <div className="relative h-full flex flex-col items-center justify-center p-8 lg:p-12 text-center">
                    <div className="text-6xl sm:text-8xl font-bold mb-6">Prose</div>
                    <div className="max-w-xl">
                        <h1 className="text-2xl sm:text-xl font-bold tracking-tight mb-12">
                            « La rencontre simple entre étudiants et employeurs. »
                        </h1>
                        <img
                            className="mx-auto block h-60 w-40 rounded-full object-cover mb-12"
                            src="/glaucon.png"
                            alt="Glaucon"
                        />
                        <header>
                            <h2 className="text-xl font-bold">
                                « La justice d'un homme se mesure moins à ses actes publics qu'à ce qu'il
                                ferait s'il était certain de n'être jamais vu. » Glaucon
                            </h2>
                        </header>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL : on alterne Login / SignUp */}
            <div className="bg-[#1f1f23] text-slate-200 grid place-items-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    {mode === "login" ? (
                        <Login onSwitchToSignup={() => setMode("signup")} />
                    ) : (
                        <SignUp onSwitchToLogin={() => setMode("login")} />
                    )}
                </div>
            </div>
        </div>
    );
}
