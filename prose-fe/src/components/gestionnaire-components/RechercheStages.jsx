import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {getAllStages, submitStageDecision} from "../../services/GestionnaireService";
import StageDetailsModal from "../display-components/StageDetailsModal";
import ErrorBanner from "../display-components/ErrorBanner.jsx";


export default function GestRechercheStages() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[isProcessing, setIsProcessing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [compensationFilter, setCompensationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
  }, [user.token]);

  const filteredStages = useMemo(() => {
    return stages.filter(stage => {
      const matchesSearch = stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.employeur?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.employeur?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = !locationFilter || 
                            stage.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCompensation = !compensationFilter || 
                                 stage.compensation.toLowerCase().includes(compensationFilter.toLowerCase());
      
      const matchesStatus = !statusFilter || 
                           stage.status.toLowerCase().includes(statusFilter.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesCompensation && matchesStatus;
    });
  }, [stages, searchTerm, locationFilter, compensationFilter, statusFilter]);

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setCompensationFilter("");
    setStatusFilter("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOUMISE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROUVEE':
        return 'bg-green-100 text-green-800';
      case 'REJETEE':
        return 'bg-red-100 text-red-800';
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
      default:
        return status;
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement des stages...</p>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Recherche/Approbation de Stages</h1>

      <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Titre, description, employeur, entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <input
              type="text"
              placeholder="Montréal, Québec, Télétravail..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compensation
            </label>
            <input
              type="text"
              placeholder="20$/h, 500$/semaine..."
              value={compensationFilter}
              onChange={(e) => setCompensationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tous les statuts</option>
              <option value="SOUMISE">Soumise</option>
              <option value="APPROUVEE">Approuvée</option>
              <option value="REJETEE">Rejetée</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredStages.length} stage(s) trouvé(s) sur {stages.length} au total
        </div>
      </div>

      {filteredStages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {stages.length === 0 
              ? "Aucun stage disponible pour le moment."
              : "Aucun stage ne correspond à vos critères de recherche."
            }
          </p>
          {stages.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStages.map((stage, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStageClick(stage)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{stage.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Employeur:</strong> {stage.employeur?.company || stage.employeur?.email}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Lieu:</strong> {stage.location}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Compensation:</strong> {stage.compensation}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  <strong>Période:</strong> {stage.startDate} - {stage.endDate}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Date de création:</strong> {stage.createdAt ? new Date(stage.createdAt).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                  {getStatusText(stage.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <StageDetailsModal
        stage={selectedStage}
        isOpen={isModalOpen}
        onApprove={handleApproveStage}
        onReject={handleRejectStage}
        onClose={closeModal}
        showManagementButtons={true}
      />
    </div>
  );
}