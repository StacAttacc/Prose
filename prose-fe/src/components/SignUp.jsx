import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import ErrorBanner from "./display-components/ErrorBanner.jsx";

export default function SignUp({ onSwitchToLogin }) {
    const { registerEmployeur, registerEtudiant } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const [accountType, setAccountType] = useState("employer");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [discipline, setDiscipline] = useState("");
    const DISCIPLINES = [
        { label: t('informatique'), value: "INFORMATIQUE" },
        { label: t('infirmier'), value: "INFIRMIER" },
        { label: t('genieCivil'), value: "GENIE_CIVIL" },
        { label: t('comptabilite'), value: "COMPTABILITE" },
        { label: t('marketing'), value: "MARKETING" },
        { label: t('mecanique'), value: "MECANIQUE" },
        { label: t('autre'), value: "AUTRE" },
    ];
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdHint = pwd.length < 10 ? t('min10Caracteres') : t('motDePasseRespecte');

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
                setErrorMsg(t('emailDejaUtilise'));
            } else {
                setErrorMsg(
                    err?.response?.data?.message || t('serviceIndisponible')
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
                {t('creerCompte')}
            </h2>

            {/* Onglets type de compte */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setAccountType("employer")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${accountType === "employer"
                            ? "text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            : "bg-slate-300 text-gray-400 hover:bg-slate-600 text-sm px-5 py-2.5 font-medium rounded-lg text-center"
                        }`}
                >
                    {t('employeur')}
                </button>
                <button
                    type="button"
                    onClick={() => setAccountType("student")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${accountType === "student"
                            ? "text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            : "bg-slate-300 text-gray-400 hover:bg-slate-600 text-sm px-5 py-2.5 font-medium rounded-lg text-center"
                        }`}
                >
                    {t('etudiant')}
                </button>
            </div>

            {errorMsg && (
                <ErrorBanner message={errorMsg} />
            )}

            {/* FORM */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Prénom */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800 dark:text-gray-200">{t('prenom')}</span>
                    <input
                        type="text"
                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${!firstName.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                        placeholder={t('prenomPlaceholder')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </label>

                {/* Nom */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800 dark:text-gray-200">{t('nom')}</span>
                    <input
                        type="text"
                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${!lastName.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                        placeholder={t('nomPlaceholder')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </label>

                {/* Entreprise / Discipline */}
                {accountType === "employer" ? (
                    <label className="block">
                        <span className="block text-sm mb-1 text-gray-800 dark:text-gray-200">{t('entreprise')}</span>
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${!company.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                            placeholder={t('entreprisePlaceholder')}
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                        />
                    </label>
                ) : (
                    <div>
                        <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200" htmlFor="discipline">
                            {t('discipline')}
                        </label>
                        <select
                            id="discipline"
                            name="discipline"
                            value={discipline}
                            onChange={(e) => setDiscipline(e.target.value)}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 ${!discipline ? "border-rose-600" : "border-slate-700"
                                }`}
                        >
                            <option value="">{t('selectionner')}</option>
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
                    <span className="block text-sm mb-1 text-gray-800">{t('adresseCourriel')}</span>
                    <div className="relative">
                        <input
                            type="email"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none transition text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${!email ? "border-rose-600" : emailOk ? "border-emerald-500" : "border-slate-700 focus:border-teal-500"
                                }`}
                            placeholder={t('emailPlaceholderSignup')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </label>

                {/* Mot de passe */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800">{t('motDePasse')}</span>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${!pwd ? "border-rose-600" : "border-slate-700"
                                }`}
                            placeholder={t('passwordPlaceholderSignup')}
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute right-3 inset-y-0 my-auto grid place-items-center text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Toggle password visibility"
                        >
                            {showPwd ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-800 dark:text-gray-200">{pwdHint}</div>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full transition disabled:opacity-60 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    {loading ? t('creation') : t('souscrire')}
                </button>

                {/* Retour vers Login */}
                <div className="text-center mt-4">
                    <span className="text-gray-800 dark:text-gray-200">{t('dejaUnCompte')} </span>
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-teal-500 dark:text-teal-400 hover:underline"
                    >
                        {t('seConnecter')}
                    </button>
                </div>
            </form>
        </>
    );
}