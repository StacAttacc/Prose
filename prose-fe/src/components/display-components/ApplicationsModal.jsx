import React from "react";

export default function ApplicationsModal({ student, onClose, onSeeStage }) {
    if (!student) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
                <div className="px-5 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Candidatures de {student.fullName}
                    </h3>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {student.applications?.length ? (
                        <ul className="space-y-3">
                            {student.applications.map((ap, i) => (
                                <li key={ap.id ?? i} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {ap.title || "Stage"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {ap.company || ""}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                        title="Ouvrir la fiche du stage"
                                        onClick={() => onSeeStage(ap)}
                                    >
                                        Voir le stage
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-600">
                            Aucune candidature pour cet étudiant.
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 border-t flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-700"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}