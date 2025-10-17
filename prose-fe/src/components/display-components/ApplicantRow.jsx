import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { telechargerCv } from "../../services/EtudiantService.js";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

function firstNonEmpty(...vals) {
    for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
    return "";
}

export default function ApplicantRow({ applicant }) {
    const { user } = useAuth();
    const [docState, setDocState] = useState({
        open: false,
        kind: null,
        url: null,
        error: null,
        loading: false,
    });

    const email = firstNonEmpty(
        applicant?.etudiant?.email,
        applicant?.email,
        applicant?.etudiantEmail
    );

    const fullName =
        firstNonEmpty(
            applicant?.fullName,
            applicant?.etudiant?.fullName,
            [applicant?.etudiant?.firstName, applicant?.etudiant?.lastName]
                .filter(Boolean)
                .join(" "),
            [applicant?.prenom, applicant?.nom].filter(Boolean).join(" ")
        ) || email || "—";

    const raw = applicant?._raw ?? null;
    const letterB64 = raw?.motivationLetterData ?? "";
    const letterType = raw?.motivationLetterContentType ?? "application/pdf";

    async function openDocument(kind) {
        setDocState({ open: true, kind, url: null, error: null, loading: true });
        try {
            if (kind === "cv") {
                if (!email) throw new Error("Email manquant");
                const dto = await telechargerCv(email, user?.token);
                if (!dto?.data) throw new Error("CV introuvable");
                const bin = atob(dto.data);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const blob = new Blob([bytes], { type: dto.type || "application/pdf" });
                setDocState((s) => ({
                    ...s,
                    url: URL.createObjectURL(blob),
                    loading: false,
                }));
            } else {
                if (!letterB64)
                    throw new Error("Aucune lettre de motivation jointe.");
                const bin = atob(letterB64);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const blob = new Blob([bytes], { type: letterType });
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
        setDocState({ open: false, kind: null, url: null, error: null, loading: false });
    }

    // Esc pour fermer
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [docState]);

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
                            {docState.loading && docState.kind === "cv"
                                ? "Ouverture…"
                                : "Voir le CV"}
                        </button>
                    ) : (
                        <span className="text-gray-400">CV non disponible</span>
                    )}
                </td>

                <td className="py-3 px-4 align-top text-gray-700">
                    {letterB64 ? (
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
            </tr>

            {docState.open && (
                <PdfModal
                    title={
                        docState.kind === "cv"
                            ? `CV de ${fullName}`
                            : "Lettre de motivation"
                    }
                    url={docState.url}
                    error={docState.error}
                    onClose={closeModal}
                />
            )}
        </>
    );
}

/** ---- Sous composant intégré ---- **/
function PdfModal({ title, url, error, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg p-4 md:p-6 w-[92vw] md:w-[800px] max-h-[85vh] overflow-auto shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 text-xl"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    &times;
                </button>
                <h3 className="text-lg font-semibold mb-3">{title}</h3>

                {error ? (
                    <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{error}</div>
                ) : url ? (
                    <div className="w-full h-[70vh] border rounded overflow-hidden">
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                            <Viewer fileUrl={url} />
                        </Worker>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">Chargement…</div>
                )}
            </div>
        </div>
    );
}
