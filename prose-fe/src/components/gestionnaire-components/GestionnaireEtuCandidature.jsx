import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

// ───────────────────────────────────────────────────────────────────────────────
// MOCK DEMO (remplace ça par la réponse BE quand dispo)
// accepted === true  -> Approuvées (a trouvé un stage)
// applications.length === 0 -> 0 Postes
// sinon -> En attente
// ───────────────────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
    {
        id: 1,
        fullName: "Alice Bernard",
        email: "alice@school.com",
        accepted: false,
        applications: [
            { id: 101, title: "Développeur Java Backend", company: "TechnoPlus" },
            { id: 102, title: "QA Analyst", company: "QualiSoft" },
        ],
    },
    {
        id: 2,
        fullName: "Marc Lavoie",
        email: "marc@school.com",
        accepted: true,
        applications: [
            { id: 103, title: "Frontend React", company: "PixelWorks" },
        ],
    },
    {
        id: 3,
        fullName: "Sophie Tremblay",
        email: "sophie@school.com",
        accepted: false,
        applications: [],
    },
    {
        id: 4,
        fullName: "Nadia Roy",
        email: "nadia@school.com",
        accepted: false,
        applications: [
            { id: 104, title: "Data Analyst (SQL/Python)", company: "Datinov" },
        ],
    },
    {
        id: 5,
        fullName: "Yanis Gagnon",
        email: "yanis@school.com",
        accepted: true,
        applications: [
            { id: 105, title: "Sysadmin junior", company: "InfraX" },
            { id: 106, title: "DevOps Stagiaire", company: "CloudLine" },
        ],
    },
];

function ApplicationsModal({ student, onClose }) {
    if (!student) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
                <div className="px-5 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Candidatures de {student.fullName}
                    </h3>
                </div>
                <div className="p-5">
                    {student.applications?.length ? (
                        <ul className="space-y-3">
                            {student.applications.map((ap) => (
                                <li key={ap.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-800">{ap.title}</div>
                                        <div className="text-sm text-gray-500">{ap.company}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                        onClick={() => {}}
                                        title="Ouvrir la fiche du stage"
                                    >
                                        Voir le stage
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-600">
                            Aucune candidature pour cet étudiant.
                        </div>
                    )}
                </div>
                <div className="px-5 py-4 border-t flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:border-teal-600 hover:text-teal-700"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GestionnaireEtuCandidature() {
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");
    const [tab, setTab] = useState("ZERO"); // ZERO | APPLIED | APPROVED
    const [modalStudent, setModalStudent] = useState(null);

    // Charge les données (mock pour l’instant)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                // TODO: Remplacer par l'appel BE quand il existe, ex:

                const data = MOCK_STUDENTS;
                if (mounted) setStudents(data);
            } catch {
                setNote("Aucune donnée reçue. Affichage de données fictives.");
                if (mounted) setStudents(MOCK_STUDENTS);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [user?.token]);

    const partition = useMemo(() => {
        const zero = [], applied = [], approved = [];
        for (const s of students) {
            if (s.accepted) {
                approved.push(s);
            } else if (Array.isArray(s.applications) && s.applications.length > 0) {
                applied.push(s);
            } else {
                zero.push(s);
            }
        }
        return { zero, applied, approved };
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
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        Aucune Candidature
                    </button>

                    <button
                        onClick={() => setTab("APPLIED")}
                        className={`justify-self-center rounded-md px-4 py-2 text-sm font-medium border
              ${tab === "APPLIED"
                            ? "bg-white text-teal-700 border-teal-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        Candidature Soumise ({counts.APPLIED})
                    </button>

                    <button
                        onClick={() => setTab("APPROVED")}
                        className={`justify-self-end rounded-md px-4 py-2 text-sm font-medium border
              ${tab === "APPROVED"
                            ? "bg-white text-teal-700 border-teal-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-teal-600 hover:text-teal-700"
                        }`}
                    >
                        Stage Trouver ({counts.APPROVED})
                    </button>
                </div>

                {note && (
                    <div className="mt-4">
                        <ErrorBanner message={note} />
                    </div>
                )}

                {/* Tableau */}
                <div className="mt-8 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-10 text-center text-gray-700">Chargement…</div>
                    ) : list.length === 0 ? (
                        <div className="py-10 text-center text-gray-700">Aucun étudiant.</div>
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
                                        key={s.id}
                                        className={`${idx % 2 === 0 ? "bg-white" : "bg-teal-50"} hover:bg-teal-100 transition`}
                                    >
                                        <td className="py-3 px-4 align-top">
                                            <div className="font-medium text-gray-800">{s.fullName}</div>
                                        </td>
                                        <td className="py-3 px-4 align-top text-gray-700">
                                            {s.email}
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            {tab === "APPLIED" ? (
                                                <span className="text-gray-700">
                            {s.applications.length} candidature(s)
                          </span>
                                            ) : tab === "APPROVED" ? (
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-700">
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
                />
            )}
        </div>
    );
}
