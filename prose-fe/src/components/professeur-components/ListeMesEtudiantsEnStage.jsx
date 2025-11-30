import React, {useState, useEffect, useMemo} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext';
import { useYear } from '../../context/YearContext';
import {getEtudiantsProfesseur} from '../../services/ProfesseurService';
import { useAuth } from '../../context/AuthContext';
import ErrorBanner from '../display-components/ErrorBanner';
import {checkEntenteExists} from "../../services/EtudiantService.js";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";

const CONFIRMED_STATUS = "CONFIRMER";

const APPROVED_STATUSES = new Set([
    "ACCEPTEE",
    "ACCEPTÉE",
    "ACCEPTEE_ETUDIANT",
    "CONFIRMER",
    "CONFIRMEE",
    "CONFIRMÉE",
]);

export default function ListeMesEtudiantsEnStage() {

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
    const [ententeDataMap, setEntenteDataMap] = useState({});
    const [checkingEntente, setCheckingEntente] = useState({});

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setNote("");
                const data = await getEtudiantsProfesseur(user.id, selectedYear);

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
                        professeur: stu?.professeur || dto?.professeur || null,
                    };
                });

                if (mounted) {
                    setStudents(arr);
                    if (arr.length === 0) {
                        setNote(t('aucunEtudiantAnnee', { year: selectedYear }));
                    } else {
                        setNote("");
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

    useEffect(() => {
        if (loading) return;

        const openCandidatureId = location?.state?.openCandidatureId;

        if (openCandidatureId) {
            const match = students.find((s) =>
                (s.applications || []).some(
                    (a) => String(a.id) === String(openCandidatureId)
                )
            );
            if (match && user?.token) {
                (async () => {
                    try {
                        const result = await checkEntenteExists(openCandidatureId, user.token);

                        if (result.exists) {
                            setEntenteDataMap(prev => ({
                                ...prev,
                                [openCandidatureId]: result.data
                            }));
                        }
                    } catch (error) {
                        console.error("Erreur lors du chargement de l'entente:", error);
                    }
                })();
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loading, location.pathname, location?.state?.openCandidatureId, navigate, students, user.token]);

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

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-5xl px-4 pt-6 pb-16">
                <h1 className="text-teal-700 dark:text-teal-400 text-2xl md:text-3xl font-semibold text-center">
                    {t('statusCandidatures')}
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-4 items-center">
                    <button
                        onClick={() => setTab("ZERO")}
                        className={`justify-self-start rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "ZERO"
                                ? "bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-400 border-teal-600 dark:border-teal-500"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400"
                        }`}
                    >
                        {t('aucuneCandidature')} ({counts.ZERO})
                    </button>

                    <button
                        onClick={() => setTab("APPLIED")}
                        className={`justify-self-center rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "APPLIED"
                                ? "bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-400 border-teal-600 dark:border-teal-500"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400"
                        }`}
                    >
                        {t('candidatureSoumise')} ({counts.APPLIED})
                    </button>

                    <button
                        onClick={() => setTab("APPROVED")}
                        className={`justify-self-end rounded-md px-4 py-2 text-sm font-medium border
              ${
                            tab === "APPROVED"
                                ? "bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-400 border-teal-600 dark:border-teal-500"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400"
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

                <div className="mt-8 rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-10 text-center text-gray-700 dark:text-gray-300">{t('chargement')}</div>
                    ) : list.length === 0 ? (
                        <div className="py-10 text-center text-gray-700 dark:text-gray-300">
                            {t('aucunEtudiantCategorie')}
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                            {t('etudiant')}
                                        </th>
                                        <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                            {t('email')}
                                        </th>
                                        <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                            {tab === "APPLIED" ? t('candidatures') : t('statut')}
                                        </th>

                                        {tab === "APPROVED" && (
                                            <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                                {t('details')}
                                            </th>
                                        )}

                                        {tab === "APPROVED" && (
                                            <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                                {t('statusEntente')}
                                            </th>
                                        )}

                                        {tab === "APPLIED" && (
                                            <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
                                                {t('action')}
                                            </th>
                                        )}

                                        {tab === "APPROVED" && (
                                            <th className="text-left text-gray-800 dark:text-gray-200 font-semibold py-3 px-4">
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
                                                idx % 2 === 0
                                                    ? "bg-white dark:bg-gray-800"
                                                    : "bg-teal-50 dark:bg-teal-900/20"
                                            } hover:bg-teal-100 dark:hover:bg-teal-900/30 transition`}
                                        >
                                            <td className="py-3 px-4 align-top">
                                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                                    {s.fullName}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                                                {s.email}
                                            </td>

                                            <td className="py-3 px-4 align-top">
                                                {tab === "APPLIED" ? (
                                                    <span className="text-gray-700 dark:text-gray-300">
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
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                                                    {t('stageTrouve')}
                                                </span>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                    {t('aucuneCandidature')}
                                                </span>
                                                )}
                                            </td>

                                            {tab === "APPROVED" && (
                                                <td className="py-3 px-4 align-top">
                                                    {(() => {
                                                        const confirmed = (s.applications || []).find(
                                                            (a) =>
                                                                String(a.status).toUpperCase() ===
                                                                CONFIRMED_STATUS
                                                        );
                                                        if (!confirmed) return null;

                                                        return (
                                                            <button
                                                                type="button"
                                                                className="text-teal-700 dark:text-teal-400 hover:underline"
                                                                onClick={() => openStageModal(confirmed)}
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
                                                        const confirmed = (s.applications || []).find(
                                                            (a) =>
                                                                String(a.status).toUpperCase() ===
                                                                CONFIRMED_STATUS
                                                        );
                                                        if (!confirmed?.id)
                                                            return (
                                                                <span className="text-sm text-gray-400 dark:text-gray-500">
                                                                —
                                                            </span>
                                                            );

                                                        const entente = ententeDataMap[confirmed.id];
                                                        const checking = checkingEntente[confirmed.id];

                                                        if (checking)
                                                            return (
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                                {t('verification')}
                                                            </span>
                                                            );

                                                        if (!entente)
                                                            return (
                                                                <span className="text-sm text-gray-400 dark:text-gray-500">
                                                                {t('ententeNonGeneree')}
                                                            </span>
                                                            );

                                                        if (entente.status === "SIGNEE")
                                                            return (
                                                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                                {t('ententeSigneeParToutesLesParties')}
                                                            </span>
                                                            );

                                                        return (
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                            {t('enAttenteDeSignature')}
                                                        </span>
                                                        );
                                                    })()}
                                                </td>
                                            )}

                                            {tab === "APPLIED" && (
                                                <td className="py-3 px-4 align-top">
                                                    <button
                                                        type="button"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline"
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
                                                <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                                    {t('aucuneActionDisponible') || "Aucune Action Disponible"}
                                                </span>
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
                showManagementButtons={false}
                showPostulerButton={false}
                candidatureId={selectedCandidatureId}
                allowGenerateEntente={false}
            />
        </div>
    );
}

