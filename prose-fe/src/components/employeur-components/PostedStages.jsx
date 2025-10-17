import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getEmployeurStages } from "../../services/StageService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";

export default function PostedStages() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedStage, setSelectedStage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [compensationFilter, setCompensationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // ---------- FETCH STAGES ----------
    useEffect(() => {
        async function fetchAllStages() {
            try {
                const data = await getEmployeurStages(user.email, user.token);
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];
                setStages(list);
            } catch (err) {
                setError(err?.message || "Impossible de charger les stages.");
            } finally {
                setLoading(false);
            }
        }
        fetchAllStages();
    }, [user.email, user.token]);

    // ---------- FILTER ----------
    const filteredStages = useMemo(() => {
        return stages.filter((stage) => {
            const matchesSearch =
                stage.title?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
                stage.description?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
                (Array.isArray(stage.skills) &&
                    stage.skills.some((s) =>
                        s?.toLowerCase?.().includes(searchTerm.toLowerCase())
                    ));

            const matchesLocation =
                !locationFilter ||
                stage.location?.toLowerCase?.().includes(locationFilter.toLowerCase());

            const matchesCompensation =
                !compensationFilter ||
                stage.compensation
                    ?.toLowerCase?.()
                    .includes(compensationFilter.toLowerCase());

            const matchesStatus =
                !statusFilter ||
                stage.status?.toLowerCase?.().includes(statusFilter.toLowerCase());

            return (
                matchesSearch &&
                matchesLocation &&
                matchesCompensation &&
                matchesStatus
            );
        });
    }, [stages, searchTerm, locationFilter, compensationFilter, statusFilter]);

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
        setStatusFilter("");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "SOUMISE":
                return "bg-yellow-100 text-yellow-800";
            case "APPROUVEE":
                return "bg-green-100 text-green-800";
            case "REJETEE":
                return "bg-red-100 text-red-800";
            case "PUBLIEE":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "SOUMISE":
                return "Soumise";
            case "APPROUVEE":
                return "Approuvée";
            case "REJETEE":
                return "Rejetée";
            case "PUBLIEE":
                return "Publiée";
            default:
                return status;
        }
    };

    if (loading)
        return <p className="text-center mt-10">Chargement des stages...</p>;
    if (error) return <ErrorBanner message={error} />;

    // ---------- RENDER ----------
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Mes Stages</h1>

            {/* Filtres */}
            <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <FilterInput
                        label="Recherche"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Titre, description..."
                    />
                    <FilterInput
                        label="Lieu"
                        value={locationFilter}
                        onChange={setLocationFilter}
                        placeholder="Montréal, Québec, Télétravail..."
                    />
                    <FilterInput
                        label="Compensation"
                        value={compensationFilter}
                        onChange={setCompensationFilter}
                        placeholder="20$/h, 500$/semaine..."
                    />
                    <FilterSelect
                        label="Statut"
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
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
                    {filteredStages.length} stage(s) trouvé(s) sur {stages.length} au
                    total
                </div>
            </div>

            {/* Cartes des stages */}
            {filteredStages.length === 0 ? (
                <EmptyState stages={stages} onClear={clearFilters} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStages.map((stage) => {
                        const isSoumise = stage.status === "SOUMISE";
                        const isRejetee = stage.status === "REJETEE";
                        const showButton = stage.status === "APPROUVEE" || stage.status === "PUBLIEE";

                        return (
                            <div
                                key={stage.id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {stage.title}
                                    </h3>
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
                                        <strong>Date de création:</strong>{" "}
                                        {stage.createdAt
                                            ? new Date(stage.createdAt).toLocaleDateString("fr-FR")
                                            : "-"}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}
                                    >
                                        {getStatusText(stage.status)}
                                    </span>
                                    <button
                                        onClick={() => handleStageClick(stage)}
                                        className="text-teal-600 hover:text-teal-800 font-medium"
                                    >
                                        Voir détails →
                                    </button>
                                </div>

                                {/* Bouton et hr uniquement si APPROUVÉE ou PUBLIÉE */}
                                {showButton && (
                                    <>
                                        <hr className="my-3" />
                                        <button
                                            onClick={() =>
                                                navigate(`/employeur/stages/${stage.id}/candidatures`)
                                            }
                                            className="w-full px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br transition-all"
                                        >
                                            Voir les candidatures
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
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

/* ---------- Sous-composants ---------- */

function FilterInput({ label, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
        </div>
    );
}

function FilterSelect({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
                <option value="">Tous les statuts</option>
                <option value="SOUMISE">Soumise</option>
                <option value="APPROUVEE">Approuvée</option>
                <option value="REJETEE">Rejetée</option>
                <option value="PUBLIEE">Publiée</option>
            </select>
        </div>
    );
}

function EmptyState({ stages, onClear }) {
    return (
        <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
                {stages.length === 0
                    ? "Vous n'avez aucun stage."
                    : "Aucun stage ne correspond à vos critères de recherche."}
            </p>
            {stages.length > 0 && (
                <button
                    onClick={onClear}
                    className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                    Effacer les filtres
                </button>
            )}
        </div>
    );
}
