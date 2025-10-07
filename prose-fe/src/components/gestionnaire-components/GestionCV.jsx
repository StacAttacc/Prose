import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { approveCv, fetchAllCVs, rejectCv } from "../../services/GestionnaireService.js";
import { Worker, Viewer } from '@react-pdf-viewer/core';

const statusColors = {
    APPROVED: "bg-green-100 border-green-300",
    PENDING: "bg-yellow-100 border-yellow-300",
    REJECTED: "bg-red-100 border-red-300"
};

const GestionCV = () => {
    const { user } = useAuth();
    const token = user?.token;

    const [allCvs, setAllCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [comment, setComment] = useState("");
    const [tab, setTab] = useState('pending'); // 'pending' or 'nonpending'

    useEffect(() => {
        if (token) loadAllCvs();
    }, [token]);

    const loadAllCvs = async () => {
        const cvs = await fetchAllCVs(token);
        setAllCvs(cvs || []);
    };

    const pendingCvs = allCvs.filter(cv => cv.status === "PENDING");
    const approvedCvs = allCvs.filter(cv => cv.status === "APPROVED");
    const rejectedCvs = allCvs.filter(cv => cv.status === "REJECTED");

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
        setComment("");
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleApprove = async () => {
        if (!selectedCv) return;
        await approveCv(selectedCv.id, comment, token);
        closeModal();
        await loadAllCvs();
    };

    const handleReject = async () => {
        if (!selectedCv) return;
        await rejectCv(selectedCv.id, comment, token);
        closeModal();
        await loadAllCvs();
    };

    const decisionsDisabled = comment.trim().length === 0;

    return (
        <div className="p-8">
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-6 justify-center">
                <button
                    className={`px-4 py-2 rounded-t font-semibold border-b-2 ${tab === 'pending' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setTab('pending')}
                >
                    CV en attente d'acceptation
                </button>
                <button
                    className={`px-4 py-2 rounded-t font-semibold border-b-2 ${tab === 'nonpending' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setTab('nonpending')}
                >
                    CV Acceptés & À Refaire
                </button>
            </div>

            {/* Tab Content */}
            {tab === 'pending' ? (
                <div>
                    <div className="flex flex-col gap-4 max-w-md mx-auto">
                        {pendingCvs.map(cv => (
                            <div
                                key={cv.id}
                                className={`border rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${statusColors.PENDING}`}
                                onClick={() => openModal(cv)}
                            >
                                <h4 className="font-bold text-center">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                <div className="border-b my-2"></div>
                                <p className="text-gray-500">Discipline: {cv.discipline}</p>
                                <p className="text-gray-500">Email: {cv.etudiantEmail}</p>
                            </div>
                        ))}
                        {pendingCvs.length === 0 && <div className="text-center text-gray-400">Aucun CV</div>}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-center">Accepté</h3>
                            <div className="flex flex-col gap-4">
                                {approvedCvs.map(cv => (
                                    <div
                                        key={cv.id}
                                        className={`border rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${statusColors.APPROVED}`}
                                        onClick={() => openModal(cv)}
                                    >
                                        <h4 className="font-bold text-center">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                        <div className="border-b my-2"></div>
                                        <p className="text-gray-500">Discipline: {cv.discipline}</p>
                                        <p className="text-gray-500">Email: {cv.etudiantEmail}</p>
                                    </div>
                                ))}
                                {approvedCvs.length === 0 && <div className="text-center text-gray-400">Aucun CV</div>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-center">À Refaire</h3>
                            <div className="flex flex-col gap-4">
                                {rejectedCvs.map(cv => (
                                    <div
                                        key={cv.id}
                                        className={`border rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${statusColors.REJECTED}`}
                                        onClick={() => openModal(cv)}
                                    >
                                        <h4 className="font-bold text-center">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                        <div className="border-b my-2"></div>
                                        <p className="text-gray-500">Discipline: {cv.discipline}</p>
                                        <p className="text-gray-500">Email: {cv.etudiantEmail}</p>
                                    </div>
                                ))}
                                {rejectedCvs.length === 0 && <div className="text-center text-gray-400">Aucun CV</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && selectedCv && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-lg p-6 md:p-8 w-[90vw] max-w-3xl shadow-2xl relative max-h-[70vh] overflow-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
                            aria-label="Close"
                        >&times;</button>

                        <div className="mb-3">
                            <span className="font-semibold">Nom de l'étudiant:</span> {selectedCv.etudiantPrenom} {selectedCv.etudiantNom}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold">Nom du fichier:</span> {selectedCv.name}
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold">Discipline:</span> {selectedCv.discipline}
                        </div>
                        <div className="mb-4">
                            {pdfUrl ? (
                                <div className="w-full h-[40vh] max-h-[40vh] overflow-auto border rounded">
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
                                Commentaires
                            </label>
                            <textarea
                                id="comment"
                                className="w-full border rounded p-2 text-sm"
                                placeholder="Entrez un commentaire"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                            <div className="flex gap-4 mt-2 justify-center">
                                <button
                                    onClick={handleApprove}
                                    className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                >
                                    Approver
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={decisionsDisabled}
                                    className={`rounded px-4 py-2 font-semibold text-white ${decisionsDisabled
                                        ? "bg-red-300 cursor-not-allowed"
                                        : "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2"
                                    }`}
                                    title={decisionsDisabled ? "Vous devez entrer un commentaire vant de pouvoir rejeter ce CV" : ""}
                                >
                                    Rejeter
                                </button>
                            </div>
                        </div>

                        {selectedCv.comment && (
                            <div className="mt-4">
                                <span className="text-sm font-medium">Commentaire: </span>
                                <span>{selectedCv.comment}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCV;