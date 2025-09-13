import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PageLogin() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdHint = pwd.length < 10 ? "Min 10 characters" : "mot de pass respecté!";

    const canSubmit =
        emailOk &&
        pwd.length >= 10 &&
        firstName.trim() &&
        lastName.trim() &&
        company.trim();

    const onSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setErrorMsg("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                company: company.trim(),
                email: email.trim(),
                password: pwd,
            };
            await register(payload);
            //await login(email,pwd); au cas si le backend renvoie pas de token
            setSuccess("Compte créé avec succès !");
            navigate("/");
        } catch (err) {
            console.error(err);
            setErrorMsg(
                err?.response?.data?.message || "Échec de l’inscription. Veuillez réessayer."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT HERO */}
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
                                « La justice d’un homme se mesure moins à ses actes publics qu’à
                                ce qu’il ferait s’il était certain de n’être jamais vu. » Glaucon
                            </h2>
                        </header>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-[#1f1f23] text-slate-200 grid place-items-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center mb-8">Créez votre compte</h2>

                    {/* Alertes */}
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

                    {/* FORM */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Prénom */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Prénom</span>
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${
                                    !firstName.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                placeholder="Veuillez écrire votre prénom"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </label>

                        {/* Nom */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Nom</span>
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${
                                    !lastName.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                placeholder="Veuillez écrire votre nom de famille"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </label>

                        {/* Entreprise */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Entreprise</span>
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${
                                    !company.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                placeholder="Ma Compagnie Inc."
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </label>

                        {/* Email */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Adresse courriel</span>
                            <div className="relative">
                                <input
                                    type="email"
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none transition ${
                                        !email
                                            ? "border-rose-600"
                                            : emailOk
                                                ? "border-emerald-500"
                                                : "border-slate-700 focus:border-teal-500"
                                    }`}
                                    placeholder="Nom@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </label>

                        {/* Mot de passe */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Mot de passe</span>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 ${
                                        !pwd ? "border-rose-600" : "border-slate-700"
                                    }`}
                                    placeholder="Min 10 caractères"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute right-3 inset-y-0 my-auto grid place-items-center text-slate-400 hover:text-slate-200"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{pwdHint}</div>
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
                            {loading ? "Création..." : "Souscrire"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
