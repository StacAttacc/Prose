import React, { useMemo } from "react";

const STATUS = {
    SOUMISE: "SOUMISE",
    ACCEPTEE: "ACCEPTEE",
    CONVOQUEE: "CONVOQUEE",
    REFUSEE: "REFUSEE",
};

const U = (s) => (s == null ? "" : String(s).trim().toUpperCase());

const badgeClass = (st) => {
    switch (st) {
        case STATUS.ACCEPTEE: return "border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
        case STATUS.REFUSEE: return "border-rose-600 dark:border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300";
        case STATUS.CONVOQUEE: return "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
        case STATUS.SOUMISE:
        default: return "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
};

const labelOf = (st) => {
    switch (st) {
        case STATUS.ACCEPTEE: return "En attente de réponse de l'étudiant";
        case STATUS.REFUSEE: return "Refusée";
        case STATUS.CONVOQUEE: return "Convoquée";
        case STATUS.SOUMISE: return "Soumise";
        default: return st || "—";
    }
};

export default function ApplicationsModal({
    student,
    onClose,
    onSeeStage,
    filterStatuses = null,
}) {
    const fullName =
        [student?.fullName].filter(Boolean).join(" ").trim() ||
        [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() ||
        student?.email || "Étudiant";

    const filterSet = useMemo(() => {
        if (!Array.isArray(filterStatuses) || filterStatuses.length === 0) return null;
        const s = new Set(
            filterStatuses
                .map(U)
                .filter((k) => Object.prototype.hasOwnProperty.call(STATUS, k))
        );
        return s.size ? s : null;
    }, [filterStatuses]);

    const rows = useMemo(() => {
        const apps = Array.isArray(student?.applications) ? student.applications : [];
        const base = !filterSet
            ? apps
            : apps.filter((a) => {
                const k = U(a?.status ?? a?.statut ?? a?.candidatureStatus);
                return filterSet.has(k);
            });

        return base.filter(
            (a) => U(a?.status ?? a?.statut ?? a?.candidatureStatus) !== "ACCEPTEE_ETUDIANT"
        );
    }, [student?.applications, filterSet]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
                <div className="border-b dark:border-gray-700 px-5 py-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100">
                        Candidatures de {fullName}
                    </h2>
                    {filterSet && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                            Filtre: {[...filterSet].join(" / ")}
                        </p>
                    )}
                </div>

                <div className="px-5 py-4">
                    {rows.length === 0 ? (
                        <div className="text-center text-slate-600 dark:text-gray-400 py-8">
                            Aucune candidature à afficher.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {/* conteneur scrollable vertical dans la modale */}
                            <div className="max-h-[420px] md:max-h-[60vh] overflow-y-auto rounded-md pr-2">
                                <table className="min-w-full border-separate border-spacing-0">
                                    <thead className="bg-slate-50 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr className="text-left text-sm font-semibold text-slate-700 dark:text-gray-200">
                                            <th className="px-3 py-2 bg-slate-50 dark:bg-gray-700">Stage</th>
                                            <th className="px-3 py-2 bg-slate-50 dark:bg-gray-700">Entreprise</th>
                                            <th className="px-3 py-2 bg-slate-50 dark:bg-gray-700">Statut</th>
                                            <th className="px-3 py-2 bg-slate-50 dark:bg-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((ap, i) => {
                                            const stage = ap?.stage || {};
                                            const emp = stage?.employeur || {};
                                            const title = stage?.title || ap?.title || "Stage";
                                            const company = emp?.company || emp?.nomEntreprise || ap?.company || "—";
                                            const st = U(ap?.status ?? ap?.statut ?? ap?.candidatureStatus);

                                            return (
                                                <tr key={ap.id ?? i} className={i % 2 ? "bg-white dark:bg-gray-800" : "bg-slate-50 dark:bg-gray-700"}>
                                                    <td className="px-3 py-2 align-top">
                                                        <div className="font-medium text-slate-900 dark:text-gray-100">{title}</div>
                                                    </td>
                                                    <td className="px-3 py-2 align-top text-slate-700 dark:text-gray-300">{company}</td>
                                                    <td className={`px-3 py-2 align-top ${st === STATUS.ACCEPTEE ? "text-center" : ""}`}>
                                                        {st === STATUS.ACCEPTEE ? (
                                                            <div className="flex justify-center">
                                                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass(st)}`}>
                                                                    {labelOf(st)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass(st)}`}>
                                                                {labelOf(st)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 align-top">
                                                        <button
                                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                                            onClick={() => onSeeStage && onSeeStage(ap)}
                                                            type="button"
                                                        >
                                                            Voir le stage
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>


                <div className="border-t dark:border-gray-700 px-5 py-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
