import React, {useEffect, useMemo, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import {useAuth} from "../../context/AuthContext.jsx";
import {approveApplicant, getStageApplicants, rejectApplicant} from "../../services/EmployeurService.js";
import {getEmployeurStages} from "../../services/StageService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

const txt = (v) => (v == null ? "" : String(v));
const norm = (s) =>
    txt(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const unwrapArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

function buildSearchFields(app) {
    const email =
        app?.email ??
        app?.etudiant?.email ??
        app?.contactEmail ??
        "";

    const nameCandidates = [
        app?.fullName,
        [app?.firstName, app?.lastName].filter(Boolean).join(" ").trim(),
        app?.etudiant?.fullName,
        [app?.etudiant?.firstName, app?.etudiant?.lastName].filter(Boolean).join(" ").trim(),
        app?.name,
        app?.etudiant?.name,
    ]
        .map((s) => (s == null ? "" : String(s).trim()))
        .filter((s) => s.length > 0);

    const fullName = nameCandidates[0] || "";

    return {email, fullName};
}


const StageApplicantsPage = () => {
    const {id} = useParams();
    const {user} = useAuth();
    const ready = Boolean(user?.token);

    const [q, setQ] = useState("");
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stageTitle, setStageTitle] = useState(null);

    const email = user?.email || null;
    const token = user?.token || null;

    const reloadApplicants = async () => {
        try {
            setLoading(true);
            const list = await getStageApplicants(id);
            setApplicants(Array.isArray(list) ? list : []);
            setError(null);
        } catch (e) {
            console.debug("getStageApplicants error:", e);
            setError("Impossible de charger les candidatures.");
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStageTitle = async () => {
        try {
            if (!email) {
                setStageTitle(null);
                return;
            }
            const list = await getEmployeurStages(email, token);
            const stages = unwrapArray(list);
            const target = stages.find((s) => String(s?.id ?? "") === String(id ?? ""));
            setStageTitle(target?.title ?? null);
        } catch (e) {
            console.debug("getEmployeurStages error:", e);
            setStageTitle(null);
        }
    };

    useEffect(() => {
        reloadApplicants();
        loadStageTitle();
    }, [id, email, token]);

    const filtered = useMemo(() => {
        const qn = norm(q);
        if (!qn) return applicants;

        return applicants.filter((app) => {
            const {email, fullName} = buildSearchFields(app);
            return norm(fullName).includes(qn) || norm(email).includes(qn);
        });
    }, [applicants, q]);

    return (
        <div className="p-4 md:p-6 flex flex-col items-center">
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="text-2xl font-bold">
                    Candidature(s) pour le stage {stageTitle ? `"${stageTitle}"` : `#${id}`}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
                </p>
            </div>

            <div className="w-full max-w-xl mb-8">
                <div className="relative">
                    <input
                        placeholder="Recherche (nom, email)"
                        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label="Recherche"
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 text-base">
                        ⌕
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                {error && <ErrorBanner message={error}/>}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 text-left border-b">
                            <th className="py-3 px-4 font-medium text-gray-600">Candidat</th>
                            <th className="py-3 px-4 font-medium text-gray-600">CV</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Lettre de motivation</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Statut</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 text-center" colSpan={5}>
                                    Chargement…
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 text-center" colSpan={5}>
                                    Aucune candidature trouvée.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((app) => (
                                <ApplicantRow
                                    key={
                                        app.id ??
                                        app.candidatureId ??
                                        app.applicationId ??
                                        app.etudiant?.id ??
                                        app.email
                                    }
                                    applicant={app}
                                    showActions
                                    onReject={async (a) => {
                                        const id = Number(a?.id ?? a?.candidatureId ?? a?.applicationId);
                                        if (!Number.isFinite(id)) return;
                                        if (!user?.token) { console.debug("reject: token absent (premier rendu)"); return; }
                                        try {
                                            const res = await rejectApplicant(id, user?.token);
                                            if (res.ok) {
                                                setApplicants(prev => prev.filter(x =>
                                                    Number(x?.id ?? x?.candidatureId ?? x?.applicationId) !== id
                                                ));
                                            } else {
                                                console.debug("reject:", res.status, res.data);
                                            }
                                        } catch (e) {
                                            console.debug("reject error:", e?.response?.status, e?.response?.data);
                                        }
                                    }}


                                    onApprove={async (a) => {
                                        const id = Number(a?.id ?? a?.candidatureId ?? a?.applicationId);
                                        if (!Number.isFinite(id)) return;
                                        try {
                                            await approveApplicant(id, user?.token);  // <-- même pattern
                                            setApplicants(prev =>
                                                prev.filter(x => Number(x?.id ?? x?.candidatureId ?? x?.applicationId) !== id)
                                            );
                                        } catch (e) {
                                            console.debug("approve error:", e?.response?.status, e?.response?.data);
                                        }
                                    }}
                                />
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

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
