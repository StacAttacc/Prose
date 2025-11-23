import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useYear } from "../../context/YearContext.jsx";
import { associerProfesseurEtudiant, getAllEtudiants, getAllProfesseurs } from "../../services/GestionnaireService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function AssociationProfesseurEtudiant() {
    const { user } = useAuth();
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const token = user?.token;

    const [selectedEtudiantId, setSelectedEtudiantId] = useState("");
    const [selectedProfesseurId, setSelectedProfesseurId] = useState("");
    const [etudiants, setEtudiants] = useState([]);
    const [professeurs, setProfesseurs] = useState([]);
    const [loadingEtudiants, setLoadingEtudiants] = useState(true);
    const [loadingProfesseurs, setLoadingProfesseurs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [associations, setAssociations] = useState([]);
    const [loadingAssociations, setLoadingAssociations] = useState(true);
    const [associationsExpanded, setAssociationsExpanded] = useState(false);

    useEffect(() => {
        if (token) {
            loadAssociations();
            loadEtudiants();
            loadProfesseurs();
        }
    }, [token, selectedYear]);

    const loadEtudiants = async () => {
        try {
            setLoadingEtudiants(true);
            console.log('Chargement des étudiants...');
            const data = await getAllEtudiants(token);
            console.log('Étudiants chargés:', data);
            setEtudiants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur lors du chargement des étudiants:', err);
            console.error('Détails de l\'erreur:', err?.response?.data);
            console.error('Status:', err?.response?.status);
            setEtudiants([]);
        } finally {
            console.log('Fin du chargement des étudiants');
            setLoadingEtudiants(false);
        }
    };

    const loadProfesseurs = async () => {
        try {
            setLoadingProfesseurs(true);
            console.log('Chargement des professeurs...');
            const data = await getAllProfesseurs(token);
            console.log('Professeurs chargés:', data);
            setProfesseurs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur lors du chargement des professeurs:', err);
            console.error('Détails de l\'erreur:', err?.response?.data);
            console.error('Status:', err?.response?.status);
            setProfesseurs([]);
        } finally {
            console.log('Fin du chargement des professeurs');
            setLoadingProfesseurs(false);
        }
    };

    const loadAssociations = async () => {
        try {
            setLoadingAssociations(true);
            // Utiliser getAllEtudiants pour obtenir tous les étudiants avec leur professeur responsable
            const etudiants = await getAllEtudiants(token);
            
            // Extraire les associations (étudiants avec professeur responsable)
            const associationsList = [];
            
            etudiants.forEach(etudiant => {
                if (etudiant && etudiant.professeurResponsable) {
                    associationsList.push({
                        etudiantEmail: etudiant.email || '',
                        etudiantNom: `${etudiant.firstName || ''} ${etudiant.lastName || ''}`.trim() || etudiant.email,
                        professeurEmail: etudiant.professeurResponsable?.email || '',
                        professeurNom: `${etudiant.professeurResponsable?.firstName || ''} ${etudiant.professeurResponsable?.lastName || ''}`.trim() || etudiant.professeurResponsable?.email
                    });
                }
            });
            
            setAssociations(associationsList);
        } catch (err) {
            console.error('Erreur lors du chargement des associations:', err);
            setAssociations([]);
        } finally {
            setLoadingAssociations(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedEtudiantId || !selectedProfesseurId) {
            setError(t('selectionnerEtudiantEtProfesseur') || 'Veuillez sélectionner un étudiant et un professeur');
            return;
        }

        const selectedEtudiant = etudiants.find(e => e.id === parseInt(selectedEtudiantId) || e.email === selectedEtudiantId);
        const selectedProfesseur = professeurs.find(p => p.id === parseInt(selectedProfesseurId) || p.email === selectedProfesseurId);

        if (!selectedEtudiant || !selectedProfesseur) {
            setError('Étudiant ou professeur non trouvé');
            return;
        }

        const etudiantEmail = selectedEtudiant.email;
        const professeurEmail = selectedProfesseur.email;

        const etudiantDejaAssocie = associations.find(assoc => 
            assoc.etudiantEmail.toLowerCase() === etudiantEmail.toLowerCase()
        );
        if (etudiantDejaAssocie) {
            setError(`Cet étudiant (${etudiantDejaAssocie.etudiantEmail}) est déjà associé au professeur ${etudiantDejaAssocie.professeurNom || etudiantDejaAssocie.professeurEmail}`);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(false);
            
            await associerProfesseurEtudiant(professeurEmail, etudiantEmail, token);
            
            setSuccess(true);
            setSelectedEtudiantId("");
            setSelectedProfesseurId("");
            
            await loadAssociations();
        } catch (err) {
            let errorMessage = t('erreurAssociation') || 'Erreur lors de l\'association';
            
            console.error('Erreur complète:', err);
            console.error('Response:', err?.response);
            console.error('Response data:', err?.response?.data);
            console.error('Response status:', err?.response?.status);
            
            if (err?.response?.status === 500) {
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
                const responseData = err.response.data;
                if (typeof responseData === 'string') {
                    errorMessage = responseData;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.error) {
                    errorMessage = responseData.error;
                }
            } else if (err?.response?.status) {
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
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
                {t('Faire une demande') || 'Association Professeur - Étudiant'}
            </h1>

            {error && <ErrorBanner message={error} />}

            {success && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                    {t('associationReussie') || 'Association réussie avec succès!'}
                </div>
            )}

            {!loadingAssociations && associations.length > 0 && (
                <div className="mb-6 max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t('etudiant') || 'Étudiant'}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                {t('professeur') || 'Professeur'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {associations.map((association, index) => (
                                            <tr key={index} className="hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mr-3">
                                                            <svg className="h-5 w-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {association.etudiantNom}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {association.etudiantEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                                                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {association.professeurNom}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-gray-500 dark:text-gray-400">{t('chargementAssociations') || 'Chargement des associations...'}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        {t('etudiant') || 'Étudiant'}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('selectionnerEtudiant') || 'Sélectionner un étudiant'} <span className="text-red-500">*</span>
                        </label>
                        {loadingEtudiants ? (
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                {t('chargement') || 'Chargement...'}
                            </div>
                        ) : (
                            <select
                                value={selectedEtudiantId}
                                onChange={(e) => setSelectedEtudiantId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            >
                                <option value="">{t('selectionnerEtudiant') || 'Sélectionner un étudiant'}</option>
                                {etudiants.length === 0 ? (
                                    <option value="" disabled>{t('aucunEtudiant') || 'Aucun étudiant disponible'}</option>
                                ) : (
                                    etudiants.map((etudiant) => (
                                        <option key={etudiant.id || etudiant.email} value={etudiant.id || etudiant.email}>
                                            {etudiant.firstName} {etudiant.lastName} ({etudiant.email})
                                        </option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        {t('professeur') || 'Professeur'}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('selectionnerProfesseur') || 'Sélectionner un professeur'} <span className="text-red-500">*</span>
                        </label>
                        {loadingProfesseurs ? (
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                {t('chargement') || 'Chargement...'}
                            </div>
                        ) : (
                            <select
                                value={selectedProfesseurId}
                                onChange={(e) => setSelectedProfesseurId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            >
                                <option value="">{t('selectionnerProfesseur') || 'Sélectionner un professeur'}</option>
                                {professeurs.length === 0 ? (
                                    <option value="" disabled>{t('aucunProfesseur') || 'Aucun professeur disponible'}</option>
                                ) : (
                                    professeurs.map((professeur) => (
                                        <option key={professeur.id || professeur.email} value={professeur.id || professeur.email}>
                                            {professeur.firstName} {professeur.lastName} ({professeur.email})
                                        </option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedEtudiantId("");
                            setSelectedProfesseurId("");
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
                        disabled={submitting || !selectedEtudiantId || !selectedProfesseurId}
                        className="px-6 py-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (t('associationEnCours') || 'Association en cours...') : (t('associer') || 'Associer')}
                    </button>
                </div>
            </form>
        </div>
    );
}

