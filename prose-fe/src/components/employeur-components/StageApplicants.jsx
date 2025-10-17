import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStageApplicants } from "../../services/EmployeurService.js";
import { getEmployeurStages } from "../../services/StageService.js";

const txt = (v) => (v == null ? "" : String(v));
const norm = (s) =>
    txt(s)
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();

function buildSearchFields(app) {
    const email =
        app?.email ??
        app?.etudiant?.email ??
        "";

    const fullName =
        app?.fullName ??
        app?.etudiant?.fullName ??
        [app?.firstName, app?.lastName].filter(Boolean).join(" ") ??
        [app?.etudiant?.firstName, app?.etudiant?.lastName].filter(Boolean).join(" ") ??
        "";

    const skills = Array.isArray(app?.skills)
        ? app.skills
        : Array.isArray(app?.competences)
            ? app.competences
            : [];

    return { email, fullName, skills };
}

const StageApplicantsPage = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stageTitle, setStageTitle] = useState(null);

    const safeEmail = useMemo(() => {
        const candidates = [
            user?.email,
            user?.username,
            user?.credentials?.username,
            user?.principal?.username,
        ];
        return (
            candidates.find(
                (v) => typeof v === "string" && v.trim().length > 0
            ) || null
        );
    }, [user]);

    const reload = async () => {
        try {
            setLoading(true);
            const data = await getStageApplicants(id, user.token);
            setApplicants(Array.isArray(data) ? data : []);
            setError(null);
        } catch (e) {
            console.debug("getStageApplicants error:", e);
            setError("Impossible de charger les candidatures.");
        } finally {
            setLoading(false);
        }
    };

    const loadStageTitle = async () => {
        try {
            if (!safeEmail) {
                setStageTitle(null);
                return;
            }
            const list = await getEmployeurStages(safeEmail, user?.token);
            const stages = Array.isArray(list)
                ? list
                : Array.isArray(list?.content)
                    ? list.content
                    : Array.isArray(list?.data)
                        ? list.data
                        : [];

            const target = stages.find(
                (s) => String(s?.id ?? "") === String(id ?? "")
            );

            setStageTitle(target?.title ?? target?.titre ?? target?.name ?? null);
        } catch (e) {
            console.debug("loadStageTitle/getEmployeurStages error", e);
            setStageTitle(null);
        }
    };

    useEffect(() => {
        reload();
        loadStageTitle();
    }, [id]);

    const filtered = useMemo(() => {
        const base = Array.isArray(applicants) ? applicants : [];
        const qn = norm(q);

        if (!qn) return base;

        return base.filter((app) => {
            const { email, fullName, skills } = buildSearchFields(app);
            const fields = [
                norm(fullName),
                norm(email),
                ...skills.map(norm),
            ];

            const matchesSearch = fields.some((f) => f.includes(qn));
            const status = (app?.status ?? app?.statut ?? "").toUpperCase();
            const matchesStatus = statusFilter === "ALL" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applicants, q, statusFilter]);

    return (
        <div className="p-4 md:p-6 flex flex-col items-center">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-2xl font-bold">
                    Candidature(s) pour le stage{" "}
                    {stageTitle ? `"${stageTitle}"` : `#${id}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
                </p>
            </div>

            <div className="w-full max-w-xl mb-8">
                <div className="relative">
                    <input
                        placeholder="Recherche (nom, email, compétence)"
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Recherche"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 text-base">
                        ⌕
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                {error && (
                    <div className="px-4 py-3 bg-rose-50 text-rose-700 text-sm border-b border-rose-200">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 text-left border-b">
                            <th className="py-3 px-4 font-medium text-gray-600">Candidat</th>
                            <th className="py-3 px-4 font-medium text-gray-600">
                                Cv de l'étudiant
                            </th>
                            <th className="py-3 px-4 font-medium text-gray-600">
                                Lettre de motivation
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 text-center" colSpan={4}>
                                    Chargement…
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 text-center" colSpan={4}>
                                    Aucune candidature trouvée.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((app) => (
                                <ApplicantRow key={app.id} applicant={app} />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bouton retour */}
            <div className="mt-6">
                <NavLink
                    to="/employeur/posted-stages"
                    className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Retour aux offres
                </NavLink>
            </div>
        </div>
    );
};

export default StageApplicantsPage;
