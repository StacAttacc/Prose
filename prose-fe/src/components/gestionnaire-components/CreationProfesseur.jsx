import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { createProfesseur } from "../../services/GestionnaireService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function CreationProfesseur() {
    const { user } = useAuth();
    const { t } = useI18n();
    const token = user?.token || user?.accessToken;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const DISCIPLINES = [
        { label: t('informatique') || 'Informatique', value: "INFORMATIQUE" },
        { label: t('infirmier') || 'Infirmier', value: "INFIRMIER" },
        { label: t('genieCivil') || 'Génie Civil', value: "GENIE_CIVIL" },
        { label: t('comptabilite') || 'Comptabilité', value: "COMPTABILITE" },
        { label: t('marketing') || 'Marketing', value: "MARKETING" },
        { label: t('mecanique') || 'Mécanique', value: "MECANIQUE" },
        { label: t('autre') || 'Autre', value: "AUTRE" },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailOk = emailRegex.test(email);
    const passwordOk = password.length >= 10;
    const canSubmit = emailOk && passwordOk && firstName.trim() && lastName.trim() && discipline;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!canSubmit) {
            setError(t('remplirTousLesChamps') || 'Veuillez remplir tous les champs correctement');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(false);
            
            if (!token) {
                setError(t('erreurAuthentification') || 'Erreur d\'authentification. Veuillez vous reconnecter.');
                setSubmitting(false);
                return;
            }
            
            const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password: password,
                discipline: discipline
            };
            
            await createProfesseur(payload, token);
            
            setSuccess(true);
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setDiscipline("");
        } catch (err) {
            let errorMessage = t('erreurCreationProfesseur') || 'Erreur lors de la création du professeur';
            
            if (err?.response?.status === 409) {
                errorMessage = t('emailDejaUtilise') || 'Un compte avec cet email existe déjà';
            } else if (err?.response?.status === 400) {
                const responseData = err?.response?.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.data?.message) {
                    errorMessage = responseData.data.message;
                }
            } else if (err?.response?.data) {
                const responseData = err.response.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.data?.message) {
                    errorMessage = responseData.data.message;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            setSuccess(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <ScrollToTop />
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                {t('creationProfesseur')}
            </h1>

            {error && <ErrorBanner message={error} />}

            {success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                    {t('professeurCreeAvecSucces')}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        {t('informationsPersonnelles')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('prenom') || 'Prénom'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder={t('prenom') || 'Prénom'}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('nom') || 'Nom'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder={t('nom') || 'Nom'}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('email') || 'Email'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('email') || 'email@example.com'}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${
                                email && !emailOk ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            required
                        />
                        {email && !emailOk && (
                            <p className="mt-1 text-sm text-red-500">{t('emailInvalide') || 'Email invalide'}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('motDePasse') || 'Mot de passe'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('motDePasse') || 'Mot de passe'}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400 ${
                                    password && !passwordOk ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015 12c0 1.657.402 3.214 1.12 4.588M6.29 6.29L12 12m-5.71 5.71A9.97 9.97 0 0112 19c4.478 0 8.268-2.943 9.543-7a10.025 10.025 0 00-1.563-3.029m-5.858-.908a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88m0 0L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {password && !passwordOk && (
                            <p className="mt-1 text-sm text-red-500">
                                {t('min10Caracteres') || 'Le mot de passe doit contenir au moins 10 caractères'}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('discipline') || 'Discipline'} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={discipline}
                            onChange={(e) => setDiscipline(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        >
                            <option value="">{t('selectionnerDiscipline')}</option>
                            {DISCIPLINES.map((disc) => (
                                <option key={disc.value} value={disc.value}>
                                    {disc.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setFirstName("");
                            setLastName("");
                            setEmail("");
                            setPassword("");
                            setDiscipline("");
                            setError(null);
                            setSuccess(false);
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        disabled={submitting}
                    >
                        {t('reinitialiser') || 'Réinitialiser'}
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !canSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (t('creationEnCours') || 'Création en cours...') : t('creerUnProfesseur')}
                    </button>
                </div>
            </form>
        </div>
    );
}

