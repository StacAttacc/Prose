import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useYear } from '../../context/YearContext';
import { getCandidaturesProfesseur } from '../../services/ProfesseurService';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../display-components/ErrorBanner';
import { FaCheckCircle, FaExclamationCircle, FaFileAlt } from 'react-icons/fa';

export default function ListeCandidaturesProfesseur() {
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCandidatures() {
            if (!user?.id || !user?.token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getCandidaturesProfesseur(user.id, selectedYear, user.token);
                setCandidatures(data || []);
                console.log(data)
            } catch (err) {
                console.error('Erreur lors du chargement des candidatures:', err);
                setError(t('erreurChargementCandidatures') || 'Erreur lors du chargement des candidatures');
            } finally {
                setLoading(false);
            }
        }

        if (selectedYear) {
            loadCandidatures();
        }
    }, [user?.id, user?.token, selectedYear, t]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorBanner message={error} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('professeur.candidaturesEtudiants') || 'Candidatures de mes étudiants'}
                </h1>
                <p className="text-gray-600">
                    {t('professeur.candidaturesDescription') || 'Évaluez le milieu de travail pour les stages de vos étudiants'}
                </p>
            </div>

            {candidatures.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('professeur.aucuneCandidature') || 'Aucune candidature'}
                    </h3>
                    <p className="text-gray-500">
                        {t('professeur.aucuneCandidatureDescription') || 'Aucune candidature trouvée pour vos étudiants cette année.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {candidatures.map((candidature) => (
                        <div
                            key={candidature.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {candidature.etudiant?.firstName} {candidature.etudiant?.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {t('professeur.stageName') || 'Stage Name'}: {candidature.stage.title}
                                        </p>
                                    </div>
                                    {candidature.evaluationMillieu ? (
                                        <FaCheckCircle className="h-6 w-6 text-green-500" title={t('professeur.evaluationCompletee') || 'Évaluation complétée'} />
                                    ) : (
                                        <FaFileAlt className="h-6 w-6 text-gray-400" title={t('professeur.evaluationEnAttente') || 'Évaluation en attente'} />
                                    )}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    {candidature.evaluationMillieu ? (
                                        <button
                                            onClick={() => navigate(`/professeur/evaluations/${candidature.id}`, { state: { stage: candidature.stage } })}
                                            className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                        >
                                            {t('professeur.voirEvaluation') || 'Voir l\'évaluation'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/professeur/evaluations/${candidature.id}`, { state: { stage: candidature.stage } })}
                                            className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                        >
                                            {t('professeur.evaluerMilieu') || 'Évaluer le milieu'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

