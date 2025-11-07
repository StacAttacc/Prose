import {logout} from "../services/AuthService.js";
import {useNavigate} from "react-router-dom";
import {Outlet} from "react-router";
import {useAuth} from "../context/AuthContext.jsx";
import {useCv} from "../context/CvContext.jsx";
import Notifications from "../components/notification-components/Notifications.jsx";
import {useYear} from "../context/YearContext.jsx";

export default function Dashboard() {
    const { user } = useAuth();
    const { hasCV } = useCv();
    const nav = useNavigate();
    const { selectedYear, setSelectedYear } = useYear();

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
                                    {user.role === "GESTIONNAIRE" && (
                                        <div className="flex items-center gap-2 ml-6">
                                            <label className="text-white text-sm font-medium">Année:</label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="px-3 py-2 border border-white/30 rounded-md bg-teal-600 text-white focus:ring-2 focus:ring-white focus:border-white"
                                            >
                                                {Array.from({ length: 8 }, (_, i) => {
                                                    const year = 2025 + i;
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
                            <div className="ml-auto">
                                <p className="text-white text-lg">Bienvenue {user.firstName + " " + user.lastName}
                                    <button type="button"
                                            className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 ml-4"
                                            onClick={userLogout}
                                    >Logout
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
                                        Créer un stage
                                    </button>
                                </>
                            ) : <></>}
                            {user.role === "ETUDIANT" ? (
                                <>
                                    <button onClick={() => {
                                        nav('etudiant/mon-cv')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        Mon CV
                                    </button>
                                    {hasCV && (
                                        <button onClick={() => {
                                            nav('etudiant/stages')
                                        }}
                                                className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                            Mes Stages
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
                                        Gestion des CVs
                                    </button>

                                    <button onClick={() => {
                                        nav('gestionnaire/candidatures')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        Voir les candidature(s)
                                    </button>
                                    <button onClick={() => {
                                        nav('gestionnaire/list-stages')
                                    }}
                                            className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                                        Voir Stages
                                    </button>
                                </>
                            ) : <></>}
                            {user.role === "PROFESSEUR" ? (
                                <>
                                </>
                            ) : <></>}
                        </div>
                    </div>
                </nav>
            </header>
            <main className="flex">
                <div className="mx-auto">
                    <Outlet />
                </div>
                {(user.role === "GESTIONNAIRE" || user.role === "EMPLOYEUR" || user.role === "ETUDIANT") && (
                    <div className="px-1 sm:px-1 lg:px-2">
                        <Notifications/>
                    </div>)
                }
            </main>
        </>
    )
}
