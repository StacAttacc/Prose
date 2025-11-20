import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { Eye, EyeOff } from "lucide-react";
import {useNavigate} from "react-router-dom";
import ErrorBanner from "./display-components/ErrorBanner.jsx";

export default function Login({ onSwitchToSignup }) {
    const { login } = useAuth();
    const { t } = useI18n();

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
                setErrorMsg(t('erreurConnexionInternet'));
            } else if (err?.response?.status === 409) {
                setErrorMsg(t('emailDejaUtilise'));
            } else {
                setErrorMsg(err?.response?.data?.message || t('serviceIndisponible'));
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
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">{t('connexion')}</h2>

            {errorMsg && (
                <ErrorBanner message={errorMsg} />
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Email */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800 dark:text-gray-200">{t('adresseCourriel')}</span>
                    <div className="relative">
                        <input
                            type="email"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${getInputBorderClass(
                                email,
                                emailOk
                            )}`}
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>
                </label>

                {/* Mot de passe */}
                <label className="block">
                    <span className="block text-sm mb-1 text-gray-800 dark:text-gray-200">{t('motDePasse')}</span>
                    <div className="relative">
                        <input
                            type={showPwd ? "text" : "password"}
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 pr-11 outline-none focus:border-teal-500 appearance-none text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${getInputBorderClass(
                                pwd,
                                pwdOk
                            )}`}
                            placeholder={t('passwordPlaceholder')}
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute right-3 inset-y-0 my-auto grid place-items-center text-gray-800 dark:text-gray-200 hover:text-gray-800 dark:hover:text-gray-300"
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
                    className="w-full transition disabled:opacity-60 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    {loading ? t('connexionEnCours') : t('seConnecter')}
                </button>

                {/* Basculer vers SignUp */}
                <div className="text-center mt-4">
                    <span className="text-slate-400 dark:text-gray-400">{t('pasEncoreCompte')} </span>
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-teal-500 dark:text-teal-400 hover:underline"
                    >
                        {t('sinscrire')}
                    </button>
                </div>
            </form>
        </>
    );
}