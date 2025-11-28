import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { getEvaluationByEntente } from '../../services/EmployeurService';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import ScrollToTop from "../common/ScrollToTop.jsx";

const SCALE_SECTIONS = (t) => ([
    {
        key: 'productivity',
        title: t('evaluations.sections.productivity.title'),
        description: t('evaluations.sections.productivity.description'),
        fields: [
            { name: 'productivitePlanificationOrganisation', label: t('evaluations.sections.productivity.planificationOrganisation') },
            { name: 'productiviteComprendDirectives', label: t('evaluations.sections.productivity.comprendDirectives') },
            { name: 'productiviteMaintientRythme', label: t('evaluations.sections.productivity.maintientRythme') },
            { name: 'productiviteEtablitPriorites', label: t('evaluations.sections.productivity.etablitPriorites') },
            { name: 'productiviteRespectEcheanciers', label: t('evaluations.sections.productivity.respectEcheanciers') },
        ],
        commentField: 'productiviteCommentaires'
    },
    {
        key: 'quality',
        title: t('evaluations.sections.quality.title'),
        description: t('evaluations.sections.quality.description'),
        fields: [
            { name: 'qualiteRespectMandats', label: t('evaluations.sections.quality.respectMandats') },
            { name: 'qualiteAttentionDetails', label: t('evaluations.sections.quality.attentionDetails') },
            { name: 'qualiteVerifieTravail', label: t('evaluations.sections.quality.verifieTravail') },
            { name: 'qualitePerfectionnement', label: t('evaluations.sections.quality.perfectionnement') },
            { name: 'qualiteAnalyseProblemes', label: t('evaluations.sections.quality.analyseProblemes') },
        ],
        commentField: 'qualiteCommentaires'
    },
    {
        key: 'relations',
        title: t('evaluations.sections.relations.title'),
        description: t('evaluations.sections.relations.description'),
        fields: [
            { name: 'relationsContactFacile', label: t('evaluations.sections.relations.contactFacile') },
            { name: 'relationsTravailEquipe', label: t('evaluations.sections.relations.travailEquipe') },
            { name: 'relationsAdaptationCulture', label: t('evaluations.sections.relations.adaptationCulture') },
            { name: 'relationsAccepteCritiques', label: t('evaluations.sections.relations.accepteCritiques') },
            { name: 'relationsRespectueux', label: t('evaluations.sections.relations.respectueux') },
            { name: 'relationsEcouteActive', label: t('evaluations.sections.relations.ecouteActive') },
        ],
        commentField: 'relationsCommentaires'
    },
    {
        key: 'skills',
        title: t('evaluations.sections.skills.title'),
        description: t('evaluations.sections.skills.description'),
        fields: [
            { name: 'habiletesInteretMotivation', label: t('evaluations.sections.skills.interetMotivation') },
            { name: 'habiletesExprimeIdees', label: t('evaluations.sections.skills.exprimeIdees') },
            { name: 'habiletesInitiative', label: t('evaluations.sections.skills.initiative') },
            { name: 'habiletesTravailSecuritaire', label: t('evaluations.sections.skills.travailSecuritaire') },
            { name: 'habiletesSensResponsabilites', label: t('evaluations.sections.skills.sensResponsabilites') },
            { name: 'habiletesPonctualiteAssiduite', label: t('evaluations.sections.skills.ponctualiteAssiduite') },
        ],
        commentField: 'habiletesCommentaires'
    }
]);

const EvaluationView = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { ententeId } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const scaleSections = useMemo(() => SCALE_SECTIONS(t), [t]);

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


    const SCALE_OPTIONS = ['totalementAccord', 'plutotAccord', 'plutotDesaccord', 'totalementDesaccord', 'na'];

    const renderScaleLegend = () => (
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 mb-4 pb-2 border-b-2 border-gray-300">
            <div className="text-sm font-semibold text-gray-700">
                {t('evaluations.sections.criteria')}
            </div>
            {SCALE_OPTIONS.map(option => (
                <div key={option} className="text-xs font-medium text-center text-gray-600">
                    {t(`evaluations.scale.${option}`)}
                </div>
            ))}
        </div>
    );

    const renderScaleQuestion = (fieldName, label, value) => (
        <div key={fieldName} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center py-3 border-b border-gray-100 hover:bg-gray-50">
            <div className="text-sm text-gray-700">{label}</div>
            {SCALE_OPTIONS.map(option => (
                <div key={option} className="flex justify-center">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        value === option
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                    }`}>
                        {value === option && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderScaleSection = (section) => (
        <section key={section.key}>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 mb-6">{section.description}</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                {renderScaleLegend()}
                <div>
                    {section.fields.map(field => renderScaleQuestion(field.name, field.label, evaluation[field.name]))}
                </div>
            </div>
            {evaluation[section.commentField] && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('evaluations.sectionComment')}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{evaluation[section.commentField]}</p>
                </div>
            )}
        </section>
    );

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

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('evaluations.evaluationDetails')}
                    </h1>
                    <p className="text-gray-600">
                        {t('evaluations.student')}: <span className="font-semibold">
                            {evaluation.nomEleve || `${evaluation.etudiantPrenom ?? ''} ${evaluation.etudiantNom ?? ''}`}
                        </span>
                    </p>
                    <p className="text-gray-600">
                        {t('evaluations.programLabel')}: <span className="font-semibold">
                            {evaluation.programmeEtudes || '-'}
                        </span>
                    </p>
                    <p className="text-gray-600">
                        {t('evaluations.companyName')}: <span className="font-semibold">
                            {evaluation.nomEntreprise || '-'}
                        </span>
                    </p>
                    {evaluation.dateEvaluation && (
                        <p className="text-sm text-gray-500 mt-1">
                            {t('evaluations.evaluatedOn')}: {new Date(evaluation.dateEvaluation).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 space-y-10">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.performanceCriteria')}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">
                                {t('evaluations.supervisorName')}
                            </p>
                            <p className="text-gray-900 font-medium">{evaluation.nomSuperviseur || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {t('evaluations.supervisorRole')}
                            </p>
                            <p className="text-gray-900 font-medium">{evaluation.fonction || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {t('evaluations.supervisorPhone')}
                            </p>
                            <p className="text-gray-900 font-medium">{evaluation.telephone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                {t('evaluations.supervisionHours')}
                            </p>
                            <p className="text-gray-900 font-medium">{evaluation.heuresEncadrement || '-'}</p>
                        </div>
                    </div>
                </section>

                {scaleSections.map(section => renderScaleSection(section))}

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {t('evaluations.appreciationSection')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">{t('evaluations.appreciationDescription')}</p>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        {/* Légende */}
                        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 mb-4 pb-2 border-b-2 border-gray-300">
                            <div className="text-sm font-semibold text-gray-700">
                                {t('evaluations.appreciationSection')}
                            </div>
                            {['depasseBeaucoup', 'depasse', 'repondPleinement', 'repondPartiellement', 'repondPas'].map(option => (
                                <div key={option} className="text-xs font-medium text-center text-gray-600">
                                    {t(`evaluations.appreciation.${option}`)}
                                </div>
                            ))}
                        </div>

                        {/* Ligne d'évaluation */}
                        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center py-3">
                            <div className="text-sm text-gray-700">{t('evaluations.appreciationSection')}</div>
                            {['depasseBeaucoup', 'depasse', 'repondPleinement', 'repondPartiellement', 'repondPas'].map(option => (
                                <div key={option} className="flex justify-center">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        evaluation.appreciationGlobale === option
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-white border-gray-300'
                                    }`}>
                                        {evaluation.appreciationGlobale === option && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {evaluation.appreciationPrecisions && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.sectionComment')}
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {evaluation.appreciationPrecisions}
                            </p>
                        </div>
                    )}
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {t('evaluations.discussionSection')}
                        </h2>
                        <p className="text-gray-800 font-medium">
                            {evaluation.evaluationDiscutee ? t('evaluations.option.yes') : t('evaluations.option.no')}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {t('evaluations.accueillirSection')}
                        </h2>
                        <p className="text-gray-800 font-medium">
                            {evaluation.accueillirProchainStage
                                ? t(`evaluations.accueillirOptions.${evaluation.accueillirProchainStage}`)
                                : '-'}
                        </p>
                    </div>
                </section>

                {evaluation.formationSuffisante && (
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            {t('evaluations.trainingSection')}
                        </h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {evaluation.formationSuffisante}
                            </p>
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        {t('evaluations.signatureSection')}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-500">{t('evaluations.signerName')}</p>
                            <p className="text-gray-900 font-medium">{evaluation.signataireNom || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('evaluations.signerRole')}</p>
                            <p className="text-gray-900 font-medium">{evaluation.signataireFonction || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('evaluations.signerDate')}</p>
                            <p className="text-gray-900 font-medium">
                                {evaluation.signataireDate ? new Date(evaluation.signataireDate).toLocaleDateString() : '-'}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="pt-6 border-t text-sm text-gray-500">
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

                {/* Section Signature - Affichage uniquement */}
                {evaluation.signatureEmployeur && (
                    <div className="pt-6 border-t mt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 font-medium">
                                ✓ {t('evaluations.signature.alreadySigned')}
                            </p>
                            {evaluation.dateSignature && (
                                <p className="text-sm text-green-600 mt-1">
                                    {t('evaluations.signature.signedOn')} {new Date(evaluation.dateSignature).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    );
};

export default EvaluationView;