import React, {useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import ErrorBanner from "./ErrorBanner.jsx";
import CandidatureForm from "../etudiant-components/CandidatureForm.jsx";

export default function StageDetailsModal({
                                              stage,
                                              isOpen,
                                              onClose,
                                              onApprove,
                                              onReject,
                                              showManagementButtons = false,
                                              showPostulerButton = false,
                                              onCandidatureSuccess,
                                          }) {
    const {user} = useAuth();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [showCandidatureForm, setShowCandidatureForm] = useState(false);
    const [candidatureSuccess, setCandidatureSuccess] = useState(false);

    const [isRejecting, setIsRejecting] = useState(false);

    const shouldShowManagementButtons = showManagementButtons && user?.role === 'GESTIONNAIRE';

    const handleApprove = async () => {
        if (!onApprove) return;

        setIsProcessing(true);
        try {
            await onApprove(stage);
            setRejectionReason("");
        } catch (error) {
            console.error("Erreur lors de l'approbation:", error);
        } finally {
            setIsProcessing(false);
            setIsRejecting(false);
            setError("");
        }
    };

    const handleReject = async () => {
        if (!onReject) return;

        if (!rejectionReason.trim()) {
            setError("Veuillez fournir une raison de rejet");
            return;
        }

        setIsProcessing(true);
        try {
            await onReject(stage, rejectionReason);
            setRejectionReason("");
        } catch (error) {
            console.error("Erreur lors du rejet:", error);
            setError("Erreur lors du rejet:" + error);
        } finally {
            setIsProcessing(false);
            setIsRejecting(false);

        }
    };

    const handleClose = () => {
        setRejectionReason("");
        setIsRejecting(false);
        setShowCandidatureForm(false);
        setCandidatureSuccess(false);
        onClose();
        if (candidatureSuccess && onCandidatureSuccess) {
            onCandidatureSuccess(stage);
        }
    };

    const handlePostuler = () => {
        setShowCandidatureForm(true);
    };

    const handleCandidatureSuccess = () => {
        setShowCandidatureForm(false);
        setCandidatureSuccess(true);
        if (onCandidatureSuccess) {
            onCandidatureSuccess(stage);
        }
    };

    if (!isOpen || !stage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {showCandidatureForm ? (
                    <CandidatureForm
                        stage={stage}
                        onClose={() => setShowCandidatureForm(false)}
                        onSuccess={handleCandidatureSuccess}
                    />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Détails du Stage</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                disabled={isProcessing}
                            >
                                ×
                            </button>
                        </div>

                        {candidatureSuccess && (
                            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                <p className="font-medium">Votre candidature a été envoyée avec succès !</p>
                                <p className="text-sm mt-1">L'employeur sera notifié de votre intérêt pour ce stage.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Informations générales</h3>
                                <div className="space-y-2">
                                    <p><strong>Titre :</strong> {stage.title}</p>
                                    <p><strong>Employeur :</strong> {stage.employeur?.company} {stage.employeur?.email}
                                    </p>
                                    <p><strong>Date de début :</strong> {stage.startDate}</p>
                                    <p><strong>Date de fin :</strong> {stage.endDate}</p>
                                    <p><strong>Lieu :</strong> {stage.location}</p>
                                    <p><strong>Mode de travail :</strong> {stage.workMode}</p>
                                    <p><strong>Compensation :</strong> {stage.compensation}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-700 mb-4">{stage.description}</p>

                                <h3 className="text-lg font-semibold mb-2">Exigences</h3>
                                <p className="text-gray-700 mb-4">{stage.requirements}</p>

                                <h3 className="text-lg font-semibold mb-2">Compétences requises</h3>
                                <ul className="list-disc list-inside text-gray-700">
                                    {stage.skills?.map((skill, skillIndex) => (
                                        <li key={skillIndex}>{skill}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {error && (
                            <ErrorBanner message={error}/>
                        )}
                        {stage.status === 'REJETEE' && stage.rejectionReason && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
                                <h3 className="text-lg font-semibold mb-2 text-red-800">Raison du rejet</h3>
                                <p className="text-red-700">{stage.rejectionReason}</p>
                            </div>
                        )}

        {error && (
           <ErrorBanner message={error} />
        )}
        {stage.status === 'REJETEE' && stage.rejectionReason && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-lg font-semibold mb-2 text-red-800">Raison du rejet</h3>
            <p className="text-red-700">{stage.rejectionReason}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-4">
          <div className="w-full">
            {shouldShowManagementButtons && (
                <div className="flex flex-col">
                  <button
                      onClick={handleApprove}
                      className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 mb-1"
                      disabled={isProcessing || isRejecting}
                  >
                    {isProcessing ? "Traitement..." : "Approuver"}
                  </button>
                  <button
                      onClick={() => {setIsRejecting(!isRejecting)}}
                      className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center  disabled:opacity-50"
                                            disabled={isProcessing}
                                        >
                                            Rejeter
                                        </button>
                                        {isRejecting && (
                                            <div className="mt-6 ">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Raison de rejet (obligatoire pour rejeter le stage) :
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Expliquez pourquoi ce stage est rejeté..."
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
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 mt-2"
                                                        disabled={isProcessing || !rejectionReason}
                                                    >
                                                        {isProcessing ? "Traitement..." : "Confirmer"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                        disabled={isProcessing}
                                    >
                                        Fermer
                                    </button>
                                    {showPostulerButton && !candidatureSuccess && (
                                        <button
                                            onClick={handlePostuler}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
                                        >
                                            Postuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                      </div>
                  )}
                </div>
            )}
            <div className="flex justify-end mt-2">
              <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 align-end"
                  disabled={isProcessing}
              >
                Fermer
              </button>
              {shouldShowPostulerButton && (
                  <button
                      onClick={handlePostuler}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Postuler
                  </button>
              )}
            </div>
        </div>
                </>
                )}
        </div>
    </div>
  );
}