import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { telechargerCv } from "../../services/EtudiantService.js";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import PdfModal from "./PdfModal.jsx";

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

export default function ApplicantRow({ applicant }) {
    const { user } = useAuth();

    const [docState, setDocState] = useState({
        open: false,
        kind: null, // 'cv' | 'letter'
        url: null,
        error: null,
        loading: false,
    });

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
        setDocState({ open: true, kind, url: null, error: null, loading: true });

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
        setDocState({ open: false, kind: null, url: null, error: null, loading: false });
    }

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [docState.open]);

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
        </>
    );
}


