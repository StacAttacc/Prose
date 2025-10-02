import { useEffect, useState } from "react";
import { telechargerCv } from "../services/EtudiantService.js";
import { useAuth } from "../context/AuthContext";
import TeleversementCV from "./TeleversementCV.jsx";

const statusColors = {
    accepted: "bg-green-100 border-green-300",
    pending: "bg-yellow-100 border-yellow-300",
    rejected: "bg-red-100 border-red-300",
    none: "bg-gray-100 border-gray-300"
};

export default function StudentStatus() {
    const { user } = useAuth();
    const [status, setStatus] = useState("loading");
    const [cv, setCv] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null | String);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        async function fetchCvStatus() {
            try {
                const cvData = await telechargerCv(user.data.email, user);
                setCv(cvData);
                if (cvData.approvedAt) setStatus("accepted");
                else if (cvData.rejectedAt) setStatus("rejected");
                else setStatus("pending");
            } catch (e) {
                setError("Could not fetch CV status.");
                setStatus("none");
            }
        }
        fetchCvStatus();
    }, [user, refreshTrigger]);

    const handleCvUpload = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (status === "loading") return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    function openPdfModal(cv) {
        // Convert base64 to Blob URL
        const byteCharacters = atob(cv.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: cv.type || "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
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
        <div className="max-w-3xl mx-auto pt-6">

            <div className="flex flex-col md:flex-row gap-0 rounded-xl border shadow bg-white overflow-hidden">

                <div>
                    <TeleversementCV onUploadSuccess={handleCvUpload} />
                </div>

                <div className="hidden md:block w-px bg-gray-200"></div>

                <div className={`flex-1 p-6 ${statusColors[status]} flex flex-col`}>
                    {cv && status !== "none" ? (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                                Votre courrant CV
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
                            <div className="flex flex-col gap-2 text-xs">
                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                                    <div>
                                        <span className="inline-block w-4 h-4 rounded bg-green-400 mr-2"></span>
                                        <span className="whitespace-nowrap">Accepté</span>
                                    </div>
                                    <div>
                                        <span className="inline-block w-4 h-4 rounded bg-yellow-400 ml-4 mr-2"></span>
                                        <span className="whitespace-nowrap">En Attente</span>
                                    </div>
                                    <div>
                                        <span className="inline-block w-4 h-4 rounded bg-red-400 ml-4 mr-2"></span>
                                        <span className="whitespace-nowrap">À Refaire</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">No CV found.</div>
                    )}
                </div>
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 max-w-2xl w-full relative">
                            <button
                                className="absolute top-2 right-2 text-gray-700 text-xl"
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                            <iframe
                                src={pdfUrl}
                                title="CV PDF"
                                className="w-full h-[70vh] border rounded"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* va lister le statut des offres d'emploi auquels ils ont postulé */}
            <div className="flex flex-col rounded-xl border shadow bg-white overflow-hidden mt-6">
                <div>offre d'emploi postulé 1</div>
                <div>offre d'emploi postulé 2</div>
                <div>offre d'emploi postulé 3</div>
            </div>

        </div>
    );
}