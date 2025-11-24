import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useYear } from '../../context/YearContext';
import { getCandidaturesEnStage } from '../../services/GestionnaireService';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../display-components/ErrorBanner';
import { FaCheckCircle, FaExclamationCircle, FaStar } from 'react-icons/fa';

export default function ListeEtudiantsEnStage() {
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCandidatures() {
            if (!user?.token || !selectedYear) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getCandidaturesEnStage(selectedYear, user.token);
                setCandidatures(data || []);
            } catch (err) {
                console.error('Erreur lors du chargement des candidatures:', err);
                setError(t('gestionnaire.erreurChargementCandidatures') || 'Erreur lors du chargement des candidatures');
            } finally {
                setLoading(false);
            }
        }

        if (selectedYear) {
            loadCandidatures();
        }
    }, [user?.token, selectedYear, t, location.pathname]);

    const handleEvaluateWorkplace = (candidature) => {
        navigate(`/gestionnaire/evaluations-milieu/evaluer/${candidature.id}`);
    };

    const handleViewEvaluation = (candidature) => {
        if (candidature.evaluationMillieu) {
            navigate(`/gestionnaire/evaluations-milieu/voir/${candidature.id}`);
        }
    };

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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">{t('common.error')}</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('gestionnaire.evaluationMilieuStage') || 'Évaluation milieu de stage'}
                </h1>
                <p className="text-gray-600">
                    {t('gestionnaire.evaluationMilieuDescription') || 'Évaluez le milieu de stage pour les étudiants en stage'}
                </p>
            </div>

            {candidatures.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('gestionnaire.aucuneCandidatureEnStage') || 'Aucune candidature en stage'}
                    </h3>
                    <p className="text-gray-500">
                        {t('gestionnaire.aucuneCandidatureEnStageDescription') || 'Aucune candidature avec stage en cours trouvée.'}
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
                                            {candidature.stage?.title || 'N/A'}
                                        </p>
                                    </div>
                                    {candidature.evaluationMillieu ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <FaCheckCircle className="mr-1" />
                                            {t('gestionnaire.evaluationCompletee') || 'Évalué'}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <FaExclamationCircle className="mr-1" />
                                            {t('gestionnaire.evaluationEnAttente') || 'En attente'}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {t('gestionnaire.statutStage') || 'Statut du stage'}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {candidature.status === 'CONFIRMER' || candidature.status === 'ACCEPTEE'
                                            ? t('gestionnaire.ententeSignee') || 'Entente signée'
                                            : t('gestionnaire.enAttente') || 'En attente'}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {candidature.evaluationMillieu ? (
                                        <button
                                            onClick={() => handleViewEvaluation(candidature)}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                                        >
                                            <FaStar className="mr-2" />
                                            {t('gestionnaire.voirEvaluation') || 'Voir l\'évaluation'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEvaluateWorkplace(candidature)}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                                        >
                                            <FaStar className="mr-2" />
                                            {t('gestionnaire.evaluerMilieu') || 'Évaluer'}
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

