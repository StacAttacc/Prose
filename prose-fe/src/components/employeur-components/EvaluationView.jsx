import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { getEvaluationByEntente } from '../../services/EmployeurService';
import { useAuth } from '../../context/AuthContext';
import { FaStar, FaArrowLeft, FaEdit, FaCheckCircle } from 'react-icons/fa';

const EvaluationView = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { ententeId } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evaluation, setEvaluation] = useState(null);

    useEffect(() => {
        loadEvaluation();
    }, [ententeId]);

    const loadEvaluation = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEvaluationByEntente(user.id, ententeId, user.token);
            setEvaluation(data);
        } catch (err) {
            console.error('Erreur lors du chargement de l\'évaluation:', err);
            setError(t('evaluations.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = (value, label) => {
        return (
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
                <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className={`text-2xl ${
                                star <= value ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        />
                    ))}
                    <span className="ml-3 text-gray-600 font-medium">
                        {value}/5
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !evaluation) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error || t('evaluations.notFound')}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/employeur/evaluations')}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                    <FaArrowLeft className="mr-2" />
                    {t('common.back')}
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {t('evaluations.evaluationDetails')}
                        </h1>
                        <p className="text-gray-600">
                            {t('evaluations.student')}: <span className="font-semibold">
                                {evaluation.etudiantPrenom} {evaluation.etudiantNom}
                            </span>
                        </p>
                        <p className="text-gray-600">
                            {t('evaluations.internship')}: <span className="font-semibold">
                                {evaluation.stageTitle}
                            </span>
                        </p>
                        {evaluation.dateEvaluation && (
                            <p className="text-sm text-gray-500 mt-1">
                                {t('evaluations.evaluatedOn')}: {new Date(evaluation.dateEvaluation).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => navigate(`/employeur/evaluations/evaluer/${ententeId}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center"
                    >
                        <FaEdit className="mr-2" />
                        {t('common.edit')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Section des évaluations par critères */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2 flex items-center">
                        <FaCheckCircle className="text-green-600 mr-2" />
                        {t('evaluations.performanceCriteria')}
                    </h2>

                    {renderStarRating(evaluation.productivite, t('evaluations.productivity'))}
                    {renderStarRating(evaluation.qualiteTravail, t('evaluations.workQuality'))}
                    {renderStarRating(evaluation.relationsInterpersonnelles, t('evaluations.interpersonalRelations'))}
                    {renderStarRating(evaluation.habiletesPersonnelles, t('evaluations.personalSkills'))}
                    {renderStarRating(evaluation.appreciationGlobale, t('evaluations.overallAppreciation'))}
                </div>

                {/* Section des commentaires */}
                {(evaluation.commentaires || evaluation.pointsForts || evaluation.pointsAmelioration) && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                            {t('evaluations.comments')}
                        </h2>

                        {evaluation.commentaires && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('evaluations.generalComments')}
                                </label>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {evaluation.commentaires}
                                    </p>
                                </div>
                            </div>
                        )}

                        {evaluation.pointsForts && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('evaluations.strengths')}
                                </label>
                                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {evaluation.pointsForts}
                                    </p>
                                </div>
                            </div>
                        )}

                        {evaluation.pointsAmelioration && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('evaluations.areasForImprovement')}
                                </label>
                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {evaluation.pointsAmelioration}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Section informations complémentaires */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.additionalInfo')}
                    </h2>

                    {evaluation.heureEncadrement && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('evaluations.supervisorName')}
                            </label>
                            <p className="text-gray-900">{evaluation.heureEncadrement}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center">
                            <div className={`h-5 w-5 rounded ${
                                evaluation.gardeContact ? 'bg-green-500' : 'bg-gray-300'
                            } mr-3 flex items-center justify-center`}>
                                {evaluation.gardeContact && (
                                    <FaCheckCircle className="text-white text-xs" />
                                )}
                            </div>
                            <span className="text-sm text-gray-700">
                                {t('evaluations.keepContact')}
                            </span>
                        </div>

                        <div className="flex items-center">
                            <div className={`h-5 w-5 rounded ${
                                evaluation.rehireEtudiant ? 'bg-green-500' : 'bg-gray-300'
                            } mr-3 flex items-center justify-center`}>
                                {evaluation.rehireEtudiant && (
                                    <FaCheckCircle className="text-white text-xs" />
                                )}
                            </div>
                            <span className="text-sm text-gray-700">
                                {t('evaluations.wouldRehire')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Métadonnées */}
                <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                    {evaluation.dateCreation && (
                        <p>
                            {t('evaluations.createdOn')}: {new Date(evaluation.dateCreation).toLocaleString()}
                        </p>
                    )}
                    {evaluation.dateModification && (
                        <p>
                            {t('evaluations.lastModified')}: {new Date(evaluation.dateModification).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationView;