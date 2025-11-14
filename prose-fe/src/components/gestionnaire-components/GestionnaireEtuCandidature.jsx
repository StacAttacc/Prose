import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useYear } from "../../context/YearContext";
import { useI18n } from "../../context/I18nContext";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import { getStageApplicantsManager, checkEntenteExists, generateEntente, signEntente } from "../../services/GestionnaireService.js";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import ApplicationsModal from "../display-components/ApplicationsModal.jsx";
import EntenteSignatureModal from "../display-components/EntenteSignatureModal.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const CONFIRMED_STATUS = "CONFIRMER";

const APPROVED_STATUSES = new Set([
    "ACCEPTEE",
    "ACCEPTÉE",
    "ACCEPTEE_ETUDIANT",
    "CONFIRMER",
    "CONFIRMEE",
    "CONFIRMÉE",
]);

export default function GestionnaireEtuCandidature() {
    const { user } = useAuth();
    const { selectedYear } = useYear();
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");
    const [tab, setTab] = useState("APPLIED"); // ZERO | APPLIED | APPROVED
    const [modalStudent, setModalStudent] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [selectedCandidatureId, setSelectedCandidatureId] = useState(null);
    const [modalFilterStatuses, setModalFilterStatuses] = useState(null);
    const [ententeDataMap, setEntenteDataMap] = useState({}); // Map candidatureId -> ententeData
    const [checkingEntente, setCheckingEntente] = useState({}); // Map candidatureId -> boolean
    const [showEntenteModal, setShowEntenteModal] = useState(false);
    const [selectedCandidatureForEntente, setSelectedCandidatureForEntente] = useState(null);
    const [generatingEntente, setGeneratingEntente] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setNote(""); // Réinitialiser le message au début du chargement
                const data = await getStageApplicantsManager(user?.token, selectedYear);

                const arr = (Array.isArray(data) ? data : []).map((dto) => {
                    const stu = dto?.etudiant || {};
                    const candidatures = Array.isArray(dto?.candidatures)
                        ? dto.candidatures
                        : [];

                    const applications = candidatures.map((c, i) => {
                        const stg = c?.stage || {};
                        const emp = stg?.employeur || {};
                        const status = (c?.status ?? c?.statut ?? c?.candidatureStatus ?? "")
                            .toString()
                            .toUpperCase();

                        return {
                            id: c?.id ?? `${stu.id || "stu"}-${i}`,
                            title: stg?.title || "Stage",
                            company: emp?.company || emp?.nomEntreprise || "",
                            stageId: stg?.id ?? null,
                            stage: stg,
                            status,
                            datePostulation: c?.datePostulation ?? null,
                        };
                    });

                    const accepted = applications.some((a) =>
                        String(a.status).toUpperCase() === CONFIRMED_STATUS
                    );

                    return {
                        id: stu?.id ?? null,
                        fullName:
                            `${stu?.firstName || ""} ${stu?.lastName || ""}`.trim() ||
                            "(Nom manquant)",
                        email: stu?.email || "",
                        accepted,
                        applications,
                    };
                });

                if (mounted) {
                    setStudents(arr);
                    // Réinitialiser le message si des étudiants sont trouvés, sinon afficher le message
                    if (arr.length === 0) {
                        setNote(t('aucunEtudiantAnnee', { year: selectedYear }));
                    } else {
                        setNote(""); // Réinitialiser le message s'il y a des étudiants
                    }
                }
            } catch (e) {
                console.error("Erreur chargement candidatures:", e);
                if (mounted) setNote(t('erreurChargement'));
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [user?.token, selectedYear, t]);

    const partition = useMemo(() => {
        const zero = [],
            applied = [],
            approved = [];
        for (const s of students) {
            const hasApps = Array.isArray(s.applications) && s.applications.length > 0;
            if (s.accepted) approved.push(s);
            else if (hasApps) applied.push(s);
            else zero.push(s);
        }
        return { zero, applied, approved };
    }, [students]);

    const counts = {
        ZERO: partition.zero.length,
        APPLIED: partition.applied.length,
        APPROVED: partition.approved.length,
    };

    const list =
        tab === "ZERO"
            ? partition.zero
            : tab === "APPLIED"
                ? partition.applied
                : partition.approved;

    // Vérifier l'existence de l'entente pour les candidatures confirmées dans l'onglet APPROVED
    useEffect(() => {
        const checkEntentes = async () => {
            if (tab !== "APPROVED" || !user?.token) return;
            
            const confirmedCandidatures = [];
            for (const student of list) {
                const confirmedApp = (student.applications || []).find((a) =>
                    String(a.status).toUpperCase() === CONFIRMED_STATUS
                );
                if (confirmedApp?.id) {
                    confirmedCandidatures.push(confirmedApp);
                }
            }
            
            for (const candidature of confirmedCandidatures) {
                // Vérifier si on a déjà vérifié cette entente
                if (ententeDataMap[candidature.id] !== undefined || checkingEntente[candidature.id]) {
                    continue;
                }
                
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
        };

        if (list.length > 0 && user?.token && tab === "APPROVED") {
            checkEntentes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list, user?.token, tab]);

    useEffect(() => {
        if (loading || modalStudent) return;

        const raw =
            location?.state?.openEtudiantId ?? location?.state?.openStudentId;
        if (!raw) return;

        const id = String(raw);
        const student = (students || []).find((s) => String(s.id) === id);
        if (student) {
            if (tab !== "APPLIED") setTab("APPLIED");
            setModalStudent(student);
        }

        navigate(location.pathname, { replace: true, state: {} });
    }, [
        loading,
        students,
        modalStudent,
        tab,
        location?.state?.openEtudiantId,
        location?.state?.openStudentId,
        navigate,
        location.pathname,
    ]);

    const openStageModal = (application) => {
        setSelectedStage(application?.stage ?? null);
        setSelectedCandidatureId(
            Number(
                application?.id ?? application?.candidatureId ?? application?.applicationId
            ) || null
        );
        setIsStageModalOpen(true);
    };

    const closeStageModal = () => {
        setSelectedStage(null);
        setSelectedCandidatureId(null);
        setIsStageModalOpen(false);
    };

    const handleGenerateEntente = async (candidatureId) => {
        if (!user?.token) return;
        setGeneratingEntente(true);
        try {
            const entente = await generateEntente(candidatureId, user.token);
            const result = await checkEntenteExists(candidatureId, user.token);
            if (result.exists) {
                setEntenteDataMap(prev => ({
                    ...prev,
                    [candidatureId]: result.data
                }));
            }
        } catch (error) {
            console.error("Erreur lors de la génération de l'entente:", error);
            alert(error.response?.data?.message || t('erreurGenerationEntente'));
        } finally {
            setGeneratingEntente(false);
        }
    };

    const handleViewEntente = (candidatureId) => {
        setSelectedCandidatureForEntente({ id: candidatureId });
        setShowEntenteModal(true);
    };

    const handleDownloadEntente = (candidatureId) => {
        const ententeData = ententeDataMap[candidatureId];
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
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 pt-6 pb-16">
                <h1 className="text-teal-700 text-2xl md:text-3xl font-semibold text-center">
                    {t('statusCandidatures')}
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-4 items-center">
                    <button
                        onClick={() => setTab("ZERO")}
                        className={`justify-self-start rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "ZERO"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        {t('aucuneCandidature')} ({counts.ZERO})
                    </button>

                    <button
                        onClick={() => setTab("APPLIED")}
                        className={`justify-self-center rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "APPLIED"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        {t('candidatureSoumise')} ({counts.APPLIED})
                    </button>

                    <button
                        onClick={() => setTab("APPROVED")}
                        className={`justify-self-end rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "APPROVED"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        {t('stageTrouve')} ({counts.APPROVED})
                    </button>
                </div>

                {note && (
                    <div className="mt-4">
                        <ErrorBanner message={note} />
                    </div>
                )}

                <div className="mt-8 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-10 text-center text-gray-700">{t('chargement')}</div>
                    ) : list.length === 0 ? (
                        <div className="py-10 text-center text-gray-700">
                            {t('aucunEtudiantCategorie')}
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                        {t('etudiant')}
                                    </th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                        {t('email')}
                                    </th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                        {tab === "APPLIED" ? t('candidatures') : t('statut')}
                                    </th>

                                    {tab === "APPROVED" && (
                                        <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                            {t('details')}
                                        </th>
                                    )}

                                    {tab === "APPROVED" && (
                                        <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                            {t('statusEntente')}
                                        </th>
                                    )}

                                    {tab === "APPLIED" && (
                                        <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                            {t('action')}
                                        </th>
                                    )}
                                    {tab === "APPROVED" && (
                                        <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                            {t('action')}
                                        </th>
                                    )}
                                </tr>
                                </thead>

                                <tbody>
                                {list.map((s, idx) => (
                                    <tr
                                        key={s.id ?? s.email ?? idx}
                                        className={`${
                                            idx % 2 === 0 ? "bg-white" : "bg-teal-50"
                                        } hover:bg-teal-100 transition`}
                                    >
                                        <td className="py-3 px-4 align-top">
                                            <div className="font-medium text-gray-800">
                                                {s.fullName}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 align-top text-gray-700">
                                            {s.email}
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            {tab === "APPLIED" ? (
                                                <span className="text-gray-700">
                            {
                                (s.applications || []).filter(
                                    (a) =>
                                        !APPROVED_STATUSES.has(
                                            String(a?.status || "").toUpperCase()
                                        )
                                ).length
                            }{" "}
                                                    {t('candidatures')}
                          </span>
                                            ) : tab === "APPROVED" ? (
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-700">
                            {t('stageTrouve')}
                          </span>
                                            ) : (
                                                <span className="text-gray-500">
                            {t('aucuneCandidature')}
                          </span>
                                            )}
                                        </td>

                                        {tab === "APPROVED" && (
                                            <td className="py-3 px-4 align-top">
                                                {(() => {
                                                    const confirmedApp = (s.applications || []).find((a) =>
                                                        String(a.status).toUpperCase() === CONFIRMED_STATUS
                                                    ) || (s.applications || [])[0];
                                                    if (!confirmedApp) return null;
                                                    
                                                    return (
                                                        <button
                                                            type="button"
                                                            className="text-teal-700 hover:underline"
                                                            title={t('detailsEntente')}
                                                            onClick={() => {
                                                                if (confirmedApp) openStageModal(confirmedApp);
                                                            }}
                                                        >
                                                            {t('detailsEntente')}
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {tab === "APPROVED" && (
                                            <td className="py-3 px-4 align-top">
                                                {(() => {
                                                    const confirmedApp = (s.applications || []).find((a) =>
                                                        String(a.status).toUpperCase() === CONFIRMED_STATUS
                                                    ) || (s.applications || [])[0];
                                                    if (!confirmedApp?.id) return <span className="text-sm text-gray-400">—</span>;
                                                    
                                                    const candidatureId = confirmedApp.id;
                                                    const ententeData = ententeDataMap[candidatureId];
                                                    const isChecking = checkingEntente[candidatureId];
                                                    
                                                    if (isChecking) {
                                                        return <span className="text-sm text-gray-500 italic">{t('verification')}</span>;
                                                    }
                                                    
                                                    if (!ententeData) {
                                                        return <span className="text-sm text-gray-400">{t('ententeNonGeneree')}</span>;
                                                    }
                                                    
                                                    if (ententeData.status === "SIGNEE") {
                                                        return (
                                                            <span className="text-sm text-green-600 font-medium">
                                                                {t('ententeSigneeParToutesLesParties')}
                                                            </span>
                                                        );
                                                    }
                                                    
                                                    // Autres statuts
                                                    return <span className="text-sm text-gray-500">{t('enAttenteDeSignature')}</span>;
                                                })()}
                                            </td>
                                        )}

                                        {tab === "APPLIED" && (
                                            <td className="py-3 px-4 align-top">
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:underline"
                                                    title={t('voirCandidatures')}
                                                    onClick={() => {
                                                        setModalFilterStatuses(null);
                                                        setModalStudent(s);
                                                    }}
                                                >
                                                    {t('voirCandidatures')}
                                                </button>
                                            </td>
                                        )}

                                        {tab === "APPROVED" && (
                                            <td className="py-3 px-4 align-top">
                                                {(() => {
                                                    const confirmedApp = (s.applications || []).find((a) =>
                                                        String(a.status).toUpperCase() === CONFIRMED_STATUS
                                                    ) || (s.applications || [])[0];
                                                    if (!confirmedApp?.id) return null;
                                                    
                                                    const candidatureId = confirmedApp.id;
                                                    const ententeData = ententeDataMap[candidatureId];
                                                    const isChecking = checkingEntente[candidatureId];
                                                    
                                                    if (isChecking) {
                                                        return (
                                                            <span className="text-sm text-gray-500 italic">
                                                                {t('verification')}
                                                            </span>
                                                        );
                                                    }
                                                    
                                                    if (!ententeData) {
                                                        // Pas d'entente, afficher "Générer entente"
                                                        return (
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br transition-all disabled:opacity-50"
                                                                onClick={() => handleGenerateEntente(candidatureId)}
                                                                disabled={generatingEntente}
                                                            >
                                                                {generatingEntente ? t('generation') : t('genererEntente')}
                                                            </button>
                                                        );
                                                    }
                                                    
                                                    // Vérifier le statut de l'entente
                                                    const ententeStatus = ententeData.status;
                                                    
                                                    if (ententeStatus === "SIGNEE") {
                                                        // Toutes les parties ont signé
                                                        return (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br transition-all"
                                                                    onClick={() => handleViewEntente(candidatureId)}
                                                                >
                                                                    {t('voirEntenteStage')}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br transition-all"
                                                                    onClick={() => handleDownloadEntente(candidatureId)}
                                                                >
                                                                    {t('telechargerEntenteStage')}
                                                                </button>
                                                            </div>
                                                        );
                                                    } else if (ententeStatus === "SIGNEE_ETUDIANT_ET_EMPLOYEUR") {
                                                        // Les deux ont signé, mais pas le gestionnaire
                                                        return (
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br transition-all"
                                                                onClick={() => handleViewEntente(candidatureId)}
                                                            >
                                                                {t('voirEtSignerEntenteStage')}
                                                            </button>
                                                        );
                                                    } else {
                                                        // Entente existe mais pas complètement signée, afficher "Voir l'entente de stage"
                                                        return (
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 rounded-md font-medium text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br transition-all"
                                                                onClick={() => handleViewEntente(candidatureId)}
                                                            >
                                                                {t('voirEntenteStage')}
                                                            </button>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modalStudent && (
                <ApplicationsModal
                    student={modalStudent}
                    filterStatuses={modalFilterStatuses}
                    onClose={() => {
                        setModalStudent(null);
                        setModalFilterStatuses(null);
                    }}
                    onSeeStage={(ap) => openStageModal(ap)}
                />
            )}

            <StageDetailsModal
                stage={selectedStage}
                isOpen={isStageModalOpen}
                onClose={closeStageModal}
                // tu peux laisser false si tu ne veux pas afficher Approuver/Rejeter ici
                showManagementButtons={false}
                showPostulerButton={false}
                candidatureId={selectedCandidatureId}
                // bouton “Générer entente” seulement dans “Stage Trouvé”
                allowGenerateEntente={tab === "APPROVED"}
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
                    loadEntenteFn={async (candidatureId, token) => {
                        const result = await checkEntenteExists(candidatureId, token);
                        return result.exists ? { exists: true, data: result.data } : { exists: false };
                    }}
                    onSign={async (ententeId, password) => {
                        try {
                            await signEntente(ententeId, password, user?.token);
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
