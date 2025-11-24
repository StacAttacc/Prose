import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { getCandidaturesEnStage } from '../../services/GestionnaireService';
import { useAuth } from '../../context/AuthContext';
import { useYear } from '../../context/YearContext';
import { FaArrowLeft } from 'react-icons/fa';

const COTE_LABELS = {
    'TOTALEMENT_EN_ACCORD': 'Totalement en accord',
    'PLUTOT_EN_ACCORD': 'Plutôt en accord',
    'PLUTOT_DESACCORD': 'Plutôt désaccord',
    'TOTALEMENT_DESACCORD': 'Totalement en désaccord',
    'IMPOSIBLE_PRONONCER': 'Impossible de se prononcer'
};

export default function EvaluationMilieuStageView() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { candidatureId } = useParams();
    const { user } = useAuth();
    const { selectedYear } = useYear();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [candidature, setCandidature] = useState(null);
    const [evaluation, setEvaluation] = useState(null);

    useEffect(() => {
        loadEvaluation();
    }, [candidatureId, user?.token, selectedYear]);

    const loadEvaluation = async () => {
        if (!user?.token || !selectedYear) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const candidatures = await getCandidaturesEnStage(selectedYear, user.token);
            const currentCandidature = candidatures.find(c => c.id === parseInt(candidatureId));
            
            if (!currentCandidature) {
                setError(t('gestionnaire.candidatureNonTrouvee') || 'Candidature non trouvée');
                return;
            }
            
            if (!currentCandidature.evaluationMillieu) {
                setError(t('gestionnaire.evaluationNonTrouvee') || 'Évaluation non trouvée');
                return;
            }
            
            setCandidature(currentCandidature);
            setEvaluation(currentCandidature.evaluationMillieu);
        } catch (err) {
            console.error('Erreur lors du chargement de l\'évaluation:', err);
            setError(t('gestionnaire.erreurChargement') || 'Erreur lors du chargement de l\'évaluation');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">{t('common.error')}</strong>
                    <span className="block sm:inline"> {error || t('gestionnaire.evaluationNonTrouvee') || 'Évaluation non trouvée'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/gestionnaire/evaluations-milieu')}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
                >
                    <FaArrowLeft className="mr-2" />
                    {t('common.back') || 'Retour'}
                </button>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('gestionnaire.evaluationMilieuStage') || 'Évaluation milieu de stage'}
                    </h1>
                    <p className="text-gray-600">
                        {t('gestionnaire.stagiaire') || 'Stagiaire'}: <span className="font-semibold">
                            {evaluation.nomStagiaire || (candidature?.etudiant ? `${candidature.etudiant.firstName} ${candidature.etudiant.lastName}` : '-')}
                        </span>
                    </p>
                    <p className="text-gray-600">
                        {t('gestionnaire.entreprise') || 'Entreprise'}: <span className="font-semibold">
                            {evaluation.nomEntreprise || '-'}
                        </span>
                    </p>
                    {evaluation.tempsSignature && (
                        <p className="text-sm text-gray-500 mt-1">
                            {t('gestionnaire.evalueLe') || 'Évalué le'}: {formatDate(evaluation.tempsSignature)}
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
                {/* Informations sur l'entreprise */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        {t('gestionnaire.informationsEntreprise') || 'Informations sur l\'entreprise'}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.nomEntreprise') || 'Nom de l\'entreprise'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.nomEntreprise || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.personneContact') || 'Personne contact'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.personneContact || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.addresse') || 'Adresse'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.addresse || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.ville') || 'Ville'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.ville || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.codePostal') || 'Code postal'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.codePostal || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.numeroTelephone') || 'Numéro de téléphone'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.numeroTelephone || '-'}</p>
                        </div>
                        {evaluation.telecopieur && (
                            <div>
                                <p className="text-sm text-gray-500">{t('gestionnaire.telecopieur') || 'Télécopieur'}</p>
                                <p className="text-gray-900 font-medium">{evaluation.telecopieur}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Informations sur le stage */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        {t('gestionnaire.informationsStage') || 'Informations sur le stage'}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.nomStagiaire') || 'Nom du stagiaire'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.nomStagiaire || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.dateStage') || 'Date du stage'}</p>
                            <p className="text-gray-900 font-medium">{evaluation.dateStage || '-'}</p>
                        </div>
                        {evaluation.numeroStage && (
                            <div>
                                <p className="text-sm text-gray-500">{t('gestionnaire.numeroStage') || 'Numéro de stage'}</p>
                                <p className="text-gray-900 font-medium">{evaluation.numeroStage}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Évaluations */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        {t('gestionnaire.evaluations') || 'Évaluations'}
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.tachesCoformes') || 'Les tâches conforment aux objectifs du stage'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.tachesCoformes ? COTE_LABELS[evaluation.tachesCoformes] || evaluation.tachesCoformes : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.faciliteIntegration') || 'Facilité d\'intégration'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.faciliteIntegration ? COTE_LABELS[evaluation.faciliteIntegration] || evaluation.faciliteIntegration : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.tempsEstReel') || 'Le temps de travail est réel'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.tempsEstReel ? COTE_LABELS[evaluation.tempsEstReel] || evaluation.tempsEstReel : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.hygieneRespectable') || 'Hygiène respectable'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.hygieneRespectable ? COTE_LABELS[evaluation.hygieneRespectable] || evaluation.hygieneRespectable : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.climatTravailAgreable') || 'Climat de travail agréable'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.climatTravailAgreable ? COTE_LABELS[evaluation.climatTravailAgreable] || evaluation.climatTravailAgreable : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.accessibleTransportCommun') || 'Accessible en transport en commun'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.accessibleTransportCommun ? COTE_LABELS[evaluation.accessibleTransportCommun] || evaluation.accessibleTransportCommun : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.salaireIneteressant') || 'Salaire intéressant'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.salaireIneteressant ? COTE_LABELS[evaluation.salaireIneteressant] || evaluation.salaireIneteressant : '-'}
                            </p>
                        </div>
                        {evaluation.salaire && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    {t('gestionnaire.salaire') || 'Salaire'}
                                </p>
                                <p className="text-gray-900">{evaluation.salaire}</p>
                            </div>
                        )}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.communicationSuperviseurFacile') || 'Communication avec le superviseur facile'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.communicationSuperviseurFacile ? COTE_LABELS[evaluation.communicationSuperviseurFacile] || evaluation.communicationSuperviseurFacile : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.equipementAdequat') || 'Équipement adéquat'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.equipementAdequat ? COTE_LABELS[evaluation.equipementAdequat] || evaluation.equipementAdequat : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('gestionnaire.volumeTravailAcceptable') || 'Volume de travail acceptable'}
                            </p>
                            <p className="text-gray-900">
                                {evaluation.volumeTravailAcceptable ? COTE_LABELS[evaluation.volumeTravailAcceptable] || evaluation.volumeTravailAcceptable : '-'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Commentaires */}
                {evaluation.commentaires && (
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                            {t('gestionnaire.commentaires') || 'Commentaires'}
                        </h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{evaluation.commentaires}</p>
                        </div>
                    </section>
                )}

                {/* Informations supplémentaires */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                        {t('gestionnaire.informationsSupplementaires') || 'Informations supplémentaires'}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {evaluation.privilegieStage !== undefined && (
                            <div>
                                <p className="text-sm text-gray-500">{t('gestionnaire.privilegieStage') || 'Privilégie stage'}</p>
                                <p className="text-gray-900 font-medium">{evaluation.privilegieStage}</p>
                            </div>
                        )}
                        {evaluation.nbStagiaires !== undefined && (
                            <div>
                                <p className="text-sm text-gray-500">{t('gestionnaire.nbStagiaires') || 'Nombre de stagiaires'}</p>
                                <p className="text-gray-900 font-medium">{evaluation.nbStagiaires}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.desireAutreStagiaires') || 'Désire autres stagiaires'}</p>
                            <p className="text-gray-900 font-medium">
                                {evaluation.desireAutreStagiaires === null || evaluation.desireAutreStagiaires === undefined
                                    ? '-' 
                                    : evaluation.desireAutreStagiaires ? (t('common.yes') || 'Oui') : (t('common.no') || 'Non')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('gestionnaire.quartsVariables') || 'Quarts variables'}</p>
                            <p className="text-gray-900 font-medium">
                                {evaluation.quartsVariables === null || evaluation.quartsVariables === undefined
                                    ? '-' 
                                    : evaluation.quartsVariables ? (t('common.yes') || 'Oui') : (t('common.no') || 'Non')}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

