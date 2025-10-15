import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getEtudiantStages } from "../../services/StageService";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

export default function StageListings() {
  const { user } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [compensationFilter, setCompensationFilter] = useState("");

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

  const filteredStages = useMemo(() => {
    return stages.filter(stage => {
      const matchesSearch = stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.employeur?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = !locationFilter || 
                            stage.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCompensation = !compensationFilter || 
                                 stage.compensation.toLowerCase().includes(compensationFilter.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesCompensation;
    });
  }, [stages, searchTerm, locationFilter, compensationFilter]);

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setCompensationFilter("");
  };

  if (loading) return <p className="text-center mt-10">Chargement des stages...</p>;
  if (error) return <ErrorBanner message={error}/>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Stages Disponibles</h1>

      <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Titre, description, employeur, compétences..."
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
              ? "Aucun stage approuvé disponible pour le moment."
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
                  <strong>Employeur:</strong> {stage.employeur?.company}
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
              
              <div className="flex justify-end items-center">
                <button className="text-teal-600 hover:text-teal-800 font-medium">
                  Voir détails →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <StageDetailsModal
        stage={selectedStage}
        isOpen={isModalOpen}
        onClose={closeModal}
        showManagementButtons={false}
      />
    </div>
  );
}