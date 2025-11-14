import React, { useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { associerProfesseurEtudiant } from "../../services/GestionnaireService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function AssociationProfesseurEtudiant() {
    const { user } = useAuth();
    const { t } = useI18n();
    const token = user?.token;

    const [etudiantEmail, setEtudiantEmail] = useState("");
    const [professeurEmail, setProfesseurEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!etudiantEmail.trim() || !professeurEmail.trim()) {
            setError(t('selectionnerEtudiantEtProfesseur') || 'Veuillez entrer l\'email de l\'étudiant et l\'email du professeur');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(false);
            
            await associerProfesseurEtudiant(professeurEmail, etudiantEmail.trim(), token);
            
            setSuccess(true);
            setEtudiantEmail("");
            setProfesseurEmail("");
        } catch (err) {
            // Gérer les erreurs spécifiques du backend
            let errorMessage = t('erreurAssociation') || 'Erreur lors de l\'association';
            
            if (err?.response?.data) {
                // Le backend retourne un String directement dans le body
                errorMessage = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : err.response.data.message || errorMessage;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <ScrollToTop />
            <h1 className="text-2xl font-bold mb-6 text-center">
                {t('Faire une demande') || 'Association Professeur - Étudiant'}
            </h1>

            {error && <ErrorBanner message={error} />}

            {success && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {t('associationReussie') || 'Association réussie avec succès!'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {t('Veuillez entrer l\'email de l\'étudiant') || 'Email de l\'étudiant'}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('etudiant') || 'Email de l\'étudiant'}
                        </label>
                        <input
                            type="email"
                            value={etudiantEmail}
                            onChange={(e) => setEtudiantEmail(e.target.value)}
                            placeholder={t('Veuillez entrer l\'email de l\'étudiant') || 'etudiant@example.com'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {t('Veuillez entrer l\'email du professeur') || 'Sélectionner un professeur'}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('') || 'Email du professeur'}
                        </label>
                        <input
                            type="email"
                            value={professeurEmail}
                            onChange={(e) => setProfesseurEmail(e.target.value)}
                            placeholder={t('Veuillez entrer l\'email du professeur') || 'professeur@example.com'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                      
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setEtudiantEmail("");
                            setProfesseurEmail("");
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
                        disabled={submitting || !etudiantEmail.trim() || !professeurEmail.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (t('associationEnCours') || 'Association en cours...') : (t('associer') || 'Associer')}
                    </button>
                </div>
            </form>
        </div>
    );
}

