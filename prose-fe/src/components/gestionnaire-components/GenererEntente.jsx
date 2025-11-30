import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import EntentePdfDoc from "../../components/display-components/EntentePdfDoc.jsx";
import { generateEntente } from "../../services/GestionnaireService.js";
import {base64ToPdfUrl} from "../../utils/pdfUtils.js";

export default function GenererEntente() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [candidatureId, setCandidatureId] = useState("");
    const [entente, setEntente] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onGenerate = async () => {
        setError("");
        setLoading(true);
        try {
            const data = await generateEntente(Number(candidatureId));
            setEntente(data || null);
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || t('erreurInconnue');
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    const backendPdfHref = useMemo(() => base64ToPdfUrl(entente?.documentPdfBase64), [entente]);


    return (
        <div className="p-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{t('genererOuRecupererEntente')}</h1>
            <div className="flex gap-2 mb-4">
                <input
                    type="number"
                    placeholder={t('idCandidatureConfirmee')}
                    className="border rounded px-3 py-2 w-64"
                    value={candidatureId}
                    onChange={(e) => setCandidatureId(e.target.value)}
                />
                <button
                    onClick={onGenerate}
                    disabled={!candidatureId || loading}
                    className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
                >
                    {loading ? t('chargement') : t('genererRecuperer')}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded border border-rose-600 bg-rose-50 text-rose-800 p-3">{error}</div>
            )}

            {entente && (
                <div className="space-y-4">
                    <div className="rounded border p-3 bg-white">
                        <h2 className="font-semibold mb-2">{t('resultat')}</h2>
                        <div className="text-sm text-slate-700">
                            <div>{t('id')}: {entente?.id}</div>
                            <div>{t('statut')}: {entente?.status}</div>
                            <div>{t('nomDocument')}: {entente?.documentName || "entente.pdf"}</div>
                        </div>
                        <div className="mt-3 flex gap-3 flex-wrap">
                            {backendPdfHref && (
                                <a
                                    className="px-3 py-2 rounded border bg-slate-100"
                                    href={backendPdfHref}
                                    download={entente?.documentName || "entente-backend.pdf"}
                                >
                                    {t('telechargerPdfBackend')}
                                </a>
                            )}
                            <PDFDownloadLink
                                document={<EntentePdfDoc entente={entente} />}
                                fileName={entente?.documentName || "entente-react-pdf.pdf"}
                                className="px-3 py-2 rounded border bg-slate-100"
                            >
                                {({ loading: l }) => (l ? t('preparationPdf') : t('telechargerPdfReactPdf'))}
                            </PDFDownloadLink>
                        </div>
                    </div>

                    <div className="rounded border p-2 bg-white h-[80vh]">
                        <PDFViewer width="100%" height="100%">
                            <EntentePdfDoc entente={entente} />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </div>
    );
}
