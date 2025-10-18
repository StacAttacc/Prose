import React, {useEffect, useMemo, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import {useAuth} from "../../context/AuthContext.jsx";
// ⬇️ seule différence 1: on utilise le service gestionnaire
import {getStageApplicantsManager} from "../../services/GestionnaireService.js";
import {getEmployeurStages} from "../../services/StageService.js";

const txt = (v) => (v == null ? "" : String(v));
const norm = (s) =>
    txt(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const unwrapArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

export default function StageApplicantsGestionnaire() {
    const {id} = useParams();
    const {user} = useAuth();

    const [q, setQ] = useState("");
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stageTitle, setStageTitle] = useState("");

    const reload = async () => {
        try {
            setLoading(true);
            const token = user?.token;
            // ⬇️ on appelle l’API gestionnaire
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
        // récupérer le titre du stage (comme la version employeur)
        (async () => {
            try {
                const allStages = await getEmployeurStages(user?.token);
                const stage = unwrapArray(allStages).find(
                    (s) => String(s?.id) === String(id)
                );
                if (stage?.title) setStageTitle(stage.title);
            } catch (_) {
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const filtered = useMemo(() => {
        const nq = norm(q);
        return applicants.filter((a) => {
            const email = a?.email ?? a?.etudiant?.email ?? "";
            const fullName =
                a?.fullName ??
                [a?.firstName, a?.lastName].filter(Boolean).join(" ").trim() ??
                [a?.etudiant?.firstName, a?.etudiant?.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ??
                "";
            const s = `${email} ${fullName}`.toLowerCase();
            return nq.length === 0 || s.includes(nq);
        });
    }, [applicants, q]);

    return (
        <div className="mx-auto max-w-5xl p-4 md:p-6">
            <h1 className="text-center text-2xl font-bold">
                Candidature(s) pour le stage {stageTitle ? `"${stageTitle}"` : `#${id}`}
            </h1>
            <div className="mt-1 text-center text-sm opacity-80">
                {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
            </div>

            <div className="mx-auto mt-5 max-w-xl">
                <div className="relative">
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Recherche (nom, email)"
                        className="w-full rounded-lg border bg-transparent p-3 pr-9"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
            🔎
          </span>
                </div>
            </div>

            {error && (
                <div
                    className="mx-auto mt-4 max-w-xl rounded-lg border border-rose-600 bg-rose-900/15 p-3 text-rose-800">
                    {error}
                </div>
            )}

            <div className="mx-auto mt-5 overflow-x-auto rounded-lg border max-w-3xl">
                {loading ? (
                    <div className="p-4 text-sm opacity-70">Chargement…</div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-black/5 text-left">
                        <tr>
                            <th className="p-3">Candidat</th>
                            <th className="p-3">CV</th>
                            <th className="p-3">Lettre de motivation</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((app) => (
                            <ApplicantRow
                                key={app?.id ?? `${app?.email}-${app?.fullName}`}
                                applicant={app}
                                role="gestionnaire"
                            />
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-6 flex justify-center">
                <NavLink
                    to="/gestionnaire/list-stages"
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                    Retour aux offres
                </NavLink>
            </div>
        </div>
    );
}
