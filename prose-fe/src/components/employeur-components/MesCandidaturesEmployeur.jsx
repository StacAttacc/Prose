import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { useYear } from "../../context/YearContext.jsx";
import { getEmployeurStages } from "../../services/StageService.js";
import { getStageApplicants } from "../../services/EmployeurService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ApplicantRow from "../display-components/ApplicantRow.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

export default function MesCandidaturesEmployeur() {
    const { user } = useAuth();
    const { t } = useI18n();
    const { selectedYear } = useYear();

    const [allCandidatures, setAllCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        async function fetchAllCandidatures() {
            try {
                setLoading(true);
                setError(null);
                
                // Récupérer tous les stages de l'employeur
                const stagesData = await getEmployeurStages(user.email, user.token, selectedYear);
                const stages = Array.isArray(stagesData) 
                    ? stagesData 
                    : Array.isArray(stagesData?.data) 
                        ? stagesData.data 
                        : [];

                const candidaturesPromises = stages.map(async (stage) => {
                    try {
                        const candidatures = await getStageApplicants(stage.id);
                        return candidatures.map(candidature => ({
                            ...candidature,
                            stage: stage,
                            stageTitle: stage.title
                        }));
                    } catch (err) {
                        console.error(`Erreur lors de la récupération des candidatures pour le stage ${stage.id}:`, err);
                        return [];
                    }
                });

                const allCandidaturesArrays = await Promise.all(candidaturesPromises);
                const flatCandidatures = allCandidaturesArrays.flat();
                
                setAllCandidatures(flatCandidatures);
            } catch (err) {
                console.error("Erreur lors du chargement des candidatures:", err);
                setError(t('erreurChargementCandidatures'));
            } finally {
                setLoading(false);
            }
        }

        if (user?.email && user?.token && selectedYear) {
            fetchAllCandidatures();
        }
    }, [user?.email, user?.token, selectedYear, t]);

    const filteredCandidatures = useMemo(() => {
        return allCandidatures.filter(candidature => {
            const stage = candidature.stage || {};
            const applicant = candidature.etudiant || {};
            const fullName = `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || candidature.email || '';
            
            const matchesSearch = !searchTerm ||
                stage.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidature.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesLocation = !locationFilter ||
                stage.location?.toLowerCase().includes(locationFilter.toLowerCase());
            
            const matchesStatus = !statusFilter ||
                (candidature.status || candidature.statut || '').toLowerCase().includes(statusFilter.toLowerCase());
            
            return matchesSearch && matchesLocation && matchesStatus;
        });
    }, [allCandidatures, searchTerm, locationFilter, statusFilter]);

    const clearFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setStatusFilter("");
    };

    const handleStatusUpdate = (candidatureId, newStatus, dateDecision) => {
        setAllCandidatures(prev => prev.map(c => {
            const id = c?.id ?? c?.candidatureId ?? c?.applicationId;
            if (Number(id) === Number(candidatureId)) {
                return {
                    ...c,
                    status: newStatus,
                    statut: newStatus,
                    dateDecision: dateDecision || c.dateDecision
                };
            }
            return c;
        }));
    };

    const handleReject = async (applicant) => {
        const id = Number(applicant?.id ?? applicant?.candidatureId ?? applicant?.applicationId);
        if (!Number.isFinite(id)) return;
        if (!user?.token) return;
        
        try {
            const { rejectApplicant } = await import("../../services/EmployeurService.js");
            const res = await rejectApplicant(id, user?.token);
            if (res.ok) {
                setAllCandidatures(prev => prev.filter(x =>
                    Number(x?.id ?? x?.candidatureId ?? x?.applicationId) !== id
                ));
            }
        } catch (e) {
            console.error("Erreur lors du rejet:", e);
        }
    };

    const handleApprove = async (applicant) => {
        const id = Number(applicant?.id ?? applicant?.candidatureId ?? applicant?.applicationId);
        if (!Number.isFinite(id)) return;
        
        try {
            const { approveApplicant } = await import("../../services/EmployeurService.js");
            const res = await approveApplicant(id, user?.token);
            if (res.ok) {
                setAllCandidatures(prev =>
                    prev.filter(x => Number(x?.id ?? x?.candidatureId ?? x?.applicationId) !== id)
                );
            } else if (res.status === 403) {
                setError(t('doitConvoquerAvantAccepter'));
            } else {
                setError(t('erreurAcceptationCandidature'));
            }
        } catch (e) {
            console.error("Erreur lors de l'acceptation:", e);
            if (e?.response?.status === 403) {
                setError(t('doitConvoquerAvantAccepter'));
            } else {
                setError(t('erreurAcceptationCandidature'));
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('mesCandidaturesEmployeur')}</h1>

            {error && <ErrorBanner message={error} />}

            <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('recherche')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('rechercheNomEmail')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('lieu')}
                        </label>
                        <input
                            type="text"
                            placeholder={t('lieuPlaceholder')}
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('statut')}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">{t('tousLesStatuts')}</option>
                            <option value="SOUMISE">{t('soumise')}</option>
                            <option value="ACCEPTEE">{t('acceptee')}</option>
                            <option value="REFUSEE">{t('refusee')}</option>
                            <option value="CONVOQUEE">{t('convoquee')}</option>
                            <option value="CONFIRMER">{t('confirmee')}</option>
                        </select>
                    </div>

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
                    {t('candidaturesTrouvees', { count: filteredCandidatures.length, total: allCandidatures.length })}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">{t('chargementCandidatures')}</p>
                </div>
            ) : filteredCandidatures.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {allCandidatures.length === 0 
                            ? t('aucuneCandidatureEmployeur')
                            : t('aucuneCandidatureCritere')
                        }
                    </p>
                    {allCandidatures.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                        >
                            {t('effacerFiltres')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left border-b">
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('candidat')}</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('cv')}</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('lettreMotivation')}</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('statut')}</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('entrevue')}</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidatures.map((candidature) => (
                                    <ApplicantRow
                                        key={candidature.id ?? candidature.candidatureId ?? candidature.applicationId}
                                        applicant={candidature}
                                        showActions
                                        onStatusUpdate={handleStatusUpdate}
                                        onReject={handleReject}
                                        onApprove={handleApprove}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <ScrollToTop />
        </div>
    );
}

