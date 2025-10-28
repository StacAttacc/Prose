import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { telechargerCv } from "../../services/EtudiantService.js";
import { convoquerEntrevue } from "../../services/EmployeurService.js";
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
    const [localStatus, setLocalStatus] = useState(applicant?.statut || applicant?.status || "EN_ATTENTE");

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
        const s =
            firstNonEmpty(
                applicant?.status,
                applicant?.candidatureStatus,     // au cas où le backend utilise ce nom
                applicant?.statut,
                typeof applicant?.status === "object" ? applicant?.status?.name : "" // enum sérialisé en objet
            );
        return s;
    }, [applicant]);

    const status = useMemo(() => (rawStatus || "").toString().trim().toUpperCase(), [rawStatus]);

    const statusLabel = useMemo(() => {
        switch (status) {
            case "SOUMISE":
                return "Soumise";
            case "ACCEPTEE":
                return "Acceptée";
            case "CONVOQUEE":
                return "Convoquée";
            case "REFUSEE":
                return "Refusée";
            default:
                return status || "—";
        }
    }, [status]);

    const statusBadgeClass = useMemo(() => {
        switch (status) {
            case "SOUMISE":
                return "bg-gray-100 text-gray-800 border border-gray-300";
            case "ACCEPTEE":
                return "bg-green-100 text-green-800 border border-green-300";
            case "CONVOQUEE":
                return "bg-blue-100 text-blue-800 border border-blue-300";
            case "REFUSEE":
                return "bg-rose-100 text-rose-800 border border-rose-300";
            default:
                return "bg-slate-100 text-slate-700 border border-slate-300";
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
        } catch (e) {
            setDocState((s) => ({
                ...s,
                error:
                    kind === "cv"
                        ? "Impossible d'afficher le CV."
                        : "Impossible d'afficher la lettre de motivation.",
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

    const getStatusBadge = (status) => {
        const statusMap = {
            "EN_ATTENTE": { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
            "ACCEPTE": { label: "Accepté", color: "bg-green-100 text-green-800" },
            "REFUSE": { label: "Refusé", color: "bg-red-100 text-red-800" },
            "CONVOQUE": { label: "Convoqué", color: "bg-blue-100 text-blue-800" },
        };

        const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
            </span>
        );
    };

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [docState.open]);

    useEffect(() => {
        const targetId = location?.state?.openCandidatureId;
        const kind = location?.state?.openDocType || "letter";
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
    }, [location?.state, applicant?.id]);

    return (
        <>


            <tr className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-4 align-top">
                    <div className="font-medium text-gray-800">{fullName}</div>
                    {email ? (
                        <div className="text-xs text-gray-500">{email}</div>
                    ) : (
                        <div className="text-xs text-gray-400">Email non disponible</div>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    {email ? (
                        <button
                            onClick={() => openDocument("cv")}
                            disabled={docState.loading && docState.kind === "cv"}
                            className="text-blue-600 hover:underline disabled:opacity-60"
                        >
                            {docState.loading && docState.kind === "cv" ? "Ouverture…" : "Voir le CV"}
                        </button>
                    ) : (
                        <span className="text-gray-400">CV non disponible</span>
                    )}
                </td>


                <td className="py-3 px-4 align-top text-gray-700">
                    {letterData ? (
                        <button
                            onClick={() => openDocument("letter")}
                            disabled={docState.loading && docState.kind === "letter"}
                            className="text-blue-600 hover:underline disabled:opacity-60"
                        >
                            {docState.loading && docState.kind === "letter"
                                ? "Ouverture…"
                                : "Voir la lettre"}
                        </button>
                    ) : (
                        <span className="text-gray-400">Aucune lettre de motivation</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    <span
                           className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass}`}>
     {statusLabel}
                       </span>
                </td>
                
                <td className="py-3 px-4 align-top">
                    {localStatus === "CONVOQUEE" && applicant?.dateDecision ? (
                        <div className="text-sm">
                            <div className="font-medium text-gray-800">
                                {new Date(applicant.dateDecision).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="text-gray-500">
                                {new Date(applicant.dateDecision).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">—</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top">
                    {showActions && (
                        <div className="flex gap-2">
                            {/* Pour candidatures SOUMISE : proposer Convoquer ou Refuser directement */}
                            {localStatus === "SOUMISE" && (
                                <>
                                    <button
                                        onClick={() => setShowConvocationModal(true)}
                                        className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br transition-all"
                                        type="button"
                                    >
                                        Convoquer
                                    </button>
                                    <button
                                        onClick={() => onReject && onReject(applicant)}
                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        disabled={!onReject || !user?.token}
                                        type="button"
                                    >
                                        Refuser
                                    </button>
                                </>
                            )}

                            {/* Pour candidatures CONVOQUEE : proposer Accepter ou Refuser */}
                            {localStatus === "CONVOQUEE" && (
                                <>
                                    <button
                                        onClick={() => onApprove && onApprove(applicant)}
                                        className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br transition-all"
                                        disabled={!onApprove}
                                        type="button"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => onReject && onReject(applicant)}
                                        className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        disabled={!onReject || !user?.token}
                                        type="button"
                                    >
                                        Refuser
                                    </button>
                                </>
                            )}

                            {/* Pour candidatures ACCEPTEE ou REFUSEE : plus d'actions */}
                            {(localStatus === "ACCEPTEE" || localStatus === "REFUSEE") && (
                                <span className="text-sm text-gray-400 italic px-4 py-2">Traité</span>
                            )}
                        </div>
                    )}
                </td>
            </tr>

            {docState.open &&
                createPortal(
                    <PdfModal
                        title={docState.kind === "cv" ? `CV de ${fullName}` : "Lettre de motivation"}
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
        </>
    );
}


