import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useYear } from "../../context/YearContext.jsx";
import { getEmployeurStages } from "../../services/StageService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function PostedStages() {
    const { user } = useAuth();
    const { t, locale } = useI18n();
    const { selectedYear } = useYear();
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

    useEffect(() => {
        async function fetchAllStages() {
            try {
                setLoading(true);
                const data = await getEmployeurStages(user.email, user.token, selectedYear);
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];
                setStages(list);
            } catch (err) {
                setError(err?.message || t('impossibleChargerStages'));
            } finally {
                setLoading(false);
            }
        }
        if (user?.email && user?.token && selectedYear) {
            fetchAllStages();
        }
    }, [user.email, user.token, selectedYear]);

    const filteredStages = useMemo(() => {
        return stages.filter((stage) => {
            const matchesSearch = !searchTerm ||
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
                return t('soumise');
            case "APPROUVEE":
                return t('approuvee');
            case "REJETEE":
                return t('rejetee');
            case "PUBLIEE":
                return t('publiee');
            default:
                return status;
        }
    };

    if (loading)
        return <p className="text-center mt-10">{t('chargementStagesEmployeur')}</p>;
    if (error) return <ErrorBanner message={error} />;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('mesStages')}</h1>

            <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <FilterInput
                        label={t('recherche')}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={t('recherchePlaceholderEmployeur')}
                    />
                    <FilterInput
                        label={t('lieu')}
                        value={locationFilter}
                        onChange={setLocationFilter}
                        placeholder={t('lieuPlaceholder')}
                    />
                    <FilterInput
                        label={t('compensation')}
                        value={compensationFilter}
                        onChange={setCompensationFilter}
                        placeholder={t('compensationPlaceholder')}
                    />
                    <FilterSelect
                        label={t('statut')}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            {t('effacerFiltres')}
                        </button>
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    {t('stagesTrouves', { count: filteredStages.length, total: stages.length })}
                </div>
            </div>

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
                                        <strong>{t('lieu')}:</strong> {stage.location}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <strong>{t('compensation')}:</strong> {stage.compensation}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <strong>{t('periode')}:</strong> {stage.startDate} - {stage.endDate}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        <strong>{t('dateCreation')}:</strong>{" "}
                                        {stage.createdAt
                                            ? new Date(stage.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')
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
                                        {t('voirDetails')} →
                                    </button>
                                </div>

                                {showButton && (
                                    <>
                                        <hr className="my-3" />
                                        <button
                                            onClick={() =>
                                                navigate(`/employeur/stages/${stage.id}/candidatures`)
                                            }
                                            className="w-full px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br transition-all"
                                        >
                                            {t('voirCandidaturesBtn')}
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
            />
            <ScrollToTop />
        </div>
    );
}


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
    const { t } = useI18n();
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
                <option value="">{t('tousLesStatuts')}</option>
                <option value="SOUMISE">{t('soumise')}</option>
                <option value="APPROUVEE">{t('approuvee')}</option>
                <option value="REJETEE">{t('rejetee')}</option>
            </select>
        </div>
    );
}

function EmptyState({ stages, onClear }) {
    const { t } = useI18n();
    return (
        <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
                {stages.length === 0
                    ? t('aucunStageEmployeur')
                    : t('aucunStageCritereRecherche')}
            </p>
            {stages.length > 0 && (
                <button
                    onClick={onClear}
                    className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                    {t('effacerFiltres')}
                </button>
            )}
        </div>
    );
}
