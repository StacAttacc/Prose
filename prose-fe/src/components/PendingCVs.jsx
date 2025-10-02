import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext.jsx";
import { approveCv, fetchAllPendingCvs, rejectCv } from "../services/GestionnaireService.js";
import { Worker, Viewer } from '@react-pdf-viewer/core';

const PendingCVs = () => {
    const { user } = useAuth();
    const token = user?.data?.token;

    const [pendingCvs, setPendingCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [pdfUrl, setPdfUrl] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (token) loadPendingCvs();
    }, [token]);

    const loadPendingCvs = async () => {
        const cvs = await fetchAllPendingCvs(token);
        setPendingCvs(cvs || []);
    };

    function openModal(cv) {
        setSelectedCv(cv);
        if (!cv?.data) {
            setPdfUrl(null);
            setModalOpen(true);
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
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCv(null);
        setRejectReason("");
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleApprove = async () => {
        if (!selectedCv) return;
        await approveCv(selectedCv.id, token);
        closeModal();
        await loadPendingCvs();
    };

    const handleReject = async () => {
        if (!selectedCv) return;
        await rejectCv(selectedCv.id, token, rejectReason);
        closeModal();
        await loadPendingCvs();
    };

    const rejectDisabled = rejectReason.trim().length === 0;

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Pending CVs</h2>
            <div className="flex flex-wrap gap-4">
                {pendingCvs.map(cv => (
                    <div
                        key={cv.id}
                        className="border border-gray-300 rounded-lg p-4 w-64 cursor-pointer shadow hover:shadow-lg transition"
                        onClick={() => openModal(cv)}
                    >
                        <h3 className="text-lg font-semibold m-0">{cv.name}</h3>
                        <p className="text-gray-500 mt-2">Etudiant: {cv.etudiantPrenom} {cv.etudiantNom}</p>
                    </div>
                ))}
            </div>

            {modalOpen && selectedCv && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-3xl shadow-2xl relative max-h-[80vh]">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
                            aria-label="Close"
                        >&times;</button>

                        <div className="mb-3">
                            <span className="font-semibold">Etudiant:</span> {selectedCv.etudiantPrenom} {selectedCv.etudiantNom}
                        </div>

                        <div className="mb-3">
                            <span className="font-semibold">CV Name:</span> {selectedCv.name}
                        </div>

                        <div className="mb-4">
                            {pdfUrl ? (
                                <div className="h-[500px] overflow-auto border rounded">
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


                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-semibold" htmlFor="reject-reason">
                                Rejection reason
                            </label>
                            <textarea
                                id="reject-reason"
                                className="w-full border rounded p-2 text-sm"
                                placeholder="Provide a reason to reject..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                            />
                            <div className="flex gap-4 mt-2">
                                <button
                                    onClick={handleApprove}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={rejectDisabled}
                                    className={`rounded px-4 py-2 font-semibold text-white ${rejectDisabled
                                        ? "bg-red-300 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                                    title={rejectDisabled ? "Enter a rejection reason to enable" : ""}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingCVs;