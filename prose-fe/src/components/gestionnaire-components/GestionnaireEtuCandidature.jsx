import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import ApplicantRow from "../display-components/ApplicantRow.jsx";
import { getStageApplicantsManager } from "../../services/GestionnaireService.js";

const MOCK_APPLICANTS = [
    {
        id: 1,
        fullName: "Alice Bernard",
        email: "alice@school.com",
        status: "EN_ATTENTE",
        motivationLetter: { data: "JVBERi0xLjQK", contentType: "application/pdf" },
    },
    {
        id: 2,
        fullName: "Marc Lavoie",
        email: "marc@school.com",
        status: "APPROUVEE",
        motivationLetter: { data: "JVBERi0xLjQK", contentType: "application/pdf" },
    },
    {
        id: 3,
        fullName: "Sophie Tremblay",
        email: "sophie@school.com",
        status: "REJETEE",
        motivationLetter: { data: "JVBERi0xLjQK", contentType: "application/pdf" },
    },
];

const statusLabel = (s) =>
    s === "EN_ATTENTE" ? "En attente" : s === "APPROUVEE" ? "Approuvée" : "Rejetée";

export default function GestionnaireEtuCandidature() {
    const { user } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                let data = [];
                try {
                    data = await getStageApplicantsManager(null, user?.token);
                } catch {
                    console.debug("Erreur ou endpoint absent → mock utilisé");
                    setNote("Le point d’accès backend n’est pas encore disponible. Affichage de données fictives.");
                    data = MOCK_APPLICANTS;
                }

                if (!Array.isArray(data) || data.length === 0) {
                    setNote("Aucune donnée reçue. Affichage de données fictives.");
                    data = MOCK_APPLICANTS;
                }

                if (mounted) setItems(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [user?.token]);

    const counts = useMemo(() => {
        const c = { ALL: items.length, EN_ATTENTE: 0, APPROUVEE: 0, REJETEE: 0 };
        for (const it of items) {
            const s = (it?.status || "").toUpperCase();
            if (c[s] !== undefined) c[s]++;
        }
        return c;
    }, [items]);

    const filtered = useMemo(() => {
        if (filter === "ALL") return items;
        return items.filter((i) => (i?.status || "").toUpperCase() === filter);
    }, [items, filter]);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 pt-6 pb-16">
                <h1 className="text-teal-700 text-2xl md:text-3xl font-semibold text-center">
                    Statut des candidatures
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-4 items-center">
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`justify-self-start rounded-md px-4 py-2 text-sm font-medium border
              ${
                            filter === "ALL"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                        title="Toutes les candidatures"
                    >
                        {counts.ALL ?? 0} Postes
                    </button>

                    <button
                        onClick={() => setFilter("EN_ATTENTE")}
                        className={`justify-self-center rounded-md px-4 py-2 text-sm font-medium border
              ${
                            filter === "EN_ATTENTE"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        En attente ({counts.EN_ATTENTE ?? 0})
                    </button>

                    <button
                        onClick={() => setFilter("APPROUVEE")}
                        className={`justify-self-end rounded-md px-4 py-2 text-sm font-medium border
              ${
                            filter === "APPROUVEE"
                                ? "bg-white text-teal-700 border-teal-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        Approuvées ({counts.APPROUVEE ?? 0})
                    </button>
                </div>

                {note && (
                    <div className="mt-4">
                        <ErrorBanner message={note} />
                    </div>
                )}

                <div className="mt-8 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-10 text-center text-gray-700">Chargement…</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-10 text-center text-gray-700">Aucun étudiant.</div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">Étudiant</th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">CV</th>
                                    <th className="text-left text-gray-800 font-semibold py-3 px-4">Lettre</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white">
                                {filtered.map((a) => (
                                    <ApplicantRow
                                        key={a.id}
                                        applicant={{
                                            id: a.id,
                                            email: a.email,
                                            fullName: a.fullName,
                                            firstName: a.firstName,
                                            lastName: a.lastName,
                                            status: a.status,
                                            motivationLetter: a.motivationLetter,
                                        }}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
