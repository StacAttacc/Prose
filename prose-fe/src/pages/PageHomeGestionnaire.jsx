// src/pages/PageHomeGestionnaire.jsx
import React, { useEffect, useState } from "react";
import { listStagesByStatus, submitStageDecision } from "../services/GestionnaireService";
import { useAuth } from "../context/AuthContext";

export default function PageHomeGestionnaire() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function fetchStages() {
      try {
        const data = await listStagesByStatus("SOUMISE", user.token);
        setStages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStages();
  }, []);

  const handleApproveStage = async () => {
    if (!selectedStage) return;
    
    setIsProcessing(true);
    try {
      await submitStageDecision(selectedStage.id, { approved: true }, user.token);
      
      // Mettre à jour la liste des stages localement
      setStages(stages.filter(stage => stage.id !== selectedStage.id));
      
      // Fermer la modal
      closeModal();
      
      // Optionnel : afficher un message de succès
      alert("Stage approuvé avec succès !");
      
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation du stage");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectStage = async () => {
    if (!selectedStage) return;
    
    // Vérifier qu'une raison de rejet est fournie
    if (!rejectionReason.trim()) {
      alert("Veuillez fournir une raison de rejet");
      return;
    }
    
    setIsProcessing(true);
    try {
      await submitStageDecision(selectedStage.id, { 
        approved: false, 
        reason: rejectionReason 
      }, user.token);
      
      // Mettre à jour la liste des stages localement
      setStages(stages.filter(stage => stage.id !== selectedStage.id));
      
      // Fermer la modal
      closeModal();
      
      // Optionnel : afficher un message de succès
      alert("Stage rejeté avec succès !");
      
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors du rejet du stage");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Stages Soumis</h1>
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b px-4 py-2 text-left">Email de l’employeur</th>
            <th className="border-b px-4 py-2 text-left">Titre du stage</th>
            <th className="border-b px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {stages.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                Aucun stage soumis trouvé.
              </td>
            </tr>
          ) : (
            stages.map((stage, index) => (
              <tr key={index} className="hover:bg-gray-50 transition" onClick={() => handleStageClick(stage)}>
                <td className="border-b px-4 py-2">{stage.employeur.email}</td>
                <td className="border-b px-4 py-2">{stage.title}</td>
                <td className="border-b px-4 py-2">{stage.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal pour afficher les détails du stage */}
      {isModalOpen && selectedStage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Détails du Stage</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={isProcessing}
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informations générales</h3>
                <div className="space-y-2">
                  <p><strong>Titre :</strong> {selectedStage.title}</p>
                  <p><strong>Employeur :</strong> {selectedStage.employeur?.email}</p>
                  <p><strong>Statut :</strong> {selectedStage.status}</p>
                  <p><strong>Date de début :</strong> {selectedStage.startDate}</p>
                  <p><strong>Date de fin :</strong> {selectedStage.endDate}</p>
                  <p><strong>Lieu :</strong> {selectedStage.location}</p>
                  <p><strong>Mode de travail :</strong> {selectedStage.workMode}</p>
                  <p><strong>Compensation :</strong> {selectedStage.compensation}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 mb-4">{selectedStage.description}</p>
                
                <h3 className="text-lg font-semibold mb-2">Exigences</h3>
                <p className="text-gray-700 mb-4">{selectedStage.requirements}</p>
                
                <h3 className="text-lg font-semibold mb-2">Compétences requises</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedStage.skills?.map((skill, skillIndex) => (
                    <li key={skillIndex}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Champ pour la raison de rejet */}
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
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                disabled={isProcessing}
              >
                Fermer
              </button>
              <button
                onClick={handleApproveStage}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? "Traitement..." : "Approuver"}
              </button>
              <button
                onClick={handleRejectStage}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? "Traitement..." : "Rejeter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}