import {logout} from "../services/UtilisateurService.js";
import {useNavigate} from "react-router-dom";
import {Outlet} from "react-router";
import {useAuth} from "../context/AuthContext.jsx";
import {useCv} from "../context/CvContext.jsx";
import Notifications from "../components/notification-components/Notifications.jsx";
import {useYear} from "../context/YearContext.jsx";
import {useI18n} from "../context/I18nContext.jsx";
import ErrorBoundary from "../components/common/ErrorBoundary.jsx";
import {ThemeToggle} from "../components/common/ThemeToggle.jsx";
import ScrollToTop from "../components/common/ScrollToTop.jsx";

export default function Dashboard() {
    const { user } = useAuth();
    const { hasCV } = useCv();
    const nav = useNavigate();
    const { selectedYear, setSelectedYear } = useYear();
    const { t, locale, setLocale } = useI18n();

    async function userLogout() {
        await logout();
        nav('/login');
    }

    return (
        <>
            <header className="p-2">
                <nav className="relative bg-teal-700/95 rounded-xl shadow-black shadow-sm">
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <button className="relative flex rounded-full">
                                        <img
                                            src="/glaucon.png"
                                            alt="Glaucon"
                                            className="size-11 rounded-full outline -outline-offset-1 outline-white/10 h-19 w-10"/>
                                    </button>
                                    <p className="text-white pl-4 text-2xl">Prose</p>
                                    <div className="flex items-center gap-4 mx-6">
                                        <div className="flex items-center gap-2 bg-teal-600/50 px-3 py-2 rounded-lg border border-white/20">
                                            <label className="text-white text-sm font-medium whitespace-nowrap">{t('language')}:</label>
                                            <select
                                                value={locale}
                                                onChange={(e) => setLocale(e.target.value)}
                                                className="px-3 py-2 border border-white/30 rounded-md bg-teal-700 text-white focus:ring-2 focus:ring-white focus:border-white text-sm font-medium cursor-pointer hover:bg-teal-600 transition-colors"
                                            >
                                                <option value="fr">Français</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                        <ThemeToggle />
                                        {(user.role === "GESTIONNAIRE" || user.role === "EMPLOYEUR" || user.role === "PROFESSEUR") && (
                                            <div className="flex items-center gap-2 bg-teal-600/50 px-3 py-1.5 rounded-lg border border-white/20">
                                                <label className="text-white text-sm font-medium">{t('year')}:</label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="px-3 py-2.5 border border-white/30 rounded-md bg-teal-700 text-white focus:ring-2 focus:ring-white focus:border-white text-sm font-medium cursor-pointer hover:bg-teal-600 transition-colors"
                                                >
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const year = 2023 + i;
                                                        return (
                                                            <option key={year} value={year.toString()}>
                                                                {year}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="ml-auto">
                                <p className="text-white text-lg">{t('welcome')} {
                                    // Si firstName et lastName sont identiques, n'afficher que firstName
                                    // Sinon, afficher firstName + lastName
                                    (user.firstName && user.lastName && user.firstName.trim() === user.lastName.trim())
                                        ? user.firstName.trim()
                                        : [user.firstName, user.lastName].filter(Boolean).join(" ")
                                }
                                    <button type="button"
                                            className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 ml-4"
                                            onClick={userLogout}
                                    >{t('logout')}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>
                <nav className="relative bg-teal-700/95 rounded-xl mt-2 shadow-black shadow-sm">
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-12 items-center justify-around">
                            {user.role === "EMPLOYEUR" ? (
                                <>
                                    <button onClick={() => {
                                        nav('employeur/creation-stage')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('creerStage')}
                                    </button>
                                    <button onClick={() => {
                                        nav('employeur/stages')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('mesStages')}
                                    </button>
                                    <button onClick={() => {
                                        nav('employeur/evaluations')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('mesEvaluations') || 'Mes Évaluations'}
                                    </button>
                                </>
                            ) : <></>}
                            {user.role === "ETUDIANT" ? (
                                <>
                                    <button onClick={() => {
                                        nav('etudiant/mon-cv')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('monCV')}
                                    </button>
                                    {hasCV && (
                                        <button onClick={() => {
                                            nav('etudiant/stages')
                                        }}
                                                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                            {t('mesStages')}
                                        </button>
                                    )}
                                </>
                            ) : <></>}
                            {user.role === "GESTIONNAIRE" ? (
                                <>
                                    <button onClick={() => {
                                        nav('gestionnaire/gestion-cv')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('gestionCVs')}
                                    </button>

                                    <button onClick={() => {
                                        nav('gestionnaire/candidatures')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('voirCandidaturesNav')}
                                    </button>
                                    <button onClick={() => {
                                        nav('gestionnaire/list-stages')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('voirStages')}
                                    </button>
                                    <button onClick={() => {
                                        nav('gestionnaire/association-professeur-etudiant')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('Associations') || 'Association Professeur-Étudiant'}
                                    </button>
                                    <button onClick={() => {
                                        nav('gestionnaire/creer-professeur')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('creerUnProfesseur')}
                                    </button>
                                </>
                            ) : <></>}
                            {user.role === "PROFESSEUR" ? (
                                <>
                                <button onClick={() => {
                                    nav('professeur/candidatures')
                                }}
                                        className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                    {t('voirCandidaturesNav')}
                                </button>
                                    <button onClick={() => {
                                        nav('professeur/evaluations-milieu')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        {t('evaluerMillieuStage')}
                                    </button>
                                </>
                            ) : <></>}
                        </div>
                    </div>
                </nav>
            </header>
            <main className="flex bg-white dark:bg-gray-900 min-h-screen">
                <div className="mx-auto">
                    <Outlet />
                </div>
                {(user.role === "GESTIONNAIRE" || user.role === "EMPLOYEUR" || user.role === "ETUDIANT") && (
                    <div className="px-1 sm:px-1 lg:px-2">
                        <ErrorBoundary silent={true}>
                            <Notifications/>
                        </ErrorBoundary>
                    </div>)
                }
            </main>
        </>
    )
}
