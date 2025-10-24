import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { approveCv, fetchAllCVs, rejectCv } from "../../services/GestionnaireService.js";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {useLocation, useNavigate} from "react-router-dom";

const statusColors = {
    APPROVED: "bg-green-100 border-green-300",
    PENDING: "bg-yellow-100 border-yellow-300",
    REJECTED: "bg-red-100 border-red-300"
};

const GestionCV = () => {
    const { user } = useAuth();
    const token = user?.token;
    const location = useLocation();
    const navigate = useNavigate();

    const [allCvs, setAllCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [comment, setComment] = useState("");
    const [tab, setTab] = useState('pending'); // 'pending' or 'nonpending'
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (token) loadAllCvs();
    }, [token]);

    const loadAllCvs = async () => {
        const cvs = await fetchAllCVs(token);
        setAllCvs(cvs || []);
    };

    // Fonction de filtrage par nom
    const filterByName = (cvs) => {
        if (!searchTerm.trim()) return cvs;
        const term = searchTerm.toLowerCase();
        return cvs.filter(cv => {
            const fullName = `${cv.etudiantPrenom} ${cv.etudiantNom}`.toLowerCase();
            return fullName.includes(term);
        });
    };

    const pendingCvs = filterByName(allCvs.filter(cv => cv.status === "PENDING"));
    const approvedCvs = filterByName(allCvs.filter(cv => cv.status === "APPROVED"));
    const rejectedCvs = filterByName(allCvs.filter(cv => cv.status === "REJECTED"));

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
        } catch {
            setPdfUrl(null);
        }
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCv(null);
        setComment("");
        setIsRejecting(false);
        setRejectionReason("");
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleApprove = async () => {
        if (!selectedCv) return;
        setIsProcessing(true);
        await approveCv(selectedCv.id, comment, token);
        closeModal();
        await loadAllCvs();
        setIsProcessing(false);
        setIsRejecting(false);
        setRejectionReason("");
    };

    const handleReject = async () => {
        if (!selectedCv) return;
        setIsProcessing(true);
        await rejectCv(selectedCv.id, comment, token);
        closeModal();
        await loadAllCvs();
        setIsProcessing(false);
        setIsRejecting(false);
        setRejectionReason("");
    };

    useEffect(() => {
       const openCvId = location?.state?.openCvId;
        if (!openCvId) return;

        if (allCvs && allCvs.length > 0) {
            const cv = allCvs.find(c => String(c.id) === String(openCvId));
            if (cv) {
                openModal(cv);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [user, location.state?.openCvId, allCvs, navigate, location]);

    const decisionsDisabled = comment.trim().length === 0;

    return (
        <div className="p-8">
            {/* Barre de recherche */}
            <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher par nom d'étudiant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

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

                        {decisionsDisabled && (
                            <div className="w-full">
                                <div className="flex flex-col">
                                    <button
                                        onClick={handleApprove}
                                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-4 py-2 text-center disabled:opacity-50 mb-1"
                                        disabled={isProcessing || isRejecting}
                                    >
                                        {isProcessing ? "Traitement..." : "Approuver"}
                                    </button>
                                    <button
                                        onClick={() => {setIsRejecting(!isRejecting)}}
                                        className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                        disabled={isProcessing}
                                    >
                                        Rejeter
                                    </button>
                                    {isRejecting && (
                                        <div className="mt-6 ">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Raison de rejet (obligatoire pour rejeter le CV) :
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Expliquez pourquoi ce CV est rejeté..."
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows="3"
                                                disabled={isProcessing}
                                            />
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={handleReject}
                                                    className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center disabled:opacity-50 mt-2"
                                                    disabled={isProcessing || !rejectionReason}
                                                >
                                                    {isProcessing ? "Traitement..." : "Confirmer"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 align-end"
                                        disabled={isProcessing}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionCV;