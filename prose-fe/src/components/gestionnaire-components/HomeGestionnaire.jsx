// src/pages/HomeGestionnaire.jsx
import React, { useEffect, useState } from "react";
import { listStagesByStatus, submitStageDecision } from "../../services/GestionnaireService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StageDetailsModal from "../StageDetailsModal.jsx";

export default function HomeGestionnaire() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleApproveStage = async (stage) => {
    try {
      await submitStageDecision(stage.id, { approved: true }, user.token);
      setStages(stages.filter(stage => stage.id !== stage.id));
      closeModal();
      alert("Stage approuvé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation du stage");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectStage = async (stage, rejectionReason) => {
    try {
      await submitStageDecision(stage.id, { 
        approved: false, 
        reason: rejectionReason 
      }, user.token);
      setStages(stages.filter(stage => stage.id !== stage.id));
      closeModal();
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

      {/* Modal réutilisable */}
      <StageDetailsModal
        stage={selectedStage}
        isOpen={isModalOpen}
        onClose={closeModal}
        onApprove={handleApproveStage}
        onReject={handleRejectStage}
        showManagementButtons={true}
      />
    </div>
  );
}