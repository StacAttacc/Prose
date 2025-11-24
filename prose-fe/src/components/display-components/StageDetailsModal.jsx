import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import ErrorBanner from "./ErrorBanner.jsx";
import CandidatureForm from "../etudiant-components/CandidatureForm.jsx";
import { assignStageToStudent, getAllEtudiants, generateEntente, checkEntenteExists } from "../../services/GestionnaireService.js";

export default function StageDetailsModal({
                                              stage,
                                              isOpen,
                                              onClose,
                                              onApprove,
                                              onReject,
                                              showManagementButtons = false,
                                              showPostulerButton = false,
                                              onCandidatureSuccess,
                                              candidatureId,
                                          }) {
    const { user } = useAuth();
    const { t } = useI18n();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [showCandidatureForm, setShowCandidatureForm] = useState(false);
    const [candidatureSuccess, setCandidatureSuccess] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [selectedEtudiantEmail, setSelectedEtudiantEmail] = useState("");
    const [assignComment, setAssignComment] = useState("");
    const [etudiants, setEtudiants] = useState([]);
    const [loadingEtudiants, setLoadingEtudiants] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const shouldShowManagementButtons =
        showManagementButtons && user?.role === "GESTIONNAIRE";

    const isStageApproved = stage?.status === "APPROUVEE";

    useEffect(() => {
        if (showAssignForm && user?.token) {
            loadEtudiants();
        }
    }, [showAssignForm, user?.token]);

    const loadEtudiants = async () => {
        if (!user?.token) {
            setLoadingEtudiants(false);
            return;
        }
        setLoadingEtudiants(true);
        setError("");
        try {
            const data = await getAllEtudiants(user.token);
            console.log('Étudiants chargés:', data);
            setEtudiants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur lors du chargement des étudiants:', err);
            console.error('Détails de l\'erreur:', err?.response?.data);
            console.error('Status:', err?.response?.status);
            setError(err?.response?.data?.message || 'Erreur lors du chargement des étudiants');
            setEtudiants([]);
        } finally {
            setLoadingEtudiants(false);
        }
    };

    const handleAssignStage = async () => {
        if (!selectedEtudiantEmail || !user?.token) {
            setError('Veuillez sélectionner un étudiant');
            return;
        }

        setAssigning(true);
        setError("");
        try {
            // 1. Attribuer le stage à l'étudiant
            const candidature = await assignStageToStudent(
                selectedEtudiantEmail,
                stage.id,
                assignComment,
                user.token
            );

            // 2. Générer l'entente
            const candidatureId = candidature.id;
            await generateEntente(candidatureId, user.token);

            // Réinitialiser le formulaire
            setSelectedEtudiantEmail("");
            setAssignComment("");
            setShowAssignForm(false);
            
            // Fermer le modal après 2 secondes
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error('Erreur lors de l\'attribution du stage:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Erreur lors de l\'attribution du stage';
            setError(errorMessage);
        } finally {
            setAssigning(false);
        }
    };

    const handleApprove = async () => {
        if (!onApprove) return;
        setIsProcessing(true);
        try {
            await onApprove(stage);
            setRejectionReason("");
        } catch (error) {
            console.error("Erreur lors de l'approbation:", error);
        } finally {
            setIsProcessing(false);
            setIsRejecting(false);
            setError("");
        }
    };

    const handleReject = async () => {
        if (!onReject) return;

        if (!rejectionReason.trim()) {
            setError(t('veuillezFournirRaison'));
            return;
        }

        setIsProcessing(true);
        try {
            await onReject(stage, rejectionReason);
            setRejectionReason("");
        } catch (error) {
            console.error("Erreur lors du rejet:", error);
            setError(t('erreurRejet') + error);
        } finally {
            setIsProcessing(false);
            setIsRejecting(false);
        }
    };

    const handleClose = () => {
        setRejectionReason("");
        setIsRejecting(false);
        setShowCandidatureForm(false);
        setCandidatureSuccess(false);
        setShowAssignForm(false);
        setSelectedEtudiantEmail("");
        setAssignComment("");
        setError("");
        onClose();
        if (candidatureSuccess && onCandidatureSuccess) {
            onCandidatureSuccess(stage);
        }
    };

    const handlePostuler = () => setShowCandidatureForm(true);

    const handleCandidatureSuccess = () => {
        setShowCandidatureForm(false);
        setCandidatureSuccess(true);
        if (onCandidatureSuccess) onCandidatureSuccess(stage);
    };

    if (!isOpen || !stage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {showCandidatureForm ? (
                    <CandidatureForm
                        stage={stage}
                        onClose={() => {
                            setShowCandidatureForm(false);
                            handleClose();
                        }}
                        onSuccess={handleCandidatureSuccess}
                    />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{t('detailsStage')}</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                disabled={isProcessing}
                            >
                                ×
                            </button>
                        </div>

                        {candidatureSuccess && (
                            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                <p className="font-medium">
                                    {t('candidatureEnvoyee')}
                                </p>
                                <p className="text-sm mt-1">
                                    {t('employeurNotifie')}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('informationsGenerales')}
                                </h3>
                                <div className="space-y-2">
                                    <p>
                                        <strong>{t('titre')}</strong> {stage.title}
                                    </p>
                                    <p>
                                        <strong>{t('employeur')} :</strong> {stage.employeur?.company}{" "}
                                        {stage.employeur?.email}
                                    </p>
                                    <p>
                                        <strong>{t('dateDebut')}</strong> {stage.startDate}
                                    </p>
                                    <p>
                                        <strong>{t('dateFin')}</strong> {stage.endDate}
                                    </p>
                                    <p>
                                        <strong>{t('lieu')} :</strong> {stage.location}
                                    </p>
                                    <p>
                                        <strong>{t('modeTravail')}</strong> {stage.workMode}
                                    </p>
                                    <p>
                                        <strong>{t('compensation')} :</strong> {stage.compensation}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('description')}</h3>
                                <p className="text-gray-700 mb-4">{stage.description}</p>

                                <h3 className="text-lg font-semibold mb-2">{t('exigences')}</h3>
                                <p className="text-gray-700 mb-4">{stage.requirements}</p>

                                <h3 className="text-lg font-semibold mb-2">
                                    {t('competencesRequises')}
                                </h3>
                                <ul className="list-disc list-inside text-gray-700">
                                    {stage.skills?.map((skill, skillIndex) => (
                                        <li key={skillIndex}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {error && <ErrorBanner message={error} />}

                        {stage.status === "REJETEE" && stage.rejectionReason && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                                <h3 className="text-lg font-semibold mb-2 text-red-800">
                                    {t('raisonRejetStage')}
                                </h3>
                                <p className="text-red-700">{stage.rejectionReason}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <div className="w-full">
                                {shouldShowManagementButtons && (
                                    <div className="flex flex-col mb-4 gap-2">
                                        <button
                                            onClick={handleApprove}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                            disabled={isProcessing || isRejecting || assigning}
                                        >
                                            {isProcessing ? t('traitement') : t('approuver')}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsRejecting(!isRejecting);
                                                setShowAssignForm(false);
                                            }}
                                            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                            disabled={isProcessing || assigning}
                                        >
                                            {t('rejeter')}
                                        </button>

                                        {isStageApproved && (
                                            <button
                                                onClick={() => {
                                                    setShowAssignForm(!showAssignForm);
                                                    setIsRejecting(false);
                                                }}
                                                className="text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                                disabled={isProcessing || isRejecting || assigning}
                                            >
                                                Attribuer le stage
                                            </button>
                                        )}

                                        {isRejecting && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('raisonRejetObligatoire')}
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder={t('expliquerRejetStage')}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    rows="3"
                                                    disabled={isProcessing}
                                                />
                                                <div className="flex justify-center mt-2">
                                                    <button
                                                        onClick={handleReject}
                                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                                        disabled={isProcessing || !rejectionReason}
                                                    >
                                                        {isProcessing ? t('traitement') : t('confirmer')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {showAssignForm && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <h3 className="text-lg font-semibold mb-4">
                                                    Attribuer le stage à un étudiant
                                                </h3>
                                                
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Sélectionner un étudiant <span className="text-red-500">*</span>
                                                    </label>
                                                    {loadingEtudiants ? (
                                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                                                            Chargement...
                                                        </div>
                                                    ) : error && error.includes('étudiants') ? (
                                                        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
                                                            {error}
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={selectedEtudiantEmail}
                                                            onChange={(e) => setSelectedEtudiantEmail(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                                            required
                                                        >
                                                            <option value="">Sélectionner un étudiant</option>
                                                            {etudiants.length === 0 ? (
                                                                <option value="" disabled>Aucun étudiant disponible</option>
                                                            ) : (
                                                                etudiants.map((etudiant) => (
                                                                    <option key={etudiant.id || etudiant.email} value={etudiant.email}>
                                                                        {etudiant.firstName} {etudiant.lastName} ({etudiant.email})
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                    )}
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Commentaire (optionnel)
                                                    </label>
                                                    <textarea
                                                        value={assignComment}
                                                        onChange={(e) => setAssignComment(e.target.value)}
                                                        placeholder="Ajouter un commentaire pour cette attribution..."
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        rows="3"
                                                        disabled={assigning}
                                                    />
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowAssignForm(false);
                                                            setSelectedEtudiantEmail("");
                                                            setAssignComment("");
                                                            setError("");
                                                        }}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                                        disabled={assigning}
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={handleAssignStage}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white rounded hover:from-blue-500 hover:to-blue-700 disabled:opacity-50"
                                                        disabled={assigning || !selectedEtudiantEmail}
                                                    >
                                                        {assigning ? 'Attribution en cours...' : 'Attribuer'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                        disabled={isProcessing}
                                    >
                                        {t('fermer')}
                                    </button>

                                    {showPostulerButton && !candidatureSuccess && (
                                        <button
                                            onClick={handlePostuler}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
                                        >
                                            {t('postuler')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
