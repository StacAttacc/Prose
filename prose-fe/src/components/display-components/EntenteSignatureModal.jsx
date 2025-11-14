import React, { useState, useEffect, useMemo } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { useAuth } from "../../context/AuthContext.jsx";

function blobFromUnknownData(data, mime = "application/pdf") {
    if (!data) return null;

    if (Array.isArray(data)) {
        const bytes = new Uint8Array(data);
        return new Blob([bytes], { type: mime });
    }

    if (typeof data === "string") {
        try {
            const bin = atob(data);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return new Blob([bytes], { type: mime });
        } catch {
            return null;
        }
    }

    return null;
}

export default function EntenteSignatureModal({ applicant, isOpen, onClose, onSign, ententeData: initialEntenteData, loadEntenteFn }) {
    const { user } = useAuth();
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [ententeData, setEntenteData] = useState(initialEntenteData || null);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [consentChecked, setConsentChecked] = useState(false);

    // Vérifier si l'utilisateur actuel a déjà signé
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

    // Vérifier si l'utilisateur est un gestionnaire
    const isGestionnaire = useMemo(() => {
        return user?.role === "GESTIONNAIRE" || user?.role === "Gestionnaire";
    }, [user?.role]);

    // Obtenir le message de statut pour le gestionnaire
    const getStatusMessage = useMemo(() => {
        if (!isGestionnaire || !ententeData?.status) return null;
        
        const status = ententeData.status;
        switch (status) {
            case "A_SIGNER":
                return "En attente de la signature de l'étudiant et de l'employeur";
            case "SIGNEE_ETUDIANT":
                return "En attente de la signature de l'employeur";
            case "SIGNEE_EMPLOYEUR":
                return "En attente de la signature de l'étudiant";
            case "SIGNEE_ETUDIANT_ET_EMPLOYEUR":
                return "En attente de votre signature (gestionnaire)";
            case "SIGNEE":
                return "✓ Entente signée par toutes les parties";
            default:
                return null;
        }
    }, [isGestionnaire, ententeData?.status]);

    // Obtenir le message de statut pour l'employeur et l'étudiant
    const getStatusMessageForUser = useMemo(() => {
        if (isGestionnaire || !ententeData?.status) return null;
        
        const status = ententeData.status;
        const isStudent = user?.role === "ETUDIANT" || user?.role === "Etudiant";
        const isEmployeur = user?.role === "EMPLOYEUR" || user?.role === "Employeur";
        
        if (status === "SIGNEE") {
            return "✓ Entente signée par toutes les parties";
        } else if (status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR") {
            return "En attente de la signature du gestionnaire";
        } else if (status === "SIGNEE_ETUDIANT" && isStudent) {
            // L'étudiant a signé, on attend l'employeur
            return "En attente de la signature de l'employeur";
        } else if (status === "SIGNEE_EMPLOYEUR" && isEmployeur) {
            // L'employeur a signé, on attend l'étudiant
            return "En attente de la signature de l'étudiant";
        } else if (status === "A_SIGNER") {
            // Cas théorique où l'utilisateur a signé mais le statut est encore A_SIGNER
            if (isStudent) {
                return "En attente de votre signature et de l'employeur";
            } else if (isEmployeur) {
                return "En attente de votre signature et de l'étudiant";
            }
        }
        return null;
    }, [isGestionnaire, ententeData?.status, user?.role]);

    useEffect(() => {
        if (isOpen) {
            if (initialEntenteData) {
                // Utiliser les données passées en prop
                setEntenteData(initialEntenteData);
                const pdfBlob = blobFromUnknownData(
                    initialEntenteData.documentPdfBase64 || initialEntenteData.documentPdf,
                    initialEntenteData.documentType || "application/pdf"
                );
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
    }, [isOpen, applicant?.id, user?.token, initialEntenteData, loadEntenteFn]);

    const loadEntente = async () => {
        if (!loadEntenteFn) return;
        setLoading(true);
        setError("");
        try {
            const result = await loadEntenteFn(applicant.id, user.token);
            if (result.exists && result.data) {
                setEntenteData(result.data);
                const pdfBlob = blobFromUnknownData(
                    result.data.documentPdfBase64 || result.data.documentPdf,
                    result.data.documentType || "application/pdf"
                );
                if (pdfBlob) {
                    const url = URL.createObjectURL(pdfBlob);
                    setPdfUrl(url);
                }
            } else {
                setError("Entente non trouvée");
            }
        } catch (err) {
            console.error("Erreur lors du chargement de l'entente:", err);
            setError("Erreur lors du chargement de l'entente");
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async (e) => {
        e.preventDefault();
        setError("");

        if (!consentChecked) {
            setError("Veuillez cocher la case de consentement pour signer l'entente");
            return;
        }

        if (!password) {
            setError("Veuillez saisir votre mot de passe");
            return;
        }

        if (!ententeData?.id) {
            setError("Données d'entente invalides");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSign(ententeData.id, password);
            handleClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la signature de l'entente");
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
                        Entente de stage - Signature
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-800 text-2xl"
                        aria-label="Fermer"
                    >
                        &times;
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Chargement de l'entente...</div>
                    </div>
                ) : error && !ententeData ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Message si déjà signé - affiché en premier */}
                        {userHasSigned && userSignatureDate && ententeData?.status !== "SIGNEE" && (
                            <div className="mb-6">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">
                                        ✓ Vous avez déjà signé cette entente le {new Date(userSignatureDate).toLocaleDateString('fr-FR', {
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
                                Document d'entente
                            </h3>
                            {pdfUrl ? (
                                <div className="w-full h-[500px] border rounded overflow-hidden">
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                        <Viewer fileUrl={pdfUrl} />
                                    </Worker>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border rounded text-gray-500 text-center">
                                    Impossible d'afficher le PDF
                                </div>
                            )}
                        </div>

                        {/* Formulaire de signature - seulement si l'utilisateur n'a pas encore signé */}
                        {/* Pour le gestionnaire, afficher le formulaire seulement si c'est son tour (SIGNEE_ETUDIANT_ET_EMPLOYEUR) */}
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
                                            Je consens à cette entente de stage et je confirme avoir lu et compris tous les termes et conditions énoncés dans le document ci-dessus.
                                        </span>
                                    </label>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Entrez votre mot de passe pour confirmer"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Votre mot de passe est requis pour confirmer la signature
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
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !consentChecked || !password}
                                        className="px-4 py-2 text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg transition disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Signature en cours..." : "Signer l'entente"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Bouton Fermer si pas de formulaire de signature */}
                        {!(!userHasSigned && (!isGestionnaire || ententeData?.status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR")) && (
                            <div className="border-t pt-6">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                                    >
                                        Fermer
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

