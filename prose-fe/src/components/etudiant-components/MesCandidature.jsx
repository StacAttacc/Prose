import { useState, useEffect, useMemo } from "react";
import { getMesCandidatures, respondToOffer, checkEntenteExists, signEntente } from "../../services/EtudiantService.js";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import EntenteSignatureModal from "../display-components/EntenteSignatureModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import { useI18n } from "../../context/I18nContext.jsx";

export default function MesCandidature() {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [compensationFilter, setCompensationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedStage, setSelectedStage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [responseComments, setResponseComments] = useState({});
    const [respondingTo, setRespondingTo] = useState(null);
    const [errors, setErrors] = useState({});
    const [showingRefusalForm, setShowingRefusalForm] = useState({});
    const [ententeDataMap, setEntenteDataMap] = useState({}); // Map candidatureId -> ententeData
    const [checkingEntente, setCheckingEntente] = useState({}); // Map candidatureId -> boolean
    const [showEntenteModal, setShowEntenteModal] = useState(false);
    const [selectedCandidatureForEntente, setSelectedCandidatureForEntente] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCandidatures = async () => {
            try {
                const data = await getMesCandidatures();
                setCandidatures(data);
            } catch (err) {
                setError(t('erreurChargementCandidatures'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidatures();
    }, []);

    useEffect(() => {
        const openCandidatureFromNotif = location?.state?.openCandidatureId;
        if (!openCandidatureFromNotif) return;

        if (candidatures && candidatures.length > 0) {
            const candidatureToScrollTo = candidatures.find(c => String(c.id) === String(openCandidatureFromNotif));
            if (candidatureToScrollTo) {
                setTimeout(() => {
                    const element = document.getElementById(`candidature-${candidatureToScrollTo.id}`);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        element.classList.add('ring-2', 'ring-teal-500');
                        setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-teal-500');
                        }, 2000);
                    }
                }, 100)
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state?.openCandidatureId, candidatures, navigate, location]);

    useEffect(() => {
        const ententeFromNotif = location?.state?.openEntenteId;
        if (!ententeFromNotif) return;

        if (candidatures && candidatures.length > 0) {
            const candidatureToScrollTo = candidatures.find(c => String(c.id) === String(ententeFromNotif));
            if (candidatureToScrollTo) {
                setTimeout(() => {
                    const element = document.getElementById(`candidature-${candidatureToScrollTo.id}`);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        element.classList.add('ring-2', 'ring-teal-500');
                        setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-teal-500');
                        }, 2000);
                    }
                }, 100)
                setSelectedCandidatureForEntente(candidatureToScrollTo);
                setShowEntenteModal(true);
                navigate(location.pathname, {replace: true, state: {}});
            }
        }
    }, [location.state?.openEntenteId, candidatures, navigate, location]);

    // Vérifier l'existence de l'entente pour les candidatures confirmées
    useEffect(() => {
        const checkEntentes = async () => {
            const confirmedCandidatures = candidatures.filter(c => 
                c.status === "CONFIRMER" || c.status === "CONFIRMEE"
            );
            
            for (const candidature of confirmedCandidatures) {
                if (!checkingEntente[candidature.id] && user?.token) {
                    setCheckingEntente(prev => ({ ...prev, [candidature.id]: true }));
                    try {
                        const result = await checkEntenteExists(candidature.id, user.token);
                        setEntenteDataMap(prev => ({
                            ...prev,
                            [candidature.id]: result.exists ? result.data : null
                        }));
                    } catch (error) {
                        console.error(`Erreur lors de la vérification de l'entente pour candidature ${candidature.id}:`, error);
                        setEntenteDataMap(prev => ({
                            ...prev,
                            [candidature.id]: null
                        }));
                    } finally {
                        setCheckingEntente(prev => ({ ...prev, [candidature.id]: false }));
                    }
                }
            }
        };

        if (candidatures.length > 0 && user?.token) {
            checkEntentes();
        }
    }, [candidatures, user?.token]);

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

    const handleRespondToOffer = async (candidatureId, accepted) => {
        // Réinitialiser l'erreur pour cette candidature
        setErrors(prev => {
            const newState = { ...prev };
            delete newState[candidatureId];
            return newState;
        });

        try {
            const comment = responseComments[candidatureId] || "";
            setRespondingTo(candidatureId);
            await respondToOffer(candidatureId, accepted, comment);
            
            // Rafraîchir les candidatures après la réponse
            const data = await getMesCandidatures();
            setCandidatures(data);
            
            setResponseComments(prev => {
                const newState = { ...prev };
                delete newState[candidatureId];
                return newState;
            });
            setShowingRefusalForm(prev => {
                const newState = { ...prev };
                delete newState[candidatureId];
                return newState;
            });
            setRespondingTo(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || t('erreurEnvoiReponse');
            setErrors(prev => ({
                ...prev,
                [candidatureId]: errorMessage
            }));
            setRespondingTo(null);
        }
    };

    const handleCommentChange = (candidatureId, comment) => {
        setResponseComments(prev => ({
            ...prev,
            [candidatureId]: comment
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SOUMISE':
                return 'bg-blue-100 text-blue-800';
            case 'ACCEPTEE':
                return 'bg-green-100 text-green-800';
            case 'REFUSEE':
                return 'bg-red-100 text-red-800';
            case 'CONVOQUEE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMER':
                return 'bg-green-100 text-green-800';
            case 'REFUSEE_ETUDIANT':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SOUMISE':
                return t('enAttenteApprobationEmployeur');
            case 'ACCEPTEE':
                return t('accepteeParEmployeur');
            case 'REFUSEE':
                return t('refuseeParEmployeur');
            case 'CONVOQUEE':
                return t('convoqueeEntrevue');
            case 'CONFIRMER':
                return t('confirmee');
            case 'REFUSEE_ETUDIANT':
                return t('refusee');
            default:
                return status;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">{t('mesCandidatures')}</h1>

            <div className="mb-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('recherche')}
                    </label>
                    <input
                    type="text"
                    placeholder={t('recherchePlaceholderEtudiant')}
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
                    {t('compensation')}
                    </label>
                    <input
                    type="text"
                    placeholder={t('compensationPlaceholder')}
                    value={compensationFilter}
                    onChange={(e) => setCompensationFilter(e.target.value)}
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
                        <option value="SOUMISE">{t('enAttente')}</option>
                        <option value="ACCEPTEE">{t('acceptee')}</option>
                        <option value="REFUSEE">{t('refusee')}</option>
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
                {t('candidaturesTrouvees', { count: filteredCandidatures.length, total: candidatures.length })}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">{t('chargementCandidatures')}</p>
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
                        {t('aucuneCandidature')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {t('pasEncorePostule')}
                    </p>
                    <p className="text-sm text-gray-400">
                        {t('consultezStagesDisponibles')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCandidatures.map((candidature, index) => {
                        const isAcceptedByStudent = candidature.status === 'CONFIRMER';
                        const isRefusedByStudent = candidature.status === 'REFUSEE_ETUDIANT';

                        return (
                            <div
                                key={index}
                                id={`candidature-${candidature.id}`}
                                className={`rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow ${
                                    isAcceptedByStudent 
                                        ? 'bg-green-100 border-green-300' 
                                        : isRefusedByStudent
                                            ? 'bg-red-100 border-red-300'
                                            : 'bg-white border-gray-200'
                                }`}
                            >
                                {isAcceptedByStudent ? (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {candidature.stage?.title || t('titreNonDisponible')}
                                        </h3>
                                        <h4 className="text-3xl font-bold text-green-800 text-center">
                                            {t('stageAccepte')}
                                        </h4>
                                        {candidature.decision && candidature.decision.trim() !== "" && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
                                                <p className="text-sm text-gray-700">
                                                    <strong>{t('commentaire')}:</strong> {candidature.decision}
                                                </p>
                                            </div>
                                        )}
                                        {checkingEntente[candidature.id] ? (
                                            <div className="text-center text-gray-500">
                                                {t('verificationEntente')}
                                            </div>
                                        ) : ententeDataMap[candidature.id] ? (
                                            <>
                                                {(() => {
                                                    const ententeData = ententeDataMap[candidature.id];
                                                    const status = ententeData.status;
                                                    // Vérifier si l'étudiant a déjà signé
                                                    const etudiantASigne = status === "SIGNEE_ETUDIANT" 
                                                        || status === "SIGNEE_ETUDIANT_ET_EMPLOYEUR" 
                                                        || status === "SIGNEE"
                                                        || ententeData.dateSignatureEtudiant != null;
                                                    
                                                    if (status === "SIGNEE") {
                                                        return (
                                                            <div className="mt-4 flex flex-col items-center gap-2">
                                                                <span className="text-sm text-green-600 font-medium">
                                                                    {t('ententeSigneeParToutesLesParties')}
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedCandidatureForEntente(candidature);
                                                                            setShowEntenteModal(true);
                                                                        }}
                                                                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                                        type="button"
                                                                    >
                                                                        {t('voirEntenteStage')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (ententeData?.documentPdfBase64) {
                                                                                const bin = atob(ententeData.documentPdfBase64);
                                                                                const bytes = new Uint8Array(bin.length);
                                                                                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                                                                                const blob = new Blob([bytes], { type: "application/pdf" });
                                                                                const url = URL.createObjectURL(blob);
                                                                                const a = document.createElement("a");
                                                                                a.href = url;
                                                                                a.download = ententeData.documentName || "entente_stage.pdf";
                                                                                document.body.appendChild(a);
                                                                                a.click();
                                                                                a.remove();
                                                                                URL.revokeObjectURL(url);
                                                                            }
                                                                        }}
                                                                        className="px-6 py-3 rounded-md font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br transition-all"
                                                                        type="button"
                                                                    >
                                                                        {t('telechargerEntenteStage')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <div className="mt-4 flex justify-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedCandidatureForEntente(candidature);
                                                                    setShowEntenteModal(true);
                                                                }}
                                                                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                                type="button"
                                                            >
                                                                {etudiantASigne ? t('voirEntenteStage') : t('voirEtSignerEntenteStage')}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            <div className="text-center text-gray-500 text-sm mt-4">
                                                {t('enAttenteGestionnaireEntente')}
                                            </div>
                                        )}
                                    </div>
                                ) : isRefusedByStudent ? (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {candidature.stage?.title || t('titreNonDisponible')}
                                        </h3>
                                        <h4 className="text-3xl font-bold text-red-800 text-center">
                                            {t('offreRefusee')}
                                        </h4>
                                        {candidature.decision && candidature.decision.trim() !== "" && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                                                <p className="text-sm text-gray-700">
                                                    <strong>{t('raisonRefus')}:</strong> {candidature.decision}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {candidature.stage?.title || t('titreNonDisponible')}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    <strong>{t('entreprise')}:</strong> {candidature.stage?.employeur?.company || 'N/A'}
                                                </p>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    <strong>{t('lieu')}:</strong> {candidature.stage?.location || 'N/A'}
                                                </p>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    <strong>{t('dateCandidature')}:</strong>{' '}
                                                    {candidature.datePostulation
                                                        ? new Date(candidature.datePostulation).toLocaleDateString('fr-FR')
                                                        : 'N/A'}
                                                </p>
                                                {candidature.status === 'ACCEPTEE' && candidature.dateDecision && (
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        <strong>{t('decisionPriseLe')}:</strong>{' '}
                                                        {new Date(candidature.dateDecision).toLocaleDateString('fr-FR')}
                                                    </p>
                                                )}
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

                                        {candidature.decision && candidature.decision.trim() !== "" && (
                                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                                <p className="text-sm text-gray-700">
                                                    <strong>{t('commentaire')}:</strong> {candidature.decision}
                                                </p>
                                            </div>
                                        )}

                                        {candidature.status === 'CONVOQUEE' && candidature.dateDecision && (
                                            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
                                                <p className="text-base font-semibold text-yellow-900">
                                                    <strong>{t('entrevuePrevueLe')}:</strong>{' '}
                                                    <span className="text-lg text-yellow-800">
                                                        {new Date(candidature.dateDecision).toLocaleDateString('fr-FR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {candidature.status === 'ACCEPTEE' && (
                                            <div className="mt-4 p-4 bg-green-50 border-l-4 border-teal-500 rounded-lg shadow-sm">
                                                <p className="text-sm text-gray-700 mb-3">
                                                    <strong>{t('felicitationsEmployeurSelectionne')}</strong> {t('offreOfficielleRecue')}
                                                </p>

                                                {!showingRefusalForm[candidature.id] ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleRespondToOffer(candidature.id, true)}
                                                            disabled={respondingTo === candidature.id}
                                                            className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                        >
                                                            {respondingTo === candidature.id ? t('envoi') : t('accepterOffre')}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowingRefusalForm(prev => ({ ...prev, [candidature.id]: true }))}
                                                            disabled={respondingTo === candidature.id}
                                                            className="flex-1 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                                        >
                                                            {t('refuserOffre')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                                            <p className="text-sm text-red-800 font-medium mb-2">
                                                                {t('surPointRefuserOffre')}
                                                            </p>
                                                            <p className="text-xs text-red-600">
                                                                {t('expliquerRaisonRefusOptionnel')}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                {t('raisonRefusOptionnel')}
                                                            </label>
                                                            <textarea
                                                                value={responseComments[candidature.id] || ""}
                                                                onChange={(e) => handleCommentChange(candidature.id, e.target.value)}
                                                                placeholder={t('exempleRaisonRefus')}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                                                rows="3"
                                                                disabled={respondingTo === candidature.id}
                                                            />
                                                        </div>
                                                        {errors[candidature.id] && (
                                                            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                                                                <p className="text-sm text-red-700">
                                                                    {errors[candidature.id]}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setShowingRefusalForm(prev => {
                                                                        const newState = { ...prev };
                                                                        delete newState[candidature.id];
                                                                        return newState;
                                                                    });
                                                                    setResponseComments(prev => {
                                                                        const newState = { ...prev };
                                                                        delete newState[candidature.id];
                                                                        return newState;
                                                                    });
                                                                }}
                                                                disabled={respondingTo === candidature.id}
                                                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                            >
                                                                {t('annuler')}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespondToOffer(candidature.id, false)}
                                                                disabled={respondingTo === candidature.id}
                                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                                            >
                                                                {respondingTo === candidature.id ? t('envoi') : t('confirmerRefus')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="mt-4 flex justify-end items-center">
                                    <button
                                        onClick={() => handleViewDetails(candidature)}
                                        className="text-teal-600 hover:text-teal-800 font-medium"
                                    >
                                        {t('voirDetails')} →
                                    </button>
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
                showManagementButtons={false}
                showPostulerButton={false}
            />

            {showEntenteModal && selectedCandidatureForEntente && (
                <EntenteSignatureModal
                    applicant={selectedCandidatureForEntente}
                    isOpen={showEntenteModal}
                    onClose={() => {
                        setShowEntenteModal(false);
                        setSelectedCandidatureForEntente(null);
                    }}
                    ententeData={ententeDataMap[selectedCandidatureForEntente.id]}
                    loadEntenteFn={checkEntenteExists}
                    onSign={async (ententeId, password) => {
                        try {
                            await signEntente(ententeId, password);
                            // Rafraîchir les données de l'entente après signature
                            const result = await checkEntenteExists(selectedCandidatureForEntente.id, user?.token);
                            if (result.exists) {
                                setEntenteDataMap(prev => ({
                                    ...prev,
                                    [selectedCandidatureForEntente.id]: result.data
                                }));
                            }
                        } catch (error) {
                            throw new Error(error.message || t('erreurLorsSignature'));
                        }
                    }}
                />
            )}
        </div>
    );
}
