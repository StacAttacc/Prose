import { useEffect, useState } from "react";
import { telechargerCv } from "../../services/EtudiantService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCv } from "../../context/CvContext.jsx";
import TeleversementCV from "./TeleversementCV.jsx";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import ErrorBanner from "../display-components/ErrorBanner.jsx";

const statusColors = {
    APPROVED: "bg-green-300 border-green-300",
    PENDING: "bg-yellow-300 border-yellow-300",
    REJECTED: "bg-red-300 border-red-300",
    NONE: "bg-gray-100 border-gray-300"
};

export default function MonCV() {
    const { user } = useAuth();
    const { refreshCV } = useCv();
    const [status, setStatus] = useState("loading");
    const [cv, setCv] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        async function fetchCvStatus() {
            try {
                const cvData = await telechargerCv(user.email, user);
                setCv(cvData);
                if (cvData.status) setStatus(cvData.status);
                else setStatus("NONE");
            } catch (e) {
                setError("Could not fetch CV status.");
                setStatus("NONE");
            }
        }
        fetchCvStatus();
    }, [user, refreshTrigger]);

    const handleCvUpload = () => {
        setRefreshTrigger(prev => prev + 1);
        refreshCV();
    };

    if (status === "loading") return <div>Loading...</div>;
    if (error) return <ErrorBanner message={error} />;

    function openPdfModal(cv) {
        if (!cv?.data) {
            setPdfUrl(null);
            setShowModal(true);
            return;
        }
        try {
            const byteCharacters = atob(cv.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: cv.type || "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (e) {
            setPdfUrl(null);
        }
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    }

    return (
        <div className="max-w-3xl mx-auto pt-6 space-y-4">

            <div className="flex flex-col md:flex-row gap-0 rounded-xl border shadow bg-white overflow-hidden">

                <div>
                    <TeleversementCV onUploadSuccess={handleCvUpload} />
                </div>

                <div className="hidden md:block w-px bg-gray-200"></div>

                <div className={`flex-1 p-6 ${statusColors[status]} flex flex-col`}>
                    {cv && status !== "none" ? (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                                Votre CV courrant
                            </h2>
                            <button
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                                onClick={() => openPdfModal(cv)}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="text-4xl mb-2">📄</span>
                                    <p className="text-sm text-blue-600 font-medium">{cv.name}</p>
                                </div>
                            </button>
                            {cv && cv.comment && (
                                <div>
                                    <p><span className="text-sm font-medium">Commentaire: </span>{cv.comment}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">Aucun CV trouvé.</div>
                    )}
                </div>
            </div>

            {/* Légende des statuts */}
            <div className="bg-white rounded-xl border shadow p-4">
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        <div>
                            <span className="inline-block w-4 h-4 rounded bg-green-300 mr-2"></span>
                            <span className="whitespace-nowrap">Accepté</span>
                        </div>
                        <div>
                            <span className="inline-block w-4 h-4 rounded bg-yellow-300 ml-4 mr-2"></span>
                            <span className="whitespace-nowrap">En Attente d'Approbation</span>
                        </div>
                        <div>
                            <span className="inline-block w-4 h-4 rounded bg-red-300 ml-4 mr-2"></span>
                            <span className="whitespace-nowrap">À Refaire</span>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-lg p-6 md:p-8 w-[90vw] max-w-3xl shadow-2xl relative max-h-[80vh] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 text-gray-700 text-xl"
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                            <div className="mb-4">
                                {pdfUrl ? (
                                    <div className="w-full h-[60vh] max-h-[60vh] overflow-auto border rounded">
                                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                            <Viewer fileUrl={pdfUrl} />
                                        </Worker>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        No preview available. (Check if the CV is uploaded and valid.)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}