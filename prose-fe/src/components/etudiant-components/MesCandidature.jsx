import { useState, useEffect, useMemo } from "react";
import { getMesCandidatures } from "../../services/EtudiantService.js";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";

export default function MesCandidature() {
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [compensationFilter, setCompensationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedStage, setSelectedStage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCandidatures = async () => {
            try {
                const data = await getMesCandidatures();
                setCandidatures(data);
            } catch (err) {
                setError("Erreur lors du chargement des candidatures");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidatures();
    }, []);

  const filteredCandidatures = useMemo(() => {
    return candidatures.filter(candidature => {
      const stage = candidature.stage;
      
      if (!stage) return false;
      
      const matchesSearch = !searchTerm ||
                          stage.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.employeur?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          stage.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = !locationFilter || 
                            stage.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesCompensation = !compensationFilter || 
                                 stage.compensation?.toLowerCase().includes(compensationFilter.toLowerCase());
      
      const matchesStatus = !statusFilter || 
                           candidature.status === statusFilter;
      
      return matchesSearch && matchesLocation && matchesCompensation && matchesStatus;
    });
  }, [candidatures, searchTerm, locationFilter, compensationFilter, statusFilter]);

    const clearFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setCompensationFilter("");
        setStatusFilter("");
    };

    const handleViewDetails = (candidature) => {
        setSelectedStage(candidature.stage);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStage(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SOUMISE':
                return 'bg-blue-100 text-blue-800';
            case 'ACCEPTEE':
                return 'bg-green-100 text-green-800';
            case 'REFUSEE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SOUMISE':
                return 'En attente d\'approbation par l\'employeur';
            case 'ACCEPTEE':
                return 'Acceptée';
            case 'REFUSEE':
                return 'Refusée';
            default:
                return status;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Mes Candidatures</h1>

            <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
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
                        <option value="SOUMISE">En attente</option>
                        <option value="ACCEPTEE">Acceptée</option>
                        <option value="REFUSEE">Refusée</option>
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
                {filteredCandidatures.length} candidature(s) trouvée(s) sur {candidatures.length} au total
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Chargement de vos candidatures...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg">{error}</p>
                </div>
            ) : filteredCandidatures.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-24 w-24 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune candidature
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Vous n'avez pas encore postulé à des stages.
                    </p>
                    <p className="text-sm text-gray-400">
                        Consultez les stages disponibles pour commencer à postuler.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCandidatures.map((candidature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {candidature.stage?.title || 'Titre non disponible'}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <strong>Entreprise:</strong> {candidature.stage?.employeur?.company || 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <strong>Lieu:</strong> {candidature.stage?.location || 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <strong>Date de candidature:</strong>{' '}
                                        {candidature.datePostulation
                                            ? new Date(candidature.datePostulation).toLocaleDateString('fr-FR')
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            candidature.status
                                        )}`}
                                    >
                                        {getStatusText(candidature.status)}
                                    </span>
                                </div>
                            </div>

                            {candidature.decision && (
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                    <p className="text-sm text-gray-700">
                                        <strong>Commentaire:</strong> {candidature.decision}
                                    </p>
                                </div>
                            )}

                            {candidature.dateDecision && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500">
                                        Décision prise le:{' '}
                                        {new Date(candidature.dateDecision).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end items-center">
                                <button
                                    onClick={() => handleViewDetails(candidature)}
                                    className="text-teal-600 hover:text-teal-800 font-medium"
                                >
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
                showPostulerButton={false}
            />
        </div>
    );
}
