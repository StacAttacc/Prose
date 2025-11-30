import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { createEvaluation, getEntentesForEvaluation } from '../../services/EmployeurService';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import EvaluationSignatureModal from '../display-components/EvaluationSignatureModal';
import {useYear} from "../../context/YearContext.jsx";

const SCALE_OPTIONS = ['totalementAccord', 'plutotAccord', 'plutotDesaccord', 'totalementDesaccord', 'na'];
const APPRECIATION_OPTIONS = ['depasseBeaucoup', 'depasse', 'repondPleinement', 'repondPartiellement', 'repondPas'];
const ACCUEIL_OPTIONS = ['oui', 'non', 'peutEtre'];

const initialFormState = (ententeId) => ({
    ententeId: Number(ententeId) || null,
    nomEleve: '',
    programmeEtudes: '',
    nomEntreprise: '',
    nomSuperviseur: '',
    fonction: '',
    telephone: '',
    productivitePlanificationOrganisation: '',
    productiviteComprendDirectives: '',
    productiviteMaintientRythme: '',
    productiviteEtablitPriorites: '',
    productiviteRespectEcheanciers: '',
    productiviteCommentaires: '',
    qualiteRespectMandats: '',
    qualiteAttentionDetails: '',
    qualiteVerifieTravail: '',
    qualitePerfectionnement: '',
    qualiteAnalyseProblemes: '',
    qualiteCommentaires: '',
    relationsContactFacile: '',
    relationsTravailEquipe: '',
    relationsAdaptationCulture: '',
    relationsAccepteCritiques: '',
    relationsRespectueux: '',
    relationsEcouteActive: '',
    relationsCommentaires: '',
    habiletesInteretMotivation: '',
    habiletesExprimeIdees: '',
    habiletesInitiative: '',
    habiletesTravailSecuritaire: '',
    habiletesSensResponsabilites: '',
    habiletesPonctualiteAssiduite: '',
    habiletesCommentaires: '',
    appreciationGlobale: '',
    appreciationPrecisions: '',
    evaluationDiscutee: null,
    heuresEncadrement: '',
    accueillirProchainStage: '',
    formationSuffisante: '',
    signataireNom: '',
    signataireFonction: '',
    signataireDate: '',
});

const SCALE_FIELDS = [
    'productivitePlanificationOrganisation',
    'productiviteComprendDirectives',
    'productiviteMaintientRythme',
    'productiviteEtablitPriorites',
    'productiviteRespectEcheanciers',
    'qualiteRespectMandats',
    'qualiteAttentionDetails',
    'qualiteVerifieTravail',
    'qualitePerfectionnement',
    'qualiteAnalyseProblemes',
    'relationsContactFacile',
    'relationsTravailEquipe',
    'relationsAdaptationCulture',
    'relationsAccepteCritiques',
    'relationsRespectueux',
    'relationsEcouteActive',
    'habiletesInteretMotivation',
    'habiletesExprimeIdees',
    'habiletesInitiative',
    'habiletesTravailSecuritaire',
    'habiletesSensResponsabilites',
    'habiletesPonctualiteAssiduite',
];

const EvaluationForm = () => {
const { t } = useI18n();
    const navigate = useNavigate();
    const { ententeId } = useParams();
    const { user } = useAuth();
    const { selectedYear } = useYear();

    const [formData, setFormData] = useState(() => initialFormState(ententeId));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [entente, setEntente] = useState(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const scaleSections = useMemo(() => ([
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
            commentField: 'productiviteCommentaires',
            commentPlaceholder: t('evaluations.sections.productivity.commentPlaceholder'),
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
            commentField: 'qualiteCommentaires',
            commentPlaceholder: t('evaluations.sections.quality.commentPlaceholder'),
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
            commentField: 'relationsCommentaires',
            commentPlaceholder: t('evaluations.sections.relations.commentPlaceholder'),
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
            commentField: 'habiletesCommentaires',
            commentPlaceholder: t('evaluations.sections.skills.commentPlaceholder'),
        },
    ]), [t]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ententeId, user?.id, user?.token, selectedYear]);

    useEffect(() => {
        if (!entente) return;
        setFormData((prev) => ({
            ...prev,
            ententeId: Number(ententeId) || prev.ententeId,
            nomEleve: prev.nomEleve || `${entente.etudiantPrenom ?? ''} ${entente.etudiantNom ?? ''}`.trim(),
            programmeEtudes: prev.programmeEtudes || entente.discipline || '',
            nomEntreprise: prev.nomEntreprise || user?.company || '',
            signataireNom: prev.signataireNom || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
            signataireFonction: prev.signataireFonction || '',
        }));
    }, [entente, ententeId, user]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const ententes = await getEntentesForEvaluation(user.id, user.token, selectedYear);
            const currentEntente = ententes.find(e => e.id === parseInt(ententeId));

            if (!currentEntente) {
                setError(t('evaluations.ententeNotFound'));
                return;
            }

            setEntente(currentEntente);

            if (currentEntente.hasEvaluation) {
                navigate('/employeur/evaluations');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(t('evaluations.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        handleFieldChange(name, value);
    };

    const validateForm = () => {
        const missingScale = SCALE_FIELDS.find(field => !formData[field]);
        if (missingScale) {
            setError(t('evaluations.validation.scaleMissing'));
            return false;
        }

        const requiredTextFields = [
            'nomEleve',
            'programmeEtudes',
            'nomEntreprise',
            'nomSuperviseur',
            'fonction',
            'telephone',
            'heuresEncadrement',
            'signataireNom',
            'signataireFonction'
        ];

        const missingText = requiredTextFields.find(field => !formData[field]?.trim());
        if (missingText) {
            setError(t('evaluations.validation.requiredFields'));
            return false;
        }

        if (!formData.appreciationGlobale) {
            setError(t('evaluations.validation.appreciationRequired'));
            return false;
        }

        if (formData.evaluationDiscutee === null) {
            setError(t('evaluations.validation.discussionRequired'));
            return false;
        }

        if (!formData.accueillirProchainStage) {
            setError(t('evaluations.validation.receptionRequired'));
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }


        setShowSignatureModal(true);
    };

    const handleSignAndSubmit = async (password) => {
        try {
            setSaving(true);
            setError(null);

            const dataToSubmit = {
                ...formData,
                signataireDate: new Date(),
                password: password
            };

            await createEvaluation(user.id, dataToSubmit);

            setSuccess(true);
            setTimeout(() => {
                navigate('/employeur/evaluations');
            }, 2000);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            throw new Error(err.response?.data?.message || t('evaluations.errorSaving'));
        } finally {
            setSaving(false);
        }
    };

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

    const renderScaleQuestion = (fieldName, label) => (
        <div key={fieldName} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center py-3 border-b border-gray-100 hover:bg-gray-50">
            <div className="text-sm text-gray-700">
                {label} <span className="text-red-500">*</span>
            </div>
            {SCALE_OPTIONS.map(option => (
                <div key={option} className="flex justify-center">
                    <label className="cursor-pointer">
                        <input
                            type="radio"
                            name={fieldName}
                            value={option}
                            className="sr-only"
                            checked={formData[fieldName] === option}
                            onChange={() => handleFieldChange(fieldName, option)}
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            formData[fieldName] === option
                                ? 'bg-teal-600 border-teal-600'
                                : 'bg-white border-gray-300'
                        }`}>
                            {formData[fieldName] === option && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            )}
                        </div>
                    </label>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-10">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.generalInfoSection')}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.studentName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nomEleve"
                                value={formData.nomEleve}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.studentNamePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.programLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="programmeEtudes"
                                value={formData.programmeEtudes}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.programPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.companyName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nomEntreprise"
                                value={formData.nomEntreprise}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.companyPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.supervisorName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nomSuperviseur"
                                value={formData.nomSuperviseur}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.supervisorNamePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.supervisorRole')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fonction"
                                value={formData.fonction}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.supervisorRolePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.supervisorPhone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.supervisorPhonePlaceholder')}
                            />
                        </div>
                    </div>
                </section>

                {scaleSections.map(section => (
                    <section key={section.key}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
                        <p className="text-sm text-gray-600 mb-6">{section.description}</p>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            {renderScaleLegend()}
                            <div>
                                {section.fields.map(field => renderScaleQuestion(field.name, field.label))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.sectionComment')}
                            </label>
                            <textarea
                                name={section.commentField}
                                value={formData[section.commentField]}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={section.commentPlaceholder}
                            />
                        </div>
                    </section>
                ))}

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.appreciationSection')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('evaluations.appreciationDescription')}
                    </p>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 mb-4 pb-2 border-b-2 border-gray-300">
                            <div className="text-sm font-semibold text-gray-700">
                                {t('evaluations.appreciationSection')}
                            </div>
                            {APPRECIATION_OPTIONS.map(option => (
                                <div key={option} className="text-xs font-medium text-center text-gray-600">
                                    {t(`evaluations.appreciation.${option}`)}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr] gap-2 items-center py-3">
                            <div className="text-sm text-gray-700">
                                {t('evaluations.appreciationSection')} <span className="text-red-500">*</span>
                            </div>
                            {APPRECIATION_OPTIONS.map(option => (
                                <div key={option} className="flex justify-center">
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="appreciationGlobale"
                                            className="sr-only"
                                            value={option}
                                            checked={formData.appreciationGlobale === option}
                                            onChange={() => handleFieldChange('appreciationGlobale', option)}
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            formData.appreciationGlobale === option
                                                ? 'bg-teal-600 border-teal-600'
                                                : 'bg-white border-gray-300'
                                        }`}>
                                            {formData.appreciationGlobale === option && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                </svg>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <textarea
                        name="appreciationPrecisions"
                        value={formData.appreciationPrecisions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mt-4"
                        placeholder={t('evaluations.appreciationPlaceholder')}
                    />
                </section>

                <section className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {t('evaluations.discussionSection')}
                        </h2>
                        <p className="text-sm text-gray-600 mb-3">
                            {t('evaluations.discussionQuestion')}
                        </p>
                        <div className="flex gap-3">
                            {[true, false].map(value => (
                                <label
                                    key={value ? 'yes' : 'no'}
                                    className={`cursor-pointer px-4 py-2 rounded border text-sm transition-colors ${
                                        formData.evaluationDiscutee === value
                                            ? 'bg-teal-500 text-white border-teal-500'
                                            : 'bg-white text-gray-700 border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="evaluationDiscutee"
                                        value={value ? 'true' : 'false'}
                                        className="sr-only"
                                        checked={formData.evaluationDiscutee === value}
                                        onChange={event => handleFieldChange('evaluationDiscutee', event.target.value === 'true')}
                                    />
                                    {t(value ? 'evaluations.option.yes' : 'evaluations.option.no')}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {t('evaluations.supervisionHours')}
                        </h2>
                        <input
                            type="text"
                            name="heuresEncadrement"
                            value={formData.heuresEncadrement}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder={t('evaluations.supervisionHoursPlaceholder')}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {t('evaluations.accueillirSection')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                        {t('evaluations.accueillirQuestion')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {ACCUEIL_OPTIONS.map(option => (
                            <label
                                key={option}
                                className={`cursor-pointer px-4 py-2 rounded border text-sm transition-colors ${
                                    formData.accueillirProchainStage === option
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white text-gray-700 border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="accueillirProchainStage"
                                    value={option}
                                    className="sr-only"
                                    checked={formData.accueillirProchainStage === option}
                                    onChange={() => handleFieldChange('accueillirProchainStage', option)}
                                />
                                {t(`evaluations.accueillirOptions.${option}`)}
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {t('evaluations.trainingSection')}
                    </h2>
                    <textarea
                        name="formationSuffisante"
                        value={formData.formationSuffisante}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={t('evaluations.trainingPlaceholder')}
                    />
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('evaluations.signatureSection')}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.signerName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="signataireNom"
                                value={formData.signataireNom}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.signerNamePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('evaluations.signerRole')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="signataireFonction"
                                value={formData.signataireFonction}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={t('evaluations.signerRolePlaceholder')}
                            />
                        </div>
                    </div>
                </section>

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
                        className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium flex items-center justify-center rounded-lg text-sm px-5 py-2.5 text-center me-2"
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
                                {t('evaluations.signature.sign')}
                            </>
                        )}
                    </button>
                </div>
            </form>

            <EvaluationSignatureModal
                evaluation={{
                    nomEleve: formData.nomEleve,
                    nomEntreprise: formData.nomEntreprise,
                    programmeEtudes: formData.programmeEtudes
                }}
                isOpen={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onSign={handleSignAndSubmit}
                isCreating={true}
            />
        </div>
    );
};

export default EvaluationForm;
