import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

export default function PageAuthentification() {
    const location = useLocation();
    const { t, locale, setLocale } = useI18n();

    const initialMode = useMemo(() => {
        const path = location.pathname.toLowerCase();
        return path.includes("signup") ? "signup" : "login";
    }, [location.pathname]);

    const [mode, setMode] = useState(initialMode);
    useEffect(() => setMode(initialMode), [initialMode]);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Sélecteur de langue en haut à droite */}
            <div className="absolute top-4 right-4 z-50">
                <div className="flex items-center gap-2 bg-teal-700/90 px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                    <label className="text-white text-sm font-medium whitespace-nowrap">{t('language')}:</label>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                        className="px-2 py-1 border border-white/30 rounded-md bg-teal-800 text-white focus:ring-2 focus:ring-white focus:border-white text-sm font-medium cursor-pointer hover:bg-teal-700 transition-colors"
                    >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
            
            {/* LEFT HERO (unique, commun aux deux) */}
            <div className="relative overflow-hidden bg-teal-700/95 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_35%)]" />
                <div className="relative h-full flex flex-col items-center justify-center p-8 lg:p-12 text-center">
                    <div className="text-6xl sm:text-8xl font-bold mb-6">Prose</div>
                    <div className="max-w-xl">
                        <h1 className="text-2xl sm:text-xl font-bold tracking-tight mb-12">
                            « {t('proseTagline')} »
                        </h1>
                        <img
                            className="mx-auto block h-60 w-40 rounded-full object-cover mb-12"
                            src="/glaucon.png"
                            alt="Glaucon"
                        />
                        <header>
                            <h2 className="text-xl font-bold">
                                « {t('glauconQuote')} » {t('glauconAuthor')}
                            </h2>
                        </header>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL : on alterne Login / SignUp */}
            <div className="bg-white text-gray-800 grid place-items-center p-6 md:p-10">
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
