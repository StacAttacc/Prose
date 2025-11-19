import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useYear } from "../../context/YearContext.jsx";
import { associerProfesseurEtudiant, getStageApplicantsManager } from "../../services/GestionnaireService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function AssociationProfesseurEtudiant() {
    const { user } = useAuth();
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const token = user?.token;

    const [etudiantEmail, setEtudiantEmail] = useState("");
    const [professeurEmail, setProfesseurEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [associations, setAssociations] = useState([]);
    const [loadingAssociations, setLoadingAssociations] = useState(true);
    const [associationsExpanded, setAssociationsExpanded] = useState(false);

    useEffect(() => {
        if (token) {
            loadAssociations();
        }
    }, [token, selectedYear]);

    const loadAssociations = async () => {
        try {
            setLoadingAssociations(true);
            const data = await getStageApplicantsManager(token, selectedYear);
            
            // Extraire les associations (étudiants avec professeur responsable)
            const associationsMap = new Map();
            
            data.forEach(dto => {
                const etudiant = dto?.etudiant;
                if (etudiant && etudiant.professeurResponsable) {
                    const etudiantId = etudiant.id || etudiant.email;
                    // Éviter les doublons
                    if (!associationsMap.has(etudiantId)) {
                        associationsMap.set(etudiantId, {
                            etudiantEmail: etudiant.email || '',
                            etudiantNom: `${etudiant.firstName || ''} ${etudiant.lastName || ''}`.trim() || etudiant.email,
                            professeurEmail: etudiant.professeurResponsable?.email || '',
                            professeurNom: `${etudiant.professeurResponsable?.firstName || ''} ${etudiant.professeurResponsable?.lastName || ''}`.trim() || etudiant.professeurResponsable?.email
                        });
                    }
                }
            });
            
            setAssociations(Array.from(associationsMap.values()));
        } catch (err) {
            console.error('Erreur lors du chargement des associations:', err);
            setAssociations([]);
        } finally {
            setLoadingAssociations(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!etudiantEmail.trim() || !professeurEmail.trim()) {
            setError(t('selectionnerEtudiantEtProfesseur') || 'Veuillez entrer l\'email de l\'étudiant et l\'email du professeur');
            return;
        }

        // Validation basique des emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(etudiantEmail.trim())) {
            setError('L\'email de l\'étudiant n\'est pas valide');
            return;
        }
        if (!emailRegex.test(professeurEmail.trim())) {
            setError('L\'email du professeur n\'est pas valide');
            return;
        }

        // Vérifier si l'étudiant n'est pas déjà dans la liste des associations
        const etudiantDejaAssocie = associations.find(assoc => 
            assoc.etudiantEmail.toLowerCase() === etudiantEmail.trim().toLowerCase()
        );
        if (etudiantDejaAssocie) {
            setError(`Cet étudiant (${etudiantDejaAssocie.etudiantEmail}) est déjà associé au professeur ${etudiantDejaAssocie.professeurNom || etudiantDejaAssocie.professeurEmail}`);
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
            
            // Recharger les associations après succès
            await loadAssociations();
        } catch (err) {
            // Gérer les erreurs spécifiques du backend
            let errorMessage = t('erreurAssociation') || 'Erreur lors de l\'association';
            
            console.error('Erreur complète:', err);
            console.error('Response:', err?.response);
            console.error('Response data:', err?.response?.data);
            console.error('Response status:', err?.response?.status);
            
            // Priorité 1: Vérifier le statut HTTP et les données de réponse
            if (err?.response?.status === 500) {
                // Pour les erreurs 500, vérifier d'abord les données de réponse
                const responseData = err?.response?.data;
                if (typeof responseData === 'string') {
                    if (responseData === 'Erreur interne du serveur') {
                        errorMessage = 'Erreur interne du serveur. Causes possibles:\n\n' +
                            '• L\'étudiant ou le professeur n\'existe pas dans le système\n' +
                            '• L\'étudiant est déjà associé à un autre professeur\n' +
                            '• Problème de connexion à la base de données\n\n' +
                            'Vérifiez que les emails saisis correspondent à des utilisateurs existants et réessayez.';
                    } else {
                        errorMessage = responseData;
                    }
                } else if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.error) {
                    errorMessage = responseData.error;
                } else {
                    errorMessage = 'Erreur interne du serveur. Veuillez vérifier que l\'étudiant et le professeur existent et réessayez.';
                }
            } else if (err?.response?.data) {
                // Pour les autres statuts, utiliser les données de réponse
                const responseData = err.response.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.error) {
                    errorMessage = responseData.error;
                }
            } else if (err?.response?.status) {
                // Gérer les autres codes de statut HTTP
                switch (err.response.status) {
                    case 404:
                        errorMessage = 'Un des utilisateurs (étudiant ou professeur) n\'existe pas';
                        break;
                    case 409:
                        errorMessage = 'Cet étudiant est déjà associé à un professeur';
                        break;
                    default:
                        errorMessage = `Erreur ${err.response.status}: ${err.response.statusText || 'Erreur inconnue'}`;
                }
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (err?.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            }
            
            setError(errorMessage);
            setSuccess("");
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

            {/* Tableau des associations existantes (Collapse) */}
            {!loadingAssociations && associations.length > 0 && (
                <div className="mb-6 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setAssociationsExpanded(!associationsExpanded)}
                            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between hover:from-teal-600 hover:to-teal-700 transition-colors"
                        >
                            <h2 className="text-xl font-semibold text-white">
                                {t('associationsExistantes') || 'Associations existantes'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm bg-teal-700 px-2 py-1 rounded-full">
                                    {associations.length}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-white transition-transform duration-200 ${associationsExpanded ? 'transform rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                        
                        {associationsExpanded && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('etudiant') || 'Étudiant'}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('professeur') || 'Professeur'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {associations.map((association, index) => (
                                            <tr key={index} className="hover:bg-teal-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {association.etudiantNom}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {association.etudiantEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {association.professeurNom}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {association.professeurEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {loadingAssociations && (
                <div className="mb-6 text-center">
                    <p className="text-gray-500">{t('chargementAssociations') || 'Chargement des associations...'}</p>
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
                            {t('emailProfesseur') || 'Email du professeur'}
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
                            loadAssociations();
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

