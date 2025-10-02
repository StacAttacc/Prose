import React, { useEffect, useState } from 'react';
import {useAuth} from "../context/AuthContext.jsx";
import {approveCv, fetchAllPendingCvs, rejectCv} from "../services/EtudiantService.js";

const PendingCVs = () => {
    const {user} = useAuth();
    const token = user?.data?.token;
    const [pendingCvs, setPendingCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (token) loadPendingCvs();
    }, [token]);

    const loadPendingCvs = async () => {
        const cvs = await fetchAllPendingCvs(token);
        setPendingCvs(cvs || []);
    };

    const handleCardClick = (cv) => {
        setSelectedCv(cv);
        setModalOpen(true);
    };

    const handleApprove = async () => {
        await approveCv(selectedCv.id, token);
        setModalOpen(false);
        await loadPendingCvs();
    };

    const handleReject = async () => {
        await rejectCv(selectedCv.id, token);
        setModalOpen(false);
        await loadPendingCvs();
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Pending CVs</h2>
            <div className="flex flex-wrap gap-4">
                {pendingCvs.map(cv => (
                    <div
                        key={cv.id}
                        className="border border-gray-300 rounded-lg p-4 w-64 cursor-pointer shadow hover:shadow-lg transition"
                        onClick={() => handleCardClick(cv)}
                    >
                        <h3 className="text-lg font-semibold m-0">{cv.name}</h3>
                        <p className="text-gray-500 mt-2">Etudiant ID: {cv.etudiantId}</p>
                    </div>
                ))}
            </div>

            {modalOpen && selectedCv && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 min-w-[350px] shadow-2xl relative">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-700"
                        >&times;</button>
                        <h2 className="text-xl font-bold mb-2">{selectedCv.name}</h2>
                        <p className="mb-1"><span className="font-semibold">Etudiant ID:</span> {selectedCv.etudiantId}</p>
                        <p className="mb-1"><span className="font-semibold">Approved At:</span> {selectedCv.approvedAt ? new Date(selectedCv.approvedAt).toLocaleString() : 'N/A'}</p>
                        <p className="mb-4"><span className="font-semibold">Rejected At:</span> {selectedCv.rejectedAt ? new Date(selectedCv.rejectedAt).toLocaleString() : 'N/A'}</p>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={handleApprove}
                                className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold"
                            >Approve</button>
                            <button
                                onClick={handleReject}
                                className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 font-semibold"
                            >Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingCVs;