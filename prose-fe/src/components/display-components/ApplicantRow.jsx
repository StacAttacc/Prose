import React, {useEffect, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import {useI18n} from "../../context/I18nContext.jsx";
import {telechargerCv} from "../../services/EtudiantService.js";
import {checkEntenteExists, convoquerEntrevue, signEntente} from "../../services/EmployeurService.js";
import EntenteSignatureModal from "./EntenteSignatureModal.jsx";
import "@react-pdf-viewer/core/lib/styles/index.css";
import PdfModal from "./PdfModal.jsx";
import InterviewConvocationModal from "./InterviewConvocationModal.jsx";
import {useLocation, useNavigate} from "react-router-dom";

const firstNonEmpty = (...vals) =>
    vals
        .map((v) => (v == null ? "" : String(v).trim()))
        .find((v) => v.length) || "";

const joinNames = (a, b) =>
    [a, b]
        .map((v) => (v == null ? "" : String(v).trim()))
        .filter(Boolean)
        .join(" ");

function blobFromUnknownData(data, mime = "application/pdf") {
    if (!data) return null;

    if (Array.isArray(data)) {
        const bytes = new Uint8Array(data);
        return new Blob([bytes], {type: mime});
    }

    if (typeof data === "string") {
        try {
            const bin = atob(data);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return new Blob([bytes], {type: mime});
        } catch {
            return null;
        }
    }

    return null;
}

export default function ApplicantRow({ applicant, onStatusUpdate, showActions = true, onApprove, onReject }) {
    const { user } = useAuth();
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();

    const [docState, setDocState] = useState({
        open: false,
        kind: null,
        url: null,
        error: null,
        loading: false,
    });

    const [showConvocationModal, setShowConvocationModal] = useState(false);
    const [showEntenteModal, setShowEntenteModal] = useState(false);
    const [localStatus, setLocalStatus] = useState(applicant?.statut || applicant?.status || "EN_ATTENTE");
    const [ententeExists, setEntenteExists] = useState(null); // null = pas encore vérifié, true/false = résultat
    const [ententeData, setEntenteData] = useState(null); // Données complètes de l'entente
    const [checkingEntente, setCheckingEntente] = useState(false);

    useEffect(() => {
        const newStatus = applicant?.statut || applicant?.status || "EN_ATTENTE";
        setLocalStatus(newStatus);
    }, [applicant?.statut, applicant?.status]);

    const email = useMemo(
        () => firstNonEmpty(applicant?.email, applicant?.etudiant?.email),
        [applicant]
    );


    const fullName = useMemo(
        () =>
            firstNonEmpty(
                applicant?.fullName,
                applicant?.etudiant?.fullName,
                joinNames(applicant?.firstName, applicant?.lastName),
                joinNames(applicant?.etudiant?.firstName, applicant?.etudiant?.lastName),
                email,
                "—"
            ),
        [applicant, email]
    );


    const rawStatus = useMemo(() => {
        return firstNonEmpty(
            applicant?.status,
            applicant?.candidatureStatus,
            applicant?.statut,
            typeof applicant?.status === "object" ? applicant?.status?.name : "" // enum sérialisé en objet
        );
    }, [applicant]);

    const status = useMemo(() => (rawStatus || "").toString().trim().toUpperCase(), [rawStatus]);

    useEffect(() => {
        const checkEntente = async () => {
            if (status === "CONFIRMER" && applicant?.id && user?.token) {
                setCheckingEntente(true);
                try {
                    const result = await checkEntenteExists(applicant.id, user.token);
                    setEntenteExists(result.exists);
                    setEntenteData(result.exists ? result.data : null);
                } catch (error) {
                    console.error("Erreur lors de la vérification de l'entente:", error);
                    setEntenteExists(false);
                    setEntenteData(null);
                } finally {
                    setCheckingEntente(false);
                }
            } else {
                setEntenteExists(null);
                setEntenteData(null);
            }
        };

        checkEntente();
    }, [status, applicant?.id, user?.token]);

    const statusLabel = useMemo(() => {
        switch (status) {
            case "SOUMISE":
                return t('soumise');
            case "ACCEPTEE":
                return t('enAttenteReponseEtudiant');
            case "CONVOQUEE":
                return t('convoquee');
            case "REFUSEE":
                return t('refusee');
            case "CONFIRMER":
                return t('confirmeeParEtudiant');
            case "REFUSEE_ETUDIANT":
                return t('refuseeParEtudiant');
            default:
                return status || "—";
        }
    }, [status, t]);

    const canUserSignEntente = useMemo(() => {
        if (!ententeData || !user) return false;
        
        const isEmployeur = user?.role === "EMPLOYEUR" || user?.role === "Employeur";
        const isEtudiant = user?.role === "ETUDIANT" || user?.role === "Etudiant";
        const isGestionnaire = user?.role === "GESTIONNAIRE" || user?.role === "Gestionnaire";
        
        const ententeStatus = ententeData.status;
        
       
        if (isEmployeur) {
            return (ententeStatus === "A_SIGNER" || 
                   ententeStatus === "SIGNEE_ETUDIANT") && 
                   !ententeData.dateSignatureEmployeur;
        }
        
        if (isEtudiant) {
            return (ententeStatus === "A_SIGNER" || 
                   ententeStatus === "SIGNEE_EMPLOYEUR") && 
                   !ententeData.dateSignatureEtudiant;
        }
        
        if (isGestionnaire) {
            return ententeStatus === "SIGNEE_ETUDIANT_ET_EMPLOYEUR" && 
                   !ententeData.dateSignatureGestionnaire;
        }
        
        return false;
    }, [ententeData, user]);

    const statusBadgeClass = useMemo(() => {
        switch (status) {
            case "SOUMISE":
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600";
            case "ACCEPTEE":
                return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-600";
            case "CONVOQUEE":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600";
            case "REFUSEE":
                return "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-600";
            default:
                return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600";
        }
    }, [status]);


    const letterData = useMemo(
        () =>
            applicant?.motivationLetterData ??
            applicant?.motivationLetter?.data ??
            applicant?.letterData ??
            applicant?.letter?.data ??
            null,
        [applicant]
    );

    const letterType = useMemo(
        () =>
            firstNonEmpty(
                applicant?.motivationLetterContentType,
                applicant?.motivationLetter?.contentType,
                applicant?.letterContentType,
                applicant?.letter?.contentType,
                "application/pdf"
            ),
        [applicant]
    );

    async function openDocument(kind) {
        setDocState({open: true, kind, url: null, error: null, loading: true});

        try {
            if (kind === "cv") {
                if (!email) throw new Error("Email manquant");
                const dto = await telechargerCv(email, user?.token);
                if (!dto?.data) throw new Error("CV introuvable ou vide.");

                const cvBlob = blobFromUnknownData(dto.data, dto.type || "application/pdf");
                if (!cvBlob || cvBlob.size === 0) throw new Error("Le fichier CV est vide.");

                setDocState((s) => ({
                    ...s,
                    url: URL.createObjectURL(cvBlob),
                    loading: false,
                }));
            } else {
                const blob = blobFromUnknownData(letterData, letterType);
                if (!blob || blob.size === 0)
                    throw new Error("Aucune lettre de motivation ou fichier vide.");

                setDocState((s) => ({
                    ...s,
                    url: URL.createObjectURL(blob),
                    loading: false,
                }));
            }
        } catch {
            setDocState((s) => ({
                ...s,
                error:
                    kind === "cv"
                        ? t('impossibleAfficherCV')
                        : t('impossibleAfficherLettre'),
                loading: false,
            }));
        }
    }

    function closeModal() {
        if (docState.url) URL.revokeObjectURL(docState.url);
        setDocState({open: false, kind: null, url: null, error: null, loading: false});
    }

    const handleConvoquerEntrevue = async (interviewData) => {
        try {
            const result = await convoquerEntrevue(applicant.id, interviewData, user?.token);
            console.log("Convocation réussie:", result);
            setLocalStatus("CONVOQUEE");
            if (onStatusUpdate) {
                onStatusUpdate(applicant.id, "CONVOQUEE", interviewData.dateTime);
            }
        } catch (error) {
            console.error("Erreur lors de la convocation:", error);
            throw new Error(error.message || "Erreur lors de la convocation");
        }
    };

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [docState.open]);

    useEffect(() => {
        const targetId = location?.state?.openCandidatureId;
        if (!targetId) return;
        if (String(applicant?.id) !== String(targetId)) return;
        if (docState.open) return;
        (async () => {
            try {
                await openDocument("cv");
            } finally {
                navigate(location.pathname, { replace: true, state: {} });
            }
        })();
    }, [location?.state?.openCandidatureId, applicant?.id]);

    useEffect(() => {
        const targetId = location?.state?.openEntenteId;
        console.log("TARGET ID:", targetId);
        if (!targetId) return;
        console.log("TRYING TO LOAD")
        if (String(applicant?.id) !== String(targetId)) console.log("FAILED TO LOAD");
        if (showEntenteModal) return;
        setShowEntenteModal(true);
        navigate(location.pathname, { replace: true, state: {} });
    }, [location?.state?.openEntenteId, applicant?.id]);

    return (
        <>
            <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="py-3 px-4 align-top">
                    <div className="font-medium text-gray-800 dark:text-gray-100">{fullName}</div>
                    {email ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
                    ) : (
                        <div className="text-xs text-gray-400 dark:text-gray-500">{t('emailNonDisponible')}</div>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    {email ? (
                        <button
                            onClick={() => openDocument("cv")}
                            disabled={docState.loading && docState.kind === "cv"}
                            className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60"
                        >
                            {docState.loading && docState.kind === "cv" ? t('ouverture') : t('voirLeCV')}
                        </button>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">{t('cvNonDisponible')}</span>
                    )}
                </td>


                <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                    {letterData ? (
                        <button
                            onClick={() => openDocument("letter")}
                            disabled={docState.loading && docState.kind === "letter"}
                            className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60"
                        >
                            {docState.loading && docState.kind === "letter"
                                ? t('ouverture')
                                : t('voirLaLettre')}
                        </button>
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500">{t('aucuneLettreMotivation')}</span>
                    )}
                </td>

                <td className={`py-3 px-4 align-top ${status === "ACCEPTEE" ? "text-center" : ""}`}>
                    {status === "ACCEPTEE" ? (
                        <div className="flex justify-center">
                            <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass} dark:border-opacity-50`}>
                                {statusLabel}
                            </span>
                        </div>
                    ) : (
                        <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass} dark:border-opacity-50`}>
                            {statusLabel}
                        </span>
                    )}
                </td>
                
                <td className="py-3 px-4 align-top">
                    {localStatus === "CONVOQUEE" && applicant?.dateDecision ? (
                        <div className="text-sm">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                {new Date(applicant.dateDecision).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                                {new Date(applicant.dateDecision).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    {status === "CONFIRMER" ? (
                        <>
                            {checkingEntente ? (
                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">{t('verification')}</span>
                            ) : ententeExists ? (
                                <>
                                    {ententeData?.status === "SIGNEE" ? (
                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            {t('ententeSigneeParToutesLesParties')}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('enAttenteDeSignature')}</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">{t('ententeNonGeneree')}</span>
                            )}
                        </>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    {showActions && (
                        <div className="flex gap-2">
                            {localStatus === "SOUMISE" && (
                                <>
                                    <button
                                        onClick={() => setShowConvocationModal(true)}
                                        className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br transition-all"
                                        type="button"
                                    >
                                        {t('convoquer')}
                                    </button>
                                    <button
                                        onClick={() => onReject && onReject(applicant)}
                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        disabled={!onReject || !user?.token}
                                        type="button"
                                    >
                                        {t('refuser')}
                                    </button>
                                </>
                            )}

                            {localStatus === "CONVOQUEE" && (
                                <>
                                    <button
                                        onClick={() => onApprove && onApprove(applicant)}
                                        className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br transition-all"
                                        disabled={!onApprove}
                                        type="button"
                                    >
                                        {t('accepter')}
                                    </button>
                                    <button
                                        onClick={() => onReject && onReject(applicant)}
                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        disabled={!onReject || !user?.token}
                                        type="button"
                                    >
                                        {t('refuser')}
                                    </button>
                                </>
                            )}

                            {(localStatus === "ACCEPTEE" || localStatus === "REFUSEE") && (
                                <span className="text-sm text-gray-400 dark:text-gray-500 italic px-4 py-2">{t('traite')}</span>
                            )}

                            {status === "CONFIRMER" && (
                                <>
                                    {checkingEntente ? (
                                        <span className="text-sm text-gray-500 dark:text-gray-400 italic px-4 py-2">{t('verification')}</span>
                                    ) : ententeExists ? (
                                        <>
                                            {ententeData?.status === "SIGNEE" ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setShowEntenteModal(true)}
                                                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                        type="button"
                                                    >
                                                        {t('voirEntente')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (ententeData?.documentPdfBase64) {
                                                                const bin = atob(ententeData.documentPdfBase64);
                                                                const bytes = new Uint8Array(bin.length);
                                                                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                                                                const blob = new Blob([bytes], { type: "application/pdf" });
                                                                const url = URL.createObjectURL(blob);
                                                                const a = document.createElement("a");
                                                                a.href = url;
                                                                a.download = ententeData.documentName || "entente_stage.pdf";
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                a.remove();
                                                                URL.revokeObjectURL(url);
                                                            }
                                                        }}
                                                        className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br transition-all"
                                                        type="button"
                                                    >
                                                        {t('telechargerEntenteStage')}
                                                    </button>
                                                </div>
                                            ) : canUserSignEntente ? (
                                                <button
                                                    onClick={() => setShowEntenteModal(true)}
                                                    className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                    type="button"
                                                >
                                                    {t('voirEtSignerEntente')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowEntenteModal(true)}
                                                    className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                    type="button"
                                                >
                                                    {t('voirEntente')}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400 italic px-4 py-2">
                                            {t('enAttenteGestionnaireEntente')}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </td>
            </tr>

            {docState.open &&
                createPortal(
                    <PdfModal
                        title={docState.kind === "cv" ? t('cvDe', { name: fullName }) : t('lettreMotivation')}
                        url={docState.url}
                        error={docState.error}
                        onClose={closeModal}
                    />,
                    document.body
                )}

            {showConvocationModal &&
                createPortal(
                    <InterviewConvocationModal
                        applicant={applicant}
                        isOpen={showConvocationModal}
                        onClose={() => setShowConvocationModal(false)}
                        onConfirm={handleConvoquerEntrevue}
                    />,
                    document.body
                )}

            {showEntenteModal &&
                createPortal(
                    <EntenteSignatureModal
                        applicant={applicant}
                        isOpen={showEntenteModal}
                        onClose={() => setShowEntenteModal(false)}
                        ententeData={ententeData}
                        loadEntenteFn={checkEntenteExists}
                        onSign={async (ententeId, password) => {
                            try {
                                await signEntente(ententeId, password, user?.token);
                                const result = await checkEntenteExists(applicant.id, user?.token);
                                if (result.exists) {
                                    setEntenteData(result.data);
                                }
                            } catch (error) {
                                throw new Error(error.message || t('erreurLorsSignature'));
                            }
                        }}
                    />,
                    document.body
                )}
        </>
    );
}


