import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStageApplicantsManager } from "../../services/GestionnaireService.js";
import { getEmployeurStages } from "../../services/StageService.js";


const txt = (v) => (v == null ? "" : String(v));
const norm = (s) =>
    txt(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();


const unwrapArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};


export default function StageApplicantsGestionnaire() {
    const { id } = useParams();
    const { user } = useAuth();


    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const [stageTitle, setStageTitle] = useState("");


    const reload = async () => {
        try {
            setLoading(true);
            const token = user?.token;
            const res = await getStageApplicantsManager(id, token);
            setApplicants(unwrapArray(res));
            setError(null);
        } catch (e) {
            console.debug("getStageApplicantsManager error:", e);
            setError("Impossible de charger les candidatures.");
            setApplicants([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        reload();
        (async () => {
            try {
                const allStages = await getEmployeurStages(user?.token);
                const stage = unwrapArray(allStages).find((s) => String(s?.id) === String(id));
                if (stage?.title) setStageTitle(stage.title);
            } catch (_) {}
        })();
    }, [id]);


    const filtered = useMemo(() => {
        const nq = norm(q);
        return applicants.filter((a) => {
            const email = a?.email ?? a?.etudiant?.email ?? "";
            const fullName =
                a?.fullName ??
                [a?.firstName, a?.lastName].filter(Boolean).join(" ").trim() ??
                [a?.etudiant?.firstName, a?.etudiant?.lastName].filter(Boolean).join(" ").trim() ??
                "";


            const s = `${email} ${fullName}`.toLowerCase();
            const matchesQ = nq.length === 0 || s.includes(nq);
            const matchesStatus = statusFilter === "ALL" || (a?.status ?? "").toUpperCase() === statusFilter;
            return matchesQ && matchesStatus;
        });
    }, [applicants, q, statusFilter]);


    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Candidatures (Gestionnaire) du stage #{id}{stageTitle ? ` — ${stageTitle}` : ""}</h1>
                <NavLink to="/gestionnaire/stages" className="text-sm underline">← Retour aux stages</NavLink>
            </div>


            <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher par nom ou email…"
                    className="rounded-lg border bg-transparent p-2"
                />


                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border bg-transparent p-2"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="ACCEPTEE">Acceptée</option>
                    <option value="REJETEE">Rejetée</option>
                </select>


                <button onClick={reload} className="rounded-lg border p-2 hover:bg-black/5">Rafraîchir</button>
            </div>


            {error && (
                <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/15 p-3 text-rose-800">
                    {error}
                </div>
            )}


            {loading ? (
                <div className="mt-6 animate-pulse text-sm opacity-70">Chargement des candidatures…</div>
            ) : filtered.length === 0 ? (
                <div className="mt-6 text-sm opacity-80">Aucune candidature trouvée.</div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-black/5 text-left">
                        <tr>
                            <th className="p-3">Étudiant</th>
                            <th className="p-3">Courriel</th>
                            <th className="p-3">Statut</th>
                            <th className="p-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((app) => (
                            <ApplicantRow key={app?.id ?? `${app?.email}-${app?.fullName}`}
                                          applicant={app}
                                          role="gestionnaire"
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}