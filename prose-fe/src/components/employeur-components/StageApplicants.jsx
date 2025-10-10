import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import { useAuth } from "../../context/AuthContext.jsx";

const StageApplicantsPage = ({ updateApplicantStatus, fetchApplicants }) => {
    const { id } = useParams();
    const { user } = useAuth();

    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleAccept = async (applicant) => {
        try {
            await updateApplicantStatus(id, applicant.id, "ACCEPTEE", user.token);
            await reload();
        } catch {
            setError("Échec de la mise à jour du statut.");
        }
    };

    const handleReject = async (applicant, reason) => {
        try {
            await updateApplicantStatus(id, applicant.id, "REJETEE", user.token, reason);
            await reload();
        } catch {
            setError("Échec de la mise à jour du statut.");
        }
    };

    const reload = async () => {
        try {
            setLoading(true);
            const data = await fetchApplicants(id, user.token);
            setApplicants(data || []);
            setError(null);
        } catch {
            setError("Impossible de charger les candidatures.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { reload(); }, [id]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return (applicants || []).filter((app) => {
            const matchesQuery =
                !query ||
                app.nom?.toLowerCase().includes(query) ||
                app.email?.toLowerCase().includes(query) ||
                app.competences?.some((c) => c.toLowerCase().includes(query));

            const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [applicants, q, statusFilter]);

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Candidatures du stage #{id}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-7 md:grid-cols-[2fr_1fr_1fr] max-w-5xl">
                <div className="relative md:col-span-2">
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

                <select
                    className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filtre par statut"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="ACCEPTEE">Acceptée</option>
                    <option value="REJETEE">Rejetée</option>
                </select>
            </div>


            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
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
                            <th className="py-3 px-4 font-medium text-gray-600">Présentation & Compétences</th>
                            <th className="py-3 px-4 font-medium text-gray-600">CV</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500" colSpan={4}>
                                    Chargement…
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500" colSpan={4}>
                                    Aucune candidature trouvée.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((app) => (
                                <ApplicantRow
                                    key={app.id}
                                    applicant={app}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4" />

            <NavLink
                to="/employeur/posted-stages"
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
            >
                Retour aux offres
            </NavLink>
        </div>
    );
};

export default StageApplicantsPage;
