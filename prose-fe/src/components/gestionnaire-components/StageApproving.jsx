import React, { useEffect, useState } from "react";
import { getAllStages, submitStageDecision } from "../../services/GestionnaireService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

export default function StageApproving() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchAllStages() {
      try {
        const data = await getAllStages(user.token);
        setStages(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllStages();
  }, []);

  const handleApproveStage = async (stage) => {
    setIsProcessing(true);
    try {
      await submitStageDecision(stage.id, { approved: true }, user.token);
      setStages(stages.map(s => s.id === stage.id ? { ...s, status: "APPROUVEE" } : s));
      closeModal();
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      setError("Erreur lors de l'approbation du stage");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectStage = async (stage, rejectionReason) => {
    setIsProcessing(true);
    try {
      await submitStageDecision(stage.id, { 
        approved: false, 
        reason: rejectionReason 
      }, user.token);
      setStages(stages.map(s => s.id === stage.id ? { ...s, status: "REJETEE" } : s));
      closeModal();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOUMISE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROUVEE':
        return 'bg-green-100 text-green-800';
      case 'REJETEE':
        return 'bg-red-100 text-red-800';
      case 'PUBLIEE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SOUMISE':
        return 'Soumise';
      case 'APPROUVEE':
        return 'Approuvée';
      case 'REJETEE':
        return 'Rejetée';
      case 'PUBLIEE':
        return 'Publiée';
      default:
        return status;
    }
  };

  const stagesByStatus = stages.reduce((acc, stage) => {
    const status = stage.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(stage);
    return acc;
  }, {});

  const statusOrder = ['SOUMISE', 'APPROUVEE', 'REJETEE', 'PUBLIEE'];


  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Stages</h1>
      {stages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Aucun stage trouvé.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {statusOrder.map(status => {
            const stagesForStatus = stagesByStatus[status] || [];
            if (stagesForStatus.length === 0) return null;

            return (
              <div key={status} className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Stages {getStatusText(status)} ({stagesForStatus.length})
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email de l'employeur</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Titre du stage</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Statut</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date de création</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stagesForStatus.map((stage, index) => (
                        <tr 
                          key={`${status}-${index}`} 
                          className="hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => handleStageClick(stage)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {stage.employeur?.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {stage.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                              {getStatusText(stage.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {stage.createdAt ? new Date(stage.createdAt).toLocaleDateString('fr-FR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

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