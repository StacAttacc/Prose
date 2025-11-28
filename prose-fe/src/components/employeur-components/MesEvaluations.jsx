import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useYear } from '../../context/YearContext';
import { getEntentesForEvaluation } from '../../services/EmployeurService';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaExclamationCircle, FaStar } from 'react-icons/fa';

const MesEvaluations = () => {
    const { t } = useI18n();
    const { selectedYear } = useYear();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ententes, setEntentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadEntentes() {
            try {
                setLoading(true);
                setError(null);
                const data = await getEntentesForEvaluation(user.id, user.token, selectedYear);
                setEntentes(data || []);
                console.log(data)
            } catch (err) {
                console.error('Erreur lors du chargement des ententes:', err);
                setError(t('evaluations.errorLoading'));
            } finally {
                setLoading(false);
            }
        }

        if (user?.id && user?.token && selectedYear) {
            loadEntentes();
        }
    }, [user.id, user.token, selectedYear, t]);

    const handleEvaluate = (entente) => {
        navigate(`/employeur/evaluations/evaluer/${entente.id}`);
    };

    const handleViewEvaluation = (entente) => {
        navigate(`/employeur/evaluations/voir/${entente.id}`);
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
                    {t('evaluations.title')}
                </h1>
                <p className="text-gray-600">
                    {t('evaluations.subtitle')}
                </p>
            </div>

            {ententes.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('evaluations.noInterns')}
                    </h3>
                    <p className="text-gray-500">
                        {t('evaluations.noInternsDescription')}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {ententes.map((entente) => (
                        <div
                            key={entente.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {entente.etudiantPrenom} {entente.etudiantNom}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {entente.stageTitle}
                                        </p>
                                    </div>
                                    {entente.hasEvaluation ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <FaCheckCircle className="mr-1" />
                                            {t('evaluations.evaluated')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <FaExclamationCircle className="mr-1" />
                                            {t('evaluations.pending')}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {t('evaluations.internshipStatus')}
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {entente.status === 'SIGNEE'
                                            ? t('evaluations.statusSigned')
                                            : t('evaluations.statusPending')}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {entente.hasEvaluation ? (
                                        <button
                                            onClick={() => handleViewEvaluation(entente)}
                                            className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm flex items-center justify-center px-5 py-2.5 text-center me-2"
                                        >
                                            <FaStar className="mr-2" />
                                            {t('evaluations.viewEvaluation')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEvaluate(entente)}
                                            className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm flex items-center justify-center px-5 py-2.5 text-center me-2"
                                        >
                                            <FaStar className="mr-2" />
                                            {t('evaluations.evaluate')}
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
};

export default MesEvaluations;