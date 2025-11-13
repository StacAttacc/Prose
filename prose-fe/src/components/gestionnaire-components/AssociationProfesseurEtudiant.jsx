import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useYear } from "../../context/YearContext.jsx";
import { getStageApplicantsManager, associerProfesseurEtudiant } from "../../services/GestionnaireService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function AssociationProfesseurEtudiant() {
    const { user } = useAuth();
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const token = user?.token;

    const [etudiants, setEtudiants] = useState([]);
    const [selectedEtudiant, setSelectedEtudiant] = useState("");
    const [professeurEmail, setProfesseurEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [searchEtudiant, setSearchEtudiant] = useState("");

    useEffect(() => {
        if (token && selectedYear) {
            loadEtudiants();
        }
    }, [token, selectedYear]);

    const loadEtudiants = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStageApplicantsManager(token, selectedYear);
            const etudiantsMap = new Map();
            data.forEach(dto => {
                const etudiant = dto?.etudiant;
                if (etudiant && etudiant.id) {
                    if (!etudiantsMap.has(etudiant.id)) {
                        etudiantsMap.set(etudiant.id, {
                            id: etudiant.id,
                            firstName: etudiant.firstName || '',
                            lastName: etudiant.lastName || '',
                            email: etudiant.email || ''
                        });
                    }
                }
            });
            setEtudiants(Array.from(etudiantsMap.values()));
        } catch (err) {
            setError(err?.message || t('erreurChargementDonnees') || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const filteredEtudiants = etudiants.filter(etudiant => {
        if (!searchEtudiant.trim()) return true;
        const search = searchEtudiant.toLowerCase();
        const fullName = `${etudiant.firstName || ''} ${etudiant.lastName || ''}`.toLowerCase();
        const email = (etudiant.email || '').toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedEtudiant || !professeurEmail.trim()) {
            setError(t('selectionnerEtudiantEtProfesseur') || 'Veuillez sélectionner un étudiant et entrer l\'email du professeur');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccess(false);
            
            await associerProfesseurEtudiant(professeurEmail, selectedEtudiant, token);
            
            setSuccess(true);
            setSelectedEtudiant("");
            setProfesseurEmail("");
            setSearchEtudiant("");
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || t('erreurAssociation') || 'Erreur lors de l\'association');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-center mt-10">{t('chargement') || 'Chargement...'}</p>
            </div>
        );
    }

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
                        {t('Veuillez selectionner un étudiant') || 'Sélectionner un étudiant'}
                    </h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('Rechercher ou entrer l\'email de l\'étudiant') || 'Rechercher'}
                        </label>
                        <input
                            type="text"
                            value={searchEtudiant}
                            onChange={(e) => setSearchEtudiant(e.target.value)}
                            placeholder={t('Veuillez entrer le nom ou l\'email de l\'étudiant') || 'Rechercher par nom ou email...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('etudiant') || 'Étudiant'}
                        </label>
                        <select
                            value={selectedEtudiant}
                            onChange={(e) => setSelectedEtudiant(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            required
                        >
                            <option value="">{t('selectionner') || '-- Sélectionner un étudiant --'}</option>
                            {filteredEtudiants.map((etudiant) => (
                                <option key={etudiant.id} value={etudiant.id}>
                                    {etudiant.firstName} {etudiant.lastName} ({etudiant.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {filteredEtudiants.length === 0 && searchEtudiant && (
                        <p className="text-sm text-gray-500">
                            {t('aucunEtudiantTrouve') || 'Aucun étudiant trouvé'}
                        </p>
                    )}
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
                            setSelectedEtudiant("");
                            setProfesseurEmail("");
                            setSearchEtudiant("");
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
                        disabled={submitting || !selectedEtudiant || !professeurEmail.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (t('associationEnCours') || 'Association en cours...') : (t('associer') || 'Associer')}
                    </button>
                </div>
            </form>
        </div>
    );
}

