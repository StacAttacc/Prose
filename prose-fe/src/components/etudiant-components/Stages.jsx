import { NavLink, Outlet } from "react-router-dom";
import ScrollToTop from "../common/ScrollToTop.jsx";
import { useI18n } from "../../context/I18nContext.jsx";

export default function Stages() {
    const { t } = useI18n();
    
    return (
        <div className="flex items-start">
            {/* Sidebar */}
            <aside className="w-64 mt-20 bg-white rounded-lg shadow-md border border-gray-200 p-4 flex-shrink-0 mr-4 self-start">
                <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">{t('navigation')}</h2>
                <nav className="space-y-3">
                    <NavLink
                        to="/etudiant/stages/disponibles"
                        className={({ isActive }) =>
                            isActive
                                ? "block text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                : "block text-gray-700 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                        }
                    >
                        📋 {t('stagesDisponibles')}
                    </NavLink>
                    <NavLink
                        to="/etudiant/stages/candidatures"
                        className={({ isActive }) =>
                            isActive
                                ? "block text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                : "block text-gray-700 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                        }
                    >
                        📝 {t('mesCandidatures')}
                    </NavLink>
                </nav>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1">
                <Outlet />
            </div>

            {/* Bouton scroll to top */}
            <ScrollToTop />
        </div>
    );
}
