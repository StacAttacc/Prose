import React, { useState } from "react";

export default function InterviewConvocationModal({ applicant, isOpen, onClose, onConfirm }) {
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!interviewDate || !interviewTime) {
            setError("Veuillez saisir la date et l'heure de l'entrevue");
            return;
        }

        // Vérifier que la date est dans le futur
        const selectedDateTime = new Date(`${interviewDate}T${interviewTime}`);
        const now = new Date();

        if (selectedDateTime <= now) {
            setError("La date et l'heure doivent être dans le futur");
            return;
        }

        setIsSubmitting(true);
        try {
            await onConfirm({
                applicantId: applicant.id,
                //interviewDate,
                //interviewTime,
                dateTime: selectedDateTime.toISOString()
            });
            handleClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la convocation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setInterviewDate("");
        setInterviewTime("");
        setError("");
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    const applicantName = applicant?.fullName ||
                          applicant?.etudiant?.fullName ||
                          [applicant?.firstName, applicant?.lastName].filter(Boolean).join(" ") ||
                          [applicant?.etudiant?.firstName, applicant?.etudiant?.lastName].filter(Boolean).join(" ") ||
                          applicant?.email ||
                          applicant?.etudiant?.email ||
                          "Cet étudiant";

    // Obtenir la date minimale (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Convoquer en entrevue
                </h2>

                <p className="text-gray-600 mb-6">
                    Vous êtes sur le point de convoquer <span className="font-semibold">{applicantName}</span> à une entrevue.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Date de l'entrevue <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="interviewDate"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            min={today}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Heure de l'entrevue <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="interviewTime"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 rounded-lg transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Envoi..." : "Convoquer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

