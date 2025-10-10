import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import {useNavigate} from "react-router-dom";
import ErrorBanner from "./display-components/ErrorBanner.jsx";

export default function Login({ onSwitchToSignup }) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const nav = useNavigate();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdOk = pwd.trim().length >= 10;
    const canSubmit = emailOk && pwdOk;

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            await login(email.trim(), pwd);
            nav('/');

        } catch (err) {
            console.error(err);
            if (!navigator.onLine) {
                setErrorMsg("Connexion Internet instable. Veuillez vérifier votre connexion.");
            } else if (err?.response?.status === 409) {
                setErrorMsg("Cet email est déjà utilisé. Veuillez en choisir un autre");
            } else {
                setErrorMsg(err?.response?.data?.message || "Service indisponible. Veuillez réessayer plus tard.");
            }

        } finally {
            setLoading(false);
        }
    };

    function getInputBorderClass(value, isValid) {
        if (!value) return "border-rose-600";
        if (isValid) return "border-emerald-500";
        return "border-slate-700 focus:border-teal-500";
    }

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-8">Connexion</h2>

            {errorMsg && (
                <ErrorBanner message={errorMsg} />
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Email */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Adresse courriel</span>
                    <div className="relative">
                        <input
                            type="email"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${getInputBorderClass(
                                email,
                                emailOk
                            )}`}
                            placeholder="Nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>
                </label>

                {/* Mot de passe */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Mot de passe</span>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 appearance-none ${getInputBorderClass(
                                pwd,
                                pwdOk
                            )}`}
                            placeholder="Minimum 10 caractères"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute right-3 inset-y-0 my-auto grid place-items-center text-gray-800 hover:text-gray-800"
                            aria-label="Toggle password visibility"
                        >
                            {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-60 ${canSubmit
                            ? "bg-black text-white shadow-lg hover:bg-slate-800"
                            : "bg-gradient-to-r from-teal-500 to-slate-500 text-white hover:from-teal-400 hover:to-slate-400"
                        }`}
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>

                {/* Basculer vers SignUp */}
                <div className="text-center mt-4">
                    <span className="text-slate-400">Pas encore de compte ? </span>
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-teal-500 hover:underline"
                    >
                        S'inscrire
                    </button>
                </div>
            </form>
        </>
    );
}