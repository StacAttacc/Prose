import React, { useState, useEffect, useMemo } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import ErrorBanner from "./ErrorBanner.jsx";
import {getPDFEntente} from "../../services/UtilisateurService.js";
import {blobFromUnknownData} from "../../utils/pdfUtils.js";

export default function EntenteSignatureModal({ applicant, isOpen, onClose, onSign, ententeData: initialEntenteData, loadEntenteFn }) {
    const { user } = useAuth();
    const { t } = useI18n();
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [ententeData, setEntenteData] = useState(initialEntenteData || null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [consentChecked, setConsentChecked] = useState(false);

    const userHasSigned = useMemo(() => {
        const isStudent = user?.role === "ETUDIANT" || user?.role === "Etudiant";
        const isEmployeur = user?.role === "EMPLOYEUR" || user?.role === "Employeur";
        return (isStudent && ententeData?.dateSignatureEtudiant) || 
               (isEmployeur && ententeData?.dateSignatureEmployeur);
    }, [user?.role, ententeData?.dateSignatureEtudiant, ententeData?.dateSignatureEmployeur]);

    const userSignatureDate = useMemo(() => {
        if (!userHasSigned) return null;
        const isStudent = user?.role === "ETUDIANT" || user?.role === "Etudiant";
        return isStudent ? ententeData?.dateSignatureEtudiant : ententeData?.dateSignatureEmployeur;
    }, [userHasSigned, user?.role, ententeData?.dateSignatureEtudiant, ententeData?.dateSignatureEmployeur]);

    const isGestionnaire = useMemo(() => {
        return user?.role === "GESTIONNAIRE" || user?.role === "Gestionnaire";
    }, [user?.role]);

    const getStatusMessage = useMemo(() => {
        if (!isGestionnaire || !ententeData?.status) return null;
        
        const status = ententeData.status;
        switch (status) {
            case "A_SIGNER":
                return t('enAttenteSignatureEtudiantEtEmployeur');
            case "SIGNEE_ETUDIANT":
                return t('enAttenteSignatureEmployeur');
            case "SIGNEE_EMPLOYEUR":
                return t('enAttenteSignatureEtudiant');
            case "SIGNEE_ETUDIANT_ET_EMPLOYEUR":
                return t('enAttenteVotreSignatureGestionnaire');
            case "SIGNEE":
                return t('ententeSigneeParToutesLesParties');
            default:
                return null;
        }
    }, [isGestionnaire, ententeData?.status]);

    const getStatusMessageForUser = useMemo(() => {
        if (isGestionnaire || !ententeData?.status) return null;
        
        const status = ententeData.status;
        const isStudent = user?.role === "ETUDIANT" || user?.role === "Etudiant";
        const isEmployeur = user?.role === "EMPLOYEUR" || user?.role === "Employeur";
        
        if (status === "SIGNEE") {
            return t('ententeSigneeParToutesLesParties');
        } else if (status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR") {
            return t('enAttenteSignatureGestionnaire');
        } else if (status === "SIGNEE_ETUDIANT" && isStudent) {
            return t('enAttenteSignatureEmployeur');
        } else if (status === "SIGNEE_EMPLOYEUR" && isEmployeur) {
            return t('enAttenteSignatureEtudiant');
        } else if ((status === "SIGNEE_EMPLOYEUR" && isStudent) || (status === "SIGNEE_ETUDIANT" && isEmployeur)) {
            return t('enAttenteVotreSignature');
        } else if (status === "A_SIGNER") {
            if (isStudent) {
                return t('enAttenteVotreSignatureEtEmployeur');
            } else if (isEmployeur) {
                return t('enAttenteVotreSignatureEtEtudiant');
            }
        }
        return null;
    }, [isGestionnaire, ententeData?.status, user?.role]);

    useEffect(() => {
        const run = async () => {
            if (isOpen) {
                if (initialEntenteData) {
                    setEntenteData(initialEntenteData);
                    
                    const pdfData = await getPDFEntente(initialEntenteData.id, user.token);
                    const pdfBlob = blobFromUnknownData(pdfData, "application/pdf");

                    if (pdfBlob) {
                        const url = URL.createObjectURL(pdfBlob);
                        setPdfUrl(url);
                    }
                } else if (loadEntenteFn && applicant?.id && user?.token) {
                    // Utiliser la fonction de chargement passée en prop
                    loadEntente();
                }
            } else {
                if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                }
                setEntenteData(null);
                setPassword("");
                setError("");
                setConsentChecked(false);
            }
        }

        run();
    }, [isOpen, applicant?.id, user?.token, initialEntenteData, loadEntenteFn]);

    const loadEntente = async () => {
        if (!loadEntenteFn) return;
        setLoading(true);
        setError("");
        try {
            const result = await loadEntenteFn(applicant.id, user.token);
            if (result.exists && result.data) {
                setEntenteData(result.data);

                const pdfData = await getPDFEntente(initialEntenteData.id, user.token);
                const pdfBlob = blobFromUnknownData(pdfData, "application/pdf");

                if (pdfBlob) {
                    const url = URL.createObjectURL(pdfBlob);
                    setPdfUrl(url);
                }
            } else {
                setError(t('ententeNonTrouvee'));
            }
        } catch (err) {
            console.error("Erreur lors du chargement de l'entente:", err);
            setError(t('erreurChargementEntente'));
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async (e) => {
        e.preventDefault();
        setError("");

        if (!consentChecked) {
            setError(t('veuillezCocherConsentement'));
            return;
        }

        if (!password) {
            setError(t('veuillezSaisirMotDePasse'));
            return;
        }

        if (!ententeData?.id) {
            setError(t('donneesEntenteInvalides'));
            return;
        }

        setIsSubmitting(true);
        try {
            await onSign(ententeData.id, password);
            handleClose();
        } catch {
            setError(t('erreurSignatureEntente'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
        setPassword("");
        setError("");
        setConsentChecked(false);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {t('ententeStageSignature')}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-800 text-2xl"
                        aria-label={t('fermer')}
                    >
                        &times;
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">{t('chargementEntente')}</div>
                    </div>
                ) : error && !ententeData ? (
                    <ErrorBanner message={error} />
                ) : (
                    <>
                        {userHasSigned && userSignatureDate && ententeData?.status !== "SIGNEE" && (
                            <div className="mb-6">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">
                                        {t('vousAvezDejaSigneEntente')} {new Date(userSignatureDate).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Statut de l'entente - affiché après le message de signature */}
                        {(isGestionnaire && getStatusMessage) || (!isGestionnaire && getStatusMessageForUser) ? (
                            <div className="mb-6">
                                <div className={`p-3 border rounded-lg ${
                                    ententeData?.status === "SIGNEE" 
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : "bg-yellow-50 border-yellow-200 text-yellow-700"
                                }`}>
                                    <p className="text-sm font-medium">
                                        {isGestionnaire ? getStatusMessage : getStatusMessageForUser}
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">
                                {t('documentEntente')}
                            </h3>
                            {pdfUrl ? (
                                <div className="w-full h-[500px] border rounded overflow-hidden">
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                        <Viewer fileUrl={pdfUrl} />
                                    </Worker>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border rounded text-gray-500 text-center">
                                    {t('impossibleAfficherPdf')}
                                </div>
                            )}
                        </div>

                        {!userHasSigned && (!isGestionnaire || ententeData?.status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR") && (
                            <form onSubmit={handleSign} className="border-t pt-6">
                                <div className="mb-4">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={consentChecked}
                                            onChange={(e) => setConsentChecked(e.target.checked)}
                                            className="mt-1 mr-2"
                                            required
                                        />
                                        <span className="text-sm text-gray-700">
                                            {t('consentementEntente')}
                                        </span>
                                    </label>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('motDePasse')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('entrezMotDePasseConfirmer')}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('motDePasseRequisConfirmer')}
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition disabled:opacity-50"
                                    >
                                        {t('annuler')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !consentChecked || !password}
                                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm flex items-center justify-center px-5 py-2.5 text-center me-2"
                                    >
                                        {isSubmitting ? t('signatureEnCours') : t('signerEntente')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {!(!userHasSigned && (!isGestionnaire || ententeData?.status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR")) && (
                            <div className="border-t pt-6">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition"
                                    >
                                        {t('fermer')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

