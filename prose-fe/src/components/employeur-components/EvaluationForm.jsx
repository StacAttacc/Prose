import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import {
    createEvaluation,
    getEntentesForEvaluation
} from '../../services/EmployeurService';
import { useAuth } from '../../context/AuthContext';
import { FaStar, FaArrowLeft, FaSave } from 'react-icons/fa';

const EvaluationForm = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { ententeId } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [entente, setEntente] = useState(null);

    const [formData, setFormData] = useState({
        ententeId: parseInt(ententeId),
        productivite: 0,
        qualiteTravail: 0,
        relationsInterpersonnelles: 0,
        habiletesPersonnelles: 0,
        appreciationGlobale: 0,
        commentaires: '',
        pointsForts: '',
        pointsAmelioration: '',
        heureEncadrement: '',
        gardeContact: false,
        rehireEtudiant: false
    });

    useEffect(() => {
        loadData();
    }, [ententeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const ententes = await getEntentesForEvaluation(user.id, user.token);
            const currentEntente = ententes.find(e => e.id === parseInt(ententeId));

            if (!currentEntente) {
                setError(t('evaluations.ententeNotFound'));
                return;
            }

            setEntente(currentEntente);

            if (currentEntente.hasEvaluation) {
                navigate('/employeur/evaluations');
                return;
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(t('evaluations.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const requiredRatings = [
            'productivite',
            'qualiteTravail',
            'relationsInterpersonnelles',
            'habiletesPersonnelles',
            'appreciationGlobale'
        ];

        for (const field of requiredRatings) {
            if (!formData[field] || formData[field] === 0) {
                setError(t('evaluations.allRatingsRequired'));
                return false;
            }
        }

        if (!formData.heureEncadrement || formData.heureEncadrement.trim() === '') {
            setError(t('evaluations.supervisorRequired'));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await createEvaluation(user.id, formData, user.token);

            setSuccess(true);
            setTimeout(() => {
                navigate('/employeur/evaluations');
            }, 2000);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError(t('evaluations.errorSaving'));
        } finally {
            setSaving(false);
        }
    };

    const renderStarRating = (field, label) => {
        const currentValue = formData[field];

        return (
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingChange(field, value)}
                            className={`text-3xl transition-colors duration-200 ${
                                value <= currentValue
                                    ? 'text-yellow-400 hover:text-yellow-500'
                                    : 'text-gray-300 hover:text-gray-400'
                            }`}
                        >
                            <FaStar />
                        </button>
                    ))}
                    <span className="ml-3 text-gray-600 font-medium">
                        {currentValue > 0 ? `${currentValue}/5` : t('evaluations.notRated')}
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

    if (!entente) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error || t('evaluations.ententeNotFound')}
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

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('evaluations.newEvaluation')}
                </h1>
                <p className="text-gray-600">
                    {t('evaluations.evaluatingStudent')}: <span className="font-semibold">
                        {entente.etudiantPrenom} {entente.etudiantNom}
                    </span>
                </p>
                <p className="text-gray-600">
                    {t('evaluations.internship')}: <span className="font-semibold">
                        {entente.stageTitle}
                    </span>
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    {t('evaluations.successMessage')}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                {/* Section des évaluations par critères */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.performanceCriteria')}
                    </h2>

                    {renderStarRating('productivite', t('evaluations.productivity'))}
                    {renderStarRating('qualiteTravail', t('evaluations.workQuality'))}
                    {renderStarRating('relationsInterpersonnelles', t('evaluations.interpersonalRelations'))}
                    {renderStarRating('habiletesPersonnelles', t('evaluations.personalSkills'))}
                    {renderStarRating('appreciationGlobale', t('evaluations.overallAppreciation'))}
                </div>

                {/* Section des commentaires */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.comments')}
                    </h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('evaluations.generalComments')}
                        </label>
                        <textarea
                            name="commentaires"
                            value={formData.commentaires}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('evaluations.generalCommentsPlaceholder')}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('evaluations.strengths')}
                        </label>
                        <textarea
                            name="pointsForts"
                            value={formData.pointsForts}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('evaluations.strengthsPlaceholder')}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('evaluations.areasForImprovement')}
                        </label>
                        <textarea
                            name="pointsAmelioration"
                            value={formData.pointsAmelioration}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('evaluations.areasForImprovementPlaceholder')}
                        />
                    </div>
                </div>

                {/* Section informations complémentaires */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.additionalInfo')}
                    </h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('evaluations.supervisorName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="heureEncadrement"
                            value={formData.heureEncadrement}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('evaluations.supervisorNamePlaceholder')}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="gardeContact"
                                checked={formData.gardeContact}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                {t('evaluations.keepContact')}
                            </span>
                        </label>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="rehireEtudiant"
                                checked={formData.rehireEtudiant}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                {t('evaluations.wouldRehire')}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/employeur/evaluations')}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
                        disabled={saving}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                {t('common.saving')}
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" />
                                {t('common.submit')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EvaluationForm;
