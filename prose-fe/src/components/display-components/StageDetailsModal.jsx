import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import CandidatureForm from "../etudiant-components/CandidatureForm.jsx";

export default function StageDetailsModal({ 
  stage, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  showManagementButtons = false 
}) {
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showCandidatureForm, setShowCandidatureForm] = useState(false);
  const [candidatureSuccess, setCandidatureSuccess] = useState(false);

  // Déterminer si les boutons de gestion doivent être affichés
  const shouldShowManagementButtons = showManagementButtons && user?.role === 'GESTIONNAIRE';

  // Déterminer si le bouton Postuler doit être affiché
  const showPostulerButton = user?.role === 'ETUDIANT' && stage?.status === 'APPROUVEE' && !showCandidatureForm && !candidatureSuccess;

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
    }
  };

    const handleClose = () => {
        setRejectionReason("");
        setShowCandidatureForm(false);
        setCandidatureSuccess(false);
        onClose();
    };

    const handlePostuler = () => {
        setShowCandidatureForm(true);
    };

    const handleCandidatureSuccess = () => {
        setShowCandidatureForm(false);
        setCandidatureSuccess(true);
    };

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Afficher le formulaire de candidature si nécessaire */}
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

        {/* Message de confirmation de candidature */}
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
              <p><strong>Employeur :</strong> {stage.employeur?.company} ({stage.employeur?.email})</p>
              <p><strong>Statut :</strong> {stage.status}</p>
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
            <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/30 p-3">
              {error}
            </div>
        )}
        {/* Affichage de la raison de rejet si le stage est rejeté */}
        {stage.status === 'REJETEE' && stage.rejectionReason && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-lg font-semibold mb-2 text-red-800">Raison du rejet</h3>
            <p className="text-red-700">{stage.rejectionReason}</p>
          </div>
        )}

        {/* Champ pour la raison de rejet (seulement pour les gestionnaires) */}
        {shouldShowManagementButtons && (
          <div className="mt-6">
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
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={isProcessing}
          >
            Fermer
          </button>

            {/* Bouton Postuler pour les étudiants */}
            {showPostulerButton && (
                <button
                    onClick={handlePostuler}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Postuler
                </button>
            )}

            {/* Boutons de gestion existants */}
            {shouldShowManagementButtons && (
                <>
                    <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Traitement..." : "Approuver"}
                    </button>
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        disabled={isProcessing}
                    >
                {isProcessing ? "Traitement..." : "Rejeter"}
                    </button>
                </>
            )}
        </div>
                </>
            )}
        </div>
    </div>
  );
}