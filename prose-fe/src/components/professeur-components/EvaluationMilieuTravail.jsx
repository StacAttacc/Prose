import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { evaluateWorkplace, getCandidaturesProfesseur } from '../../services/ProfesseurService';
import { useAuth } from '../../context/AuthContext';
import { useYear } from '../../context/YearContext';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import ErrorBanner from '../display-components/ErrorBanner';

const COTE_OPTIONS = [
    { value: 'TOTALEMENT_EN_ACCORD', label: 'Totalement en accord' },
    { value: 'PLUTOT_EN_ACCORD', label: 'Plutôt en accord' },
    { value: 'PLUTOT_DESACCORD', label: 'Plutôt désaccord' },
    { value: 'TOTALEMENT_DESACCORD', label: 'Totalement en désaccord' },
    { value: 'IMPOSIBLE_PRONONCER', label: 'Impossible de se prononcer' }
];

const initialFormState = (candidatureId) => ({
    // Informations sur l'entreprise
    nomEntreprise: '',
    personneContact: '',
    addresse: '',
    numeroTelephone: '',
    ville: '',
    telecopieur: '',
    codePostal: '',
    
    // Informations sur le stage
    nomStagiaire: '',
    dateStage: '',
    numeroStage: 1,
    
    // Évaluations (CoteEvaluation)
    tachesCoformes: '',
    faciliteIntegration: '',
    tempsEstReel: '',
    
    // Horaires
    hrSemaineMois: [],
    
    // Autres évaluations
    hygieneRespectable: '',
    climatTravailAgreable: '',
    accessibleTransportCommun: '',
    salaireIneteressant: '',
    salaire: '',
    communicationSuperviseurFacile: '',
    equipementAdequat: '',
    volumeTravailAcceptable: '',
    commentaires: '',
    
    // Autres informations
    privilegieStage: 0,
    nbStagiaires: 0,
    desireAutreStagiaires: false,
    quartsVariables: false,
    debutQuarts: [],
    finQuarts: [],

    candidatureId: candidatureId,
    
    // Signature
    tempsSignature: null
});

export default function EvaluationMilieuTravail() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { candidatureId } = useParams();
    const { user } = useAuth();
    const { selectedYear } = useYear();
    
    const [formData, setFormData] = useState(() => initialFormState(candidatureId));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [candidature, setCandidature] = useState(null);

    useEffect(() => {
        loadCandidature();
    }, [candidatureId, user?.id, user?.token, selectedYear]);

    const loadCandidature = async () => {
        if (!user?.id || !user?.token || !selectedYear) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const candidatures = await getCandidaturesProfesseur(user.id, selectedYear, user.token);
            const currentCandidature = candidatures.find(c => c.id === parseInt(candidatureId));

            if (!currentCandidature) {
                setError(t('professeur.candidatureNonTrouvee') || 'Candidature non trouvée');
                return;
            }

            setCandidature(currentCandidature);

            // Si une évaluation existe déjà, pré-remplir le formulaire
            if (currentCandidature.evaluationMillieu) {
                const evalData = currentCandidature.evaluationMillieu;
                setFormData(prev => ({
                    ...prev,
                    candidatureId: prev.candidatureId,
                    nomEntreprise: evalData.nomEntreprise || '',
                    personneContact: evalData.personneContact || '',
                    addresse: evalData.addresse || '',
                    numeroTelephone: evalData.numeroTelephone || '',
                    ville: evalData.ville || '',
                    telecopieur: evalData.telecopieur || '',
                    codePostal: evalData.codePostal || '',
                    nomStagiaire: evalData.nomStagiaire || '',
                    dateStage: evalData.dateStage || '',
                    numeroStage: evalData.numeroStage || 1,
                    tachesCoformes: evalData.tachesCoformes || '',
                    faciliteIntegration: evalData.faciliteIntegration || '',
                    tempsEstReel: evalData.tempsEstReel || '',
                    hrSemaineMois: evalData.hrSemaineMois || [],
                    hygieneRespectable: evalData.hygieneRespectable || '',
                    climatTravailAgreable: evalData.climatTravailAgreable || '',
                    accessibleTransportCommun: evalData.accessibleTransportCommun || '',
                    salaireIneteressant: evalData.salaireIneteressant || '',
                    salaire: evalData.salaire || '',
                    communicationSuperviseurFacile: evalData.communicationSuperviseurFacile || '',
                    equipementAdequat: evalData.equipementAdequat || '',
                    volumeTravailAcceptable: evalData.volumeTravailAcceptable || '',
                    commentaires: evalData.commentaires || '',
                    privilegieStage: evalData.privilegieStage || 0,
                    nbStagiaires: evalData.nbStagiaires || 0,
                    desireAutreStagiaires: evalData.desireAutreStagiaires || false,
                    quartsVariables: evalData.quartsVariables || false,
                    debutQuarts: evalData.debutQuarts || [],
                    finQuarts: evalData.finQuarts || [],
                }));
            } else {
                // Pré-remplir avec les informations de l'étudiant si disponibles
                if (currentCandidature.etudiant) {
                    setFormData(prev => ({
                        ...prev,
                        nomStagiaire: `${currentCandidature.etudiant.firstName || ''} ${currentCandidature.etudiant.lastName || ''}`.trim()
                    }));
                }
            }
        } catch (err) {
            console.error('Erreur lors du chargement de la candidature:', err);
            setError(t('professeur.erreurChargement') || 'Erreur lors du chargement de la candidature');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Validation des champs requis
        const requiredFields = [
            'nomEntreprise',
            'personneContact',
            'addresse',
            'numeroTelephone',
            'ville',
            'codePostal',
            'nomStagiaire',
            'dateStage'
        ];

        const missingField = requiredFields.find(field => !formData[field]?.trim());
        if (missingField) {
            setError(t('professeur.champRequis') || `Le champ ${missingField} est requis`);
            return false;
        }

        // Validation des évaluations (CoteEvaluation)
        const evaluationFields = [
            'tachesCoformes',
            'faciliteIntegration',
            'tempsEstReel',
            'hygieneRespectable',
            'climatTravailAgreable',
            'accessibleTransportCommun',
            'salaireIneteressant',
            'communicationSuperviseurFacile',
            'equipementAdequat',
            'volumeTravailAcceptable'
        ];

        const missingEvaluation = evaluationFields.find(field => !formData[field]);
        if (missingEvaluation) {
            setError(t('professeur.evaluationRequis') || 'Toutes les évaluations sont requises');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Préparer les données pour l'envoi
            const evaluationData = {
                ...formData,
                tempsSignature: new Date().toISOString()
            };

            await evaluateWorkplace(candidature.id, evaluationData, user.token);

            setSuccess(true);
            navigate("/professeur/evaluations-milieu")
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError(err.response?.data?.message || err.message || t('professeur.erreurSauvegarde') || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const renderCoteQuestion = (fieldName, label) => (
        <div key={fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
                {COTE_OPTIONS.map(option => (
                    <label
                        key={option.value}
                        className={`cursor-pointer px-3 py-2 rounded border text-sm text-center transition-colors ${
                            formData[fieldName] === option.value
                                ? 'text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm text-center'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <input
                            type="radio"
                            name={fieldName}
                            value={option.value}
                            className="sr-only"
                            checked={formData[fieldName] === option.value}
                            onChange={() => handleSelectChange(fieldName, option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!candidature) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorBanner message={error || t('professeur.candidatureNonTrouvee') || 'Candidature non trouvée'} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/professeur/evaluations-milieu')}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                    <FaArrowLeft className="mr-2" />
                    {t('common.back') || 'Retour'}
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('professeur.evaluationMilieuStage') || 'Évaluation du milieu de travail'}
                </h1>
                <p className="text-gray-600">
                    {t('professeur.evaluantStage') || 'Évaluant le stage de'}: <span className="font-semibold">
                        {candidature.etudiant?.firstName} {candidature.etudiant?.lastName}
                    </span>
                </p>
            </div>

            {error && <ErrorBanner message={error} />}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    {t('professeur.evaluationSauvegardee') || 'Évaluation sauvegardée avec succès !'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
                {/* Informations sur l'entreprise */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('professeur.informationsEntreprise') || 'Informations sur l\'entreprise'}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="nomEntreprise" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.nomEntreprise') || 'Nom de l\'entreprise'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nomEntreprise"
                                type="text"
                                name="nomEntreprise"
                                value={formData.nomEntreprise}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.personneContact') || 'Personne contact'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="personneContact"
                                value={formData.personneContact}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.adresse') || 'Adresse'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="addresse"
                                value={formData.addresse}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.ville') || 'Ville'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ville"
                                value={formData.ville}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.codePostal') || 'Code postal'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="codePostal"
                                value={formData.codePostal}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.telephone') || 'Téléphone'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="numeroTelephone"
                                value={formData.numeroTelephone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.telecopieur') || 'Télécopieur'}
                            </label>
                            <input
                                type="text"
                                name="telecopieur"
                                value={formData.telecopieur}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Informations sur le stage */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('professeur.informationsStage') || 'Informations sur le stage'}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.nomStagiaire') || 'Nom du stagiaire'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nomStagiaire"
                                value={formData.nomStagiaire}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.dateStage') || 'Date du stage'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="dateStage"
                                value={formData.dateStage}
                                onChange={handleInputChange}
                                placeholder="Ex: 2025-01-15 au 2025-04-30"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.numeroStage') || 'Numéro de stage'}
                            </label>
                            <input
                                type="number"
                                name="numeroStage"
                                value={formData.numeroStage}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                            />
                        </div>
                    </div>
                </section>

                {/* Évaluations */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('professeur.evaluations') || 'Évaluations'}
                    </h2>
                    <div className="space-y-6">
                        {renderCoteQuestion('tachesCoformes', t('professeur.tachesCoformes') || 'Les tâches confiées correspondent aux objectifs de stage')}
                        {renderCoteQuestion('faciliteIntegration', t('professeur.faciliteIntegration') || 'Facilité d\'intégration dans l\'équipe')}
                        {renderCoteQuestion('tempsEstReel', t('professeur.tempsEstReel') || 'Le temps alloué est réaliste pour les tâches confiées')}
                        {renderCoteQuestion('hygieneRespectable', t('professeur.hygieneRespectable') || 'L\'hygiène est respectable')}
                        {renderCoteQuestion('climatTravailAgreable', t('professeur.climatTravailAgreable') || 'Le climat de travail est agréable')}
                        {renderCoteQuestion('accessibleTransportCommun', t('professeur.accessibleTransportCommun') || 'Accessible en transport en commun')}
                        {renderCoteQuestion('salaireIneteressant', t('professeur.salaireIneteressant') || 'Le salaire est intéressant')}
                        {renderCoteQuestion('communicationSuperviseurFacile', t('professeur.communicationSuperviseurFacile') || 'La communication avec le superviseur est facile')}
                        {renderCoteQuestion('equipementAdequat', t('professeur.equipementAdequat') || 'L\'équipement est adéquat')}
                        {renderCoteQuestion('volumeTravailAcceptable', t('professeur.volumeTravailAcceptable') || 'Le volume de travail est acceptable')}
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('professeur.salaire') || 'Salaire'}
                        </label>
                        <input
                            type="text"
                            name="salaire"
                            value={formData.salaire}
                            onChange={handleInputChange}
                            placeholder="Ex: 25$/h"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('professeur.commentaires') || 'Commentaires'}
                        </label>
                        <textarea
                            name="commentaires"
                            value={formData.commentaires}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('professeur.commentairesPlaceholder') || 'Ajoutez vos commentaires...'}
                        />
                    </div>
                </section>

                {/* Informations supplémentaires */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
                        {t('professeur.informationsSupplementaires') || 'Informations supplémentaires'}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.privilegieStage') || 'Privilégie le stage'}
                            </label>
                            <input
                                type="number"
                                name="privilegieStage"
                                value={formData.privilegieStage}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('professeur.nbStagiaires') || 'Nombre de stagiaires'}
                            </label>
                            <input
                                type="number"
                                name="nbStagiaires"
                                value={formData.nbStagiaires}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="desireAutreStagiaires"
                                    checked={formData.desireAutreStagiaires}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {t('professeur.desireAutreStagiaires') || 'Désire d\'autres stagiaires'}
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="quartsVariables"
                                    checked={formData.quartsVariables}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {t('professeur.quartsVariables') || 'Quarts variables'}
                                </span>
                            </label>
                        </div>
                    </div>
                </section>

                <div className="flex gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/professeur/candidatures')}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
                        disabled={saving}
                    >
                        {t('common.cancel') || 'Annuler'}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 flex items-center justify-center"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                {t('common.saving') || 'Sauvegarde...'}
                            </>
                        ) : (
                            <>
                                <FaSave className="mr-2" />
                                {t('professeur.sauvegarder') || 'Sauvegarder'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

