import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorBanner from "./display-components/ErrorBanner.jsx";

export default function SignUp({ onSwitchToLogin }) {
    const { registerEmployeur, registerEtudiant } = useAuth();
    const navigate = useNavigate();

    const [accountType, setAccountType] = useState("employer");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [discipline, setDiscipline] = useState("");
    const DISCIPLINES = [
        { label: "Informatique", value: "INFORMATIQUE" },
        { label: "Infirmier", value: "INFIRMIER" },
        { label: "Génie Civil", value: "GENIE_CIVIL" },
        { label: "Comptabilité", value: "COMPTABILITE" },
        { label: "Marketing", value: "MARKETING" },
        { label: "Mécanique", value: "MECANIQUE" },
        { label: "Autre", value: "AUTRE" },
    ];
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdHint = pwd.length < 10 ? "Min 10 characters" : "Mot de passe respecté!";

    const canSubmit =
        emailOk &&
        pwd.length >= 10 &&
        firstName.trim() &&
        lastName.trim() &&
        (accountType === "employer" ? company.trim() : discipline.trim());

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                ...(accountType === "employer"
                    ? { company: company.trim() }
                    : { discipline: discipline.trim() }),
                email: email.trim(),
                password: pwd,
            };
            if (accountType === "employer") {
                await registerEmployeur(payload);
            } else {
                await registerEtudiant(payload);
            }
            //await login(email,pwd); au cas si le backend renvoie pas de token
            navigate("/");
        } catch (err) {
            console.error(err);
            if (err?.response?.status === 409) {
                setErrorMsg("Cet email est déjà utilisé. Veuillez en choisir un autre");
            } else {
                setErrorMsg(
                    err?.response?.data?.message || "Service indisponible. Veuillez réessayer plus tard."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-8">
                Créez votre compte
            </h2>

            {/* Onglets type de compte */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setAccountType("employer")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${accountType === "employer"
                            ? "bg-teal-600 text-black"
                            : "bg-slate-300 text-gray-400 hover:bg-slate-600"
                        }`}
                >
                    Employeur
                </button>
                <button
                    type="button"
                    onClick={() => setAccountType("student")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${accountType === "student"
                            ? "bg-teal-600 text-black"
                            : "bg-slate-300 text-gray-400 hover:bg-slate-600"
                        }`}
                >
                    Étudiant
                </button>
            </div>

            {errorMsg && (
                <ErrorBanner message={errorMsg} />
            )}

            {/* FORM */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Prénom */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Prénom</span>
                    <input
                        type="text"
                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!firstName.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                        placeholder="Veuillez écrire votre prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </label>

                {/* Nom */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Nom</span>
                    <input
                        type="text"
                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!lastName.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                        placeholder="Veuillez écrire votre nom de famille"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </label>

                {/* Entreprise / Discipline */}
                {accountType === "employer" ? (
                    <label className="block">
                        <span className="block text-sm mb-1 text-gray-800">Entreprise</span>
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!company.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                            placeholder="Ma Compagnie Inc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                    </label>
                ) : (
                    <div>
                        <label className="block text-sm mb-1 text-gray-800" htmlFor="discipline">
                            Discipline
                        </label>
                        <select
                            id="discipline"
                            name="discipline"
                            value={discipline}
                            onChange={(e) => setDiscipline(e.target.value)}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!discipline ? "border-rose-600" : "border-slate-700"
                                }`}
                        >
                            <option value="">— Sélectionner —</option>
                            {DISCIPLINES.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Email */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Adresse courriel</span>
                    <div className="relative">
                        <input
                            type="email"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none transition ${!email ? "border-rose-600" : emailOk ? "border-emerald-500" : "border-slate-700 focus:border-teal-500"
                                }`}
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </label>

                {/* Mot de passe */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">Mot de passe</span>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 ${!pwd ? "border-rose-600" : "border-slate-700"
                                }`}
                            placeholder="Min 10 caractères"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute right-3 inset-y-0 my-auto grid place-items-center text-gray-800 hover:text-gray-600"
                            aria-label="Toggle password visibility"
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-800">{pwdHint}</div>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-60 ${canSubmit
                            ? "bg-black text-white shadow-lg hover:bg-gray-200"
                            : "bg-gradient-to-r from-teal-500 to-slate-500 text-white hover:from-teal-400 hover:to-gray-400"
                        }`}
                >
                    {loading ? "Création..." : "Souscrire"}
                </button>

                {/* Retour vers Login */}
                <div className="text-center mt-4">
                    <span className="text-gray-800">Déjà un compte ? </span>
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-teal-500 hover:underline"
                    >
                        Se connecter
                    </button>
                </div>
            </form>
        </>
    );
}