import React, {useEffect, useMemo, useState} from "react";
import {NavLink, useParams} from "react-router-dom";
import ApplicantRow from "../display-components/ApplicantRow";
import {useAuth} from "../../context/AuthContext.jsx";
import {useI18n} from "../../context/I18nContext.jsx";
import {useYear} from "../../context/YearContext.jsx";
import {
    approveApplicant,
    getEmployeurStages,
    getStageApplicants,
    rejectApplicant
} from "../../services/EmployeurService.js";
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
    const {t} = useI18n();
    const {selectedYear} = useYear();

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
            setError(t('impossibleChargerCandidatures'));
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
            const list = await getEmployeurStages(email, token, selectedYear);
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
    }, [id, email, token, selectedYear]);

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t('candidaturesPourStage')} {stageTitle ? `"${stageTitle}"` : `#${id}`}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('nombreCandidatures', { count: filtered.length, plural: filtered.length > 1 ? 's' : '' })}
                </p>
            </div>

            <div className="w-full max-w-xl mb-8">
                <div className="relative">
                    <input
                        placeholder={t('rechercheNomEmail')}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        aria-label={t('recherche')}
                    />
                    <div
                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 text-base">
                        ⌕
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md overflow-hidden">
                {error && <ErrorBanner message={error}/>}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700 text-left border-b dark:border-gray-600">
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('candidat')}</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('cv')}</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('lettreMotivation')}</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('statut')}</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('entrevue')}</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status Entente</th>
                            <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">{t('action')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 dark:text-gray-400 text-center" colSpan={7}>
                                    {t('chargement')}
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="py-8 px-4 text-gray-500 dark:text-gray-400 text-center" colSpan={7}>
                                    {t('aucuneCandidatureTrouvee')}
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
                                    onStatusUpdate={(candidatureId, newStatus, dateDecision) => {
                                        setApplicants(prev => prev.map(a => {
                                            const id = a?.id ?? a?.candidatureId ?? a?.applicationId;
                                            if (Number(id) === Number(candidatureId)) {
                                                return {
                                                    ...a,
                                                    status: newStatus,
                                                    statut: newStatus,
                                                    dateDecision: dateDecision || a.dateDecision
                                                };
                                            }
                                            return a;
                                        }));
                                    }}
                                    onReject={async (a) => {
                                        const id = Number(a?.id ?? a?.candidatureId ?? a?.applicationId);
                                        if (!Number.isFinite(id)) return;
                                        if (!user?.token) { console.debug("reject: token absent (premier rendu)"); return; }
                                        try {
                                            const res = await rejectApplicant(id);
                                            if (res.ok) {
                                                await reloadApplicants();
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
                                            const res = await approveApplicant(id);
                                            if (res.ok) {
                                                await reloadApplicants();
                                            } else if (res.status === 403) {
                                                setError(t('doitConvoquerAvantAccepter'));
                                            } else {
                                                setError(t('erreurAcceptationCandidature'));
                                            }
                                        } catch (e) {
                                            console.debug("approve error:", e?.response?.status, e?.response?.data);
                                            if (e?.response?.status === 403) {
                                                setError(t('doitConvoquerAvantAccepter'));
                                            } else {
                                                setError(t('erreurAcceptationCandidature'));
                                            }
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
                    to="/employeur/stages/posted-stages"
                    className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    {t('retourAuxOffres')}
                </NavLink>
            </div>
        </div>
    );
};

export default StageApplicantsPage;
