import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEtudiantStages } from "../../services/StageService";
import StageDetailsModal from "../StageDetailsModal";

export default function StageListings() {
    const { user } = useAuth();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  

    useEffect(() => {
        async function fetchApprovedStages() {
          try {
            const data = await getEtudiantStages(user.token);
            setStages(data.data);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
        fetchApprovedStages();
      }, [user.token]);

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  if (loading) return <p className="text-center mt-10">Chargement des stages...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Erreur: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Stages Disponibles</h1>
      
      {stages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Aucun stage approuvé disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStageClick(stage)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{stage.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Employeur:</strong> {stage.employeur?.email}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Lieu:</strong> {stage.location}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Compensation:</strong> {stage.compensation}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Période:</strong> {stage.startDate} - {stage.endDate}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Approuvé
                </span>
                <button className="text-teal-600 hover:text-teal-800 font-medium">
                  Voir détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal pour afficher les détails */}
      <StageDetailsModal
        stage={selectedStage}
        isOpen={isModalOpen}
        onClose={closeModal}
        showManagementButtons={false}
      />
    </div>
  );
}