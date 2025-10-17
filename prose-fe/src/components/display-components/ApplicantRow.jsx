import React, {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import {telechargerCv} from "../../services/EtudiantService.js";
import {Worker, Viewer} from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

function firstNonEmpty(...vals) {
    for (const v of vals) {
        if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return "";
}

export default function ApplicantRow({applicant}) {
    const {user} = useAuth();

    const [loadingCv, setLoadingCv] = useState(false);
    const [showCv, setShowCv] = useState(false);
    const [cvUrl, setCvUrl] = useState(null);
    const [cvError, setCvError] = useState(null);

    const [showLetter, setShowLetter] = useState(false);
    const [letterUrl, setLetterUrl] = useState(null);
    const [letterError, setLetterError] = useState(null);

    const emailCandidates = [
        applicant && applicant.etudiant && applicant.etudiant.email,
        applicant && applicant.email,
        applicant && applicant.etudiantEmail,
    ];
    const email = firstNonEmpty(...emailCandidates);
    const normalizedFullName =
        typeof applicant?.fullName === "string" && applicant.fullName.trim()
            ? applicant.fullName.trim()
            : "";

    const nestedFullName =
        applicant && applicant.etudiant && applicant.etudiant.fullName
            ? String(applicant.etudiant.fullName).trim()
            : "";

    const nestedNames = firstNonEmpty(
        [
            applicant && applicant.etudiant && applicant.etudiant.firstName
                ? String(applicant.etudiant.firstName)
                : "",
            applicant && applicant.etudiant && applicant.etudiant.lastName
                ? String(applicant.etudiant.lastName)
                : "",
        ]
            .filter(Boolean)
            .join(" ")
    );

    const legacyNames = firstNonEmpty(
        [
            applicant && applicant.prenom ? String(applicant.prenom) : "",
            applicant && applicant.nom ? String(applicant.nom) : "",
        ]
            .filter(Boolean)
            .join(" ")
    );

    let fullName = "—";
    if (normalizedFullName) fullName = normalizedFullName;
    else if (nestedFullName) fullName = nestedFullName;
    else if (nestedNames) fullName = nestedNames;
    else if (legacyNames) fullName = legacyNames;
    else if (email) fullName = email;

    const raw = applicant && applicant._raw ? applicant._raw : null;
    const letterB64 = raw && raw.motivationLetterData ? String(raw.motivationLetterData) : "";
    const letterType =
        raw && raw.motivationLetterContentType
            ? String(raw.motivationLetterContentType)
            : "application/pdf";
    const letterName =
        raw && raw.motivationLetterFileName ? String(raw.motivationLetterFileName) : "lettre.pdf";

    async function openCvModal() {
        if (!email) return;
        setCvError(null);
        setLoadingCv(true);
        try {
            const dto = await telechargerCv(email, user && user.token ? user.token : undefined);
            if (!dto || !dto.data) throw new Error("CV introuvable pour cet étudiant.");

            const bin = atob(dto.data);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const blob = new Blob([bytes], {type: dto.type || "application/pdf"});
            const url = URL.createObjectURL(blob);

            setCvUrl(url);
            setShowCv(true);
        } catch (e) {
            setCvError("Impossible d'afficher le CV.");
            setShowCv(true);
        } finally {
            setLoadingCv(false);
        }
    }

    function closeCvModal() {
        setShowCv(false);
        if (cvUrl) {
            URL.revokeObjectURL(cvUrl);
            setCvUrl(null);
        }
        setCvError(null);
    }

    function openLetterModal() {
        if (!letterB64) {
            setLetterError("Aucune lettre de motivation jointe.");
            setShowLetter(true);
            return;
        }
        try {
            const bin = atob(letterB64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const blob = new Blob([bytes], {type: letterType || "application/pdf"});
            const url = URL.createObjectURL(blob);

            setLetterUrl(url);
            setShowLetter(true);
        } catch (e) {
            setLetterError("Impossible d'afficher la lettre de motivation.");
            setShowLetter(true);
        }
    }

    function closeLetterModal() {
        setShowLetter(false);
        if (letterUrl) {
            URL.revokeObjectURL(letterUrl);
            setLetterUrl(null);
        }
        setLetterError(null);
    }

    useEffect(() => {
        return () => {
            if (cvUrl) URL.revokeObjectURL(cvUrl);
            if (letterUrl) URL.revokeObjectURL(letterUrl);
        };
    }, [cvUrl, letterUrl]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                if (showCv) closeCvModal();
                if (showLetter) closeLetterModal();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showCv, showLetter]);

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
                            onClick={openCvModal}
                            disabled={loadingCv}
                            className="text-blue-600 hover:underline disabled:opacity-60"
                        >
                            {loadingCv ? "Ouverture…" : "Voir le CV"}
                        </button>
                    ) : (
                        <span className="text-gray-400">CV non disponible</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top text-gray-700">
                    {letterB64 ? (
                        <button
                            onClick={openLetterModal}
                            className="text-blue-600 hover:underline"
                        >
                            Voir la lettre
                        </button>
                    ) : (
                        <span className="text-gray-400">Aucune lettre de motivation</span>
                    )}
                </td>
            </tr>

            {showCv &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={closeCvModal}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="bg-white rounded-lg p-4 md:p-6 w-[92vw] md:w-[800px] max-h-[85vh] overflow-auto shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 text-gray-600 text-xl"
                                onClick={closeCvModal}
                                aria-label="Fermer"
                            >
                                &times;
                            </button>

                            <h3 className="text-lg font-semibold mb-3">CV de {fullName}</h3>

                            {cvError ? (
                                <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{cvError}</div>
                            ) : cvUrl ? (
                                <div className="w-full h-[70vh] border rounded overflow-hidden">
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                        <Viewer fileUrl={cvUrl}/>
                                    </Worker>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Chargement…</div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

            {showLetter &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={closeLetterModal}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="bg-white rounded-lg p-4 md:p-6 w-[92vw] md:w-[800px] max-h-[85vh] overflow-auto shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 text-gray-600 text-xl"
                                onClick={closeLetterModal}
                                aria-label="Fermer"
                            >
                                &times;
                            </button>

                            <h3 className="text-lg font-semibold mb-3">Lettre de motivation</h3>

                            {letterError ? (
                                <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{letterError}</div>
                            ) : letterUrl ? (
                                <div className="w-full h-[70vh] border rounded overflow-hidden">
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                        <Viewer fileUrl={letterUrl}/>
                                    </Worker>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Chargement…</div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

