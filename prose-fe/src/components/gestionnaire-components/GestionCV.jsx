import React, { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n, translateDiscipline } from "../../context/I18nContext.jsx";
import { approveCv, fetchAllCVs, fetchCvData, rejectCv } from "../../services/GestionnaireService.js";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import {useLocation, useNavigate} from "react-router-dom";
import { useYear } from "../../context/YearContext";

const statusColors = {
    APPROVED: "bg-green-100 dark:!bg-green-100 border-green-300 dark:!border-green-300",
    PENDING: "bg-yellow-100 dark:!bg-yellow-100 border-yellow-300 dark:!border-yellow-300",
    REJECTED: "bg-red-100 dark:!bg-red-100 border-red-300 dark:!border-red-300"
};

const GestionCV = () => {
    const { user } = useAuth();
    const { t, locale } = useI18n();
    const token = user?.token;
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedYear } = useYear();

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
        if (token && selectedYear) loadAllCvs();
    }, [token, selectedYear]);

    const loadAllCvs = async () => {
        const cvs = await fetchAllCVs(token, selectedYear);
        setAllCvs(cvs || []);
    };

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

    async function openModal(cv) {
        setSelectedCv(cv);
        setPdfUrl(null);
        setModalOpen(true);
        if (!cv?.id) return;
        try {
            const base64 = await fetchCvData(cv.id);
            if (!base64) return;
            const byteCharacters = atob(base64);
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
        await approveCv(selectedCv.id, comment);
        closeModal();
        await loadAllCvs();
        setIsProcessing(false);
        setIsRejecting(false);
        setRejectionReason("");
    };

    const handleReject = async () => {
        if (!selectedCv) return;
        setIsProcessing(true);
        await rejectCv(selectedCv.id, rejectionReason);
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
            <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('rechercherParNom')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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

            <div className="flex gap-2 mb-6 justify-center">
                <button
                    className={`px-4 py-2 rounded-t font-semibold border-b-2 ${tab === 'pending' ? 'border-blue-600 text-blue-700 dark:!text-blue-700 bg-blue-50 dark:!bg-blue-50' : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    onClick={() => setTab('pending')}
                >
                    {t('cvEnAttente')}
                </button>
                <button
                    className={`px-4 py-2 rounded-t font-semibold border-b-2 ${tab === 'nonpending' ? 'border-blue-600 text-blue-700 dark:!text-blue-700 bg-blue-50 dark:!bg-blue-50' : 'border-transparent text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    onClick={() => setTab('nonpending')}
                >
                    {t('cvAcceptesRefaire')}
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
                                <h4 className="font-bold text-center text-gray-900 dark:!text-gray-900">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                <div className="border-b my-2 border-gray-300 dark:!border-gray-300"></div>
                                <p className="text-gray-700 dark:!text-gray-700">{t('discipline')}: {translateDiscipline(cv.discipline, locale)}</p>
                                <p className="text-gray-700 dark:!text-gray-700">{t('email')}: {cv.etudiantEmail}</p>
                            </div>
                        ))}
                        {pendingCvs.length === 0 && <div className="text-center text-gray-400 dark:text-gray-500">{t('aucunCV')}</div>}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">{t('accepte')}</h3>
                            <div className="flex flex-col gap-4">
                                {approvedCvs.map(cv => (
                                    <div
                                        key={cv.id}
                                        className={`border rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${statusColors.APPROVED}`}
                                        onClick={() => openModal(cv)}
                                    >
                                        <h4 className="font-bold text-center text-gray-900 dark:!text-gray-900">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                        <div className="border-b my-2 border-gray-300 dark:!border-gray-300"></div>
                                        <p className="text-gray-700 dark:!text-gray-700">{t('discipline')}: {translateDiscipline(cv.discipline, locale)}</p>
                                        <p className="text-gray-700 dark:!text-gray-700">{t('email')}: {cv.etudiantEmail}</p>
                                    </div>
                                ))}
                                {approvedCvs.length === 0 && <div className="text-center text-gray-400 dark:text-gray-500">{t('aucunCV')}</div>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">{t('aRefaire')}</h3>
                            <div className="flex flex-col gap-4">
                                {rejectedCvs.map(cv => (
                                    <div
                                        key={cv.id}
                                        className={`border rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${statusColors.REJECTED}`}
                                        onClick={() => openModal(cv)}
                                    >
                                        <h4 className="font-bold text-center text-gray-900 dark:!text-gray-900">{cv.etudiantPrenom} {cv.etudiantNom}</h4>
                                        <div className="border-b my-2 border-gray-300 dark:!border-gray-300"></div>
                                        <p className="text-gray-700 dark:!text-gray-700">{t('discipline')}: {translateDiscipline(cv.discipline, locale)}</p>
                                        <p className="text-gray-700 dark:!text-gray-700">{t('email')}: {cv.etudiantEmail}</p>
                                    </div>
                                ))}
                                {rejectedCvs.length === 0 && <div className="text-center text-gray-400 dark:text-gray-500">{t('aucunCV')}</div>}
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
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 w-[90vw] max-w-3xl shadow-2xl relative max-h-[70vh] overflow-auto text-gray-900 dark:text-gray-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
                            aria-label="Close"
                        >&times;</button>

                        <div className="mb-3">
                            <span className="font-semibold">{t('nomEtudiant')}</span> <span className="dark:!text-gray-900">{selectedCv.etudiantPrenom} {selectedCv.etudiantNom}</span>
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold">{t('nomFichier')}</span> <span className="dark:!text-gray-900">{selectedCv.name}</span>
                        </div>
                        <div className="mb-3">
                            <span className="font-semibold">{t('discipline')}:</span> <span className="dark:!text-gray-900">{translateDiscipline(selectedCv.discipline, locale)}</span>
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
                                    {t('noPreviewAvailable')}
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
                                        {isProcessing ? t('traitement') : t('approuver')}
                                    </button>
                                    <button
                                        onClick={() => {setIsRejecting(!isRejecting)}}
                                        className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                                        disabled={isProcessing}
                                    >
                                        {t('rejeter')}
                                    </button>
                                    {isRejecting && (
                                        <div className="mt-6 ">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('raisonRejet')}
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder={t('expliquerRejet')}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                                    {isProcessing ? t('traitement') : t('confirmer')}
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
                                        {t('fermer')}
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