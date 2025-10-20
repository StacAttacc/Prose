import React, {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import {getStageApplicantsManager} from "../../services/GestionnaireService.js";
import StageDetailsModal from "../display-components/StageDetailsModal.jsx";
import ApplicationsModal from "../display-components/ApplicationsModal.jsx";

const ACCEPTED_STATUSES = ["APPROUVEE"];

export default function GestionnaireEtuCandidature() {
    const {user} = useAuth();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");
    const [tab, setTab] = useState("ZERO"); // ZERO | APPLIED | APPROVED
    const [modalStudent, setModalStudent] = useState(null);

    const [selectedStage, setSelectedStage] = useState(null);
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const openStageModal = (stage) => {
        setSelectedStage(stage);
        setIsStageModalOpen(true);
    };
    const closeStageModal = () => {
        setSelectedStage(null);
        setIsStageModalOpen(false);
    };

    const normalizeApplication = (c, stuId, idx) => ({
        id: c?.id ?? c?.candidatureId ?? `${stuId || "stu"}-${idx}`,
        title: c?.stage?.title ?? "Stage",
        company:
            c?.stage?.employeur?.company ??
            c?.stage?.employeur?.nomEntreprise ??
            "",
        stageId: c?.stage?.id ?? null,
        stage: c?.stage ?? null,
        status: (c?.status || "").toUpperCase(),
        decision: (c?.decision || "").toUpperCase(),
        datePostulation: c?.datePostulation ?? null,
    });

    const normalizeStudent = (dto) => {
        const stu = dto?.etudiant || {};
        const fullName = `${stu.firstName ?? ""} ${stu.lastName ?? ""}`.trim();
        const rawCands = Array.isArray(dto?.candidatures) ? dto.candidatures : [];
        const apps = rawCands.map((c, i) => normalizeApplication(c, stu.id, i));

        const hasAccepted = apps.some(
            (a) => ACCEPTED_STATUSES.includes(a.status) || ACCEPTED_STATUSES.includes(a.decision)
        );

        return {
            id: stu.id ?? null,
            fullName: fullName || "(Nom manquant)",
            email: stu.email ?? "",
            accepted: hasAccepted,
            applications: apps,
        };
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getStageApplicantsManager(user?.token);
                const arr = Array.isArray(data) ? data.map(normalizeStudent) : [];
                if (mounted) setStudents(arr);
                if (!arr.length) setNote("Aucune donnée reçue du serveur.");
            } catch (e) {
                console.error("Erreur chargement candidatures:", e);
                if (mounted) setNote("Erreur lors du chargement des candidatures.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [user?.token]);

    const partition = useMemo(() => {
        const zero = [], applied = [], approved = [];
        for (const s of students) {
            const hasApps = Array.isArray(s.applications) && s.applications.length > 0;
            if (s.accepted) approved.push(s);
            else if (hasApps) applied.push(s);
            else zero.push(s);
        }
        return {zero, applied, approved};
    }, [students]);

    const counts = {
        ZERO: partition.zero.length,
        APPLIED: partition.applied.length,
        APPROVED: partition.approved.length,
    };

    const list = tab === "ZERO" ? partition.zero : tab === "APPLIED" ? partition.applied : partition.approved;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 pt-6 pb-16">
                <h1 className="text-teal-700 text-2xl md:text-3xl font-semibold text-center">
                    Statut des candidatures
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-4 items-center">
                    <button
                        onClick={() => setTab("ZERO")}
                        className={`justify-self-start rounded-md px-4 py-2 text-sm font-medium border
              ${tab === "ZERO"
                            ? "bg-white text-teal-700 border-teal-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"}`}>
                        Aucune Candidature ({counts.ZERO})
                    </button>

                    <button
                        onClick={() => setTab("APPLIED")}
                        className={`justify-self-center rounded-md px-4 py-2 text-sm font-medium border
              ${tab === "APPLIED"
                            ? "bg-white text-teal-700 border-teal-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"}`}>
                        Candidature Soumise ({counts.APPLIED})
                    </button>

                    <button
                        onClick={() => setTab("APPROVED")}
                        className={`justify-self-end rounded-md px-4 py-2 text-sm font-medium border
              ${tab === "APPROVED"
                            ? "bg-white text-teal-700 border-teal-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"}`}>
                        Stage Trouvé ({counts.APPROVED})
                    </button>
                </div>

                {note && (<div className="mt-4"><ErrorBanner message={note}/></div>)}

                {/* Tableau */}
                <div className="mt-8 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-10 text-center text-gray-700">Chargement…</div>
                    ) : list.length === 0 ? (
                        <div className="py-10 text-center text-gray-700">Aucun étudiant dans cette catégorie.</div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">Étudiant</th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">Email</th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">
                                        {tab === "APPLIED" ? "Candidatures" : "Statut"}
                                    </th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {list.map((s, idx) => (
                                    <tr
                                        key={s.id ?? s.email ?? idx}
                                        className={`${idx % 2 === 0 ? "bg-white" : "bg-teal-50"} hover:bg-teal-100 transition`}
                                    >
                                        <td className="py-3 px-4 align-top">
                                            <div className="font-medium text-gray-800">{s.fullName}</div>
                                        </td>
                                        <td className="py-3 px-4 align-top text-gray-700">{s.email}</td>
                                        <td className="py-3 px-4 align-top">
                                            {tab === "APPLIED" ? (
                                                <span
                                                    className="text-gray-700">{s.applications.length} candidature(s)</span>
                                            ) : tab === "APPROVED" ? (
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-700">
                            Stage trouvé
                          </span>
                                            ) : (
                                                <span className="text-gray-500">Aucune candidature</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            {tab === "APPLIED" ? (
                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:underline"
                                                    title="Voir les stages postulés"
                                                    onClick={() => setModalStudent(s)}
                                                >
                                                    Voir ses candidatures
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
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
                    onClose={() => setModalStudent(null)}
                    onSeeStage={(ap) => openStageModal(ap.stage)}
                />
            )}

            <StageDetailsModal
                stage={selectedStage}
                isOpen={isStageModalOpen}
                onClose={closeStageModal}
                showManagementButtons={false}
                showPostulerButton={false}
            />
        </div>
    );
}
