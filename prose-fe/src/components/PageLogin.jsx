import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function PageLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdOk = pwd.trim().length >= 8;
    const canSubmit = emailOk && pwdOk;

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccess("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            await login(email.trim(), pwd);
            // Afficher un message de succès
            setSuccess("Connexion réussie !");
            navigate("/etudiant/televerser-cv")
        } catch (err) {
            console.error(err);
            if (err?.response?.status === 401) {
                setErrorMsg("Identifiants invalides");
            } else if (err?.response?.status >= 500) {
                setErrorMsg("Service indisponible. Veuillez réessayer plus tard.");
            } else if (!navigator.onLine) {
                setErrorMsg("Connexion Internet instable. Veuillez vérifier votre connexion.");
            } else {
                setErrorMsg(
                    err?.response?.data?.message ||
                    "Échec de la connexion. Veuillez réessayer."
                );
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
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT HERO */}
            <div className="relative overflow-hidden bg-teal-700/95 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_35%)]"/>
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
                                « La justice d'un homme se mesure moins à ses actes publics qu'à
                                ce qu'il ferait s'il était certain de n'être jamais vu. » Glaucon
                            </h2>
                        </header>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-[#1f1f23] text-slate-200 grid place-items-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Connexion
                    </h2>

                    {/* Messages */}
                    {success && (
                        <div className="mb-4 rounded-lg border border-emerald-600 bg-emerald-900/30 p-3 text-emerald-300">
                            {success}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/30 p-3 text-rose-300">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Email */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">
                                Adresse courriel
                            </span>
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
                            <span className="block text-sm mb-1 text-slate-400">
                                Mot de passe
                            </span>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 appearance-none ${getInputBorderClass(
                                        pwd,
                                        pwdOk
                                    )}`}
                                    placeholder="Minimum 8 caractères"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute right-3 inset-y-0 my-auto grid place-items-center text-slate-400 hover:text-slate-200"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPwd ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </button>
                            </div>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-60
                                ${
                                canSubmit
                                    ? "bg-white text-black shadow-lg hover:bg-slate-200"
                                    : "bg-gradient-to-r from-teal-500 to-slate-500 text-white hover:from-teal-400 hover:to-slate-400"
                            }`}
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>

                        {/* Lien d'inscription */}
                        <div className="text-center mt-4">
                            <span className="text-slate-400">Pas encore de compte ? </span>
                            <a href="/" className="text-teal-500 hover:underline">S'inscrire</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}