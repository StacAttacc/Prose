// javascript
import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {getGestionnaireNotifications} from "../services/GestionnaireService.js";

export default function Notifications() {
    const {user} = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef();

    useEffect(() => {
        async function fetchAllGestionnaireNotifications() {
            try {
                const response = await getGestionnaireNotifications(user?.token);
                // adapt depending on your API shape
                setNotifications(response?.data?.stageNotifications || response?.data || []);
            } catch (err) {
                setError(err?.message || "Failed to load notifications");
            } finally {
                setLoading(false);
            }
        }

        fetchAllGestionnaireNotifications();
    }, [user?.token]);

    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    const count = notifications.length;
    const handleCardClick = () => {
        navigate("/gestionnaire/list-stages");
    };

    const handleToggle = (e) => {
        e.stopPropagation();
        setOpen((v) => !v);
    };

    const handleItemClick = (e, notification) => {
        e.stopPropagation();
        setOpen(false);
        const stageId = notification?.stage?.id || notification?.stageId;
        if (stageId) {
            navigate(`/stages/${stageId}`);
        } else {
            navigate("/notifications");
        }
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition p-4 flex items-center justify-between"
                onClick={handleCardClick}
                role="button"
                aria-label="Open notifications page"
            >
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Vous avez {count} nouvelle(s) offre(S) de stage à approuver</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggle}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-haspopup="true"
                        aria-expanded={open}
                        aria-label="Toggle notifications dropdown"
                    >
                        View
                        <svg className={`ml-2 w-4 h-4 transition-transform ${open ? "transform rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Dropdown */}
            <div className={`origin-top-right absolute right-0 mt-2 w-full z-50 ${open ? "block" : "hidden"}`}>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Latest notifications</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{count} total</div>
                    </div>

                    {loading ? (
                        <div className="p-4 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-sm text-red-600">{error}</div>
                    ) : count === 0 ? (
                        <div className="p-4 text-sm text-gray-600 dark:text-gray-300">No notifications yet.</div>
                    ) : (
                        <ul className="max-h-64 overflow-auto divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-start gap-3"
                                    onClick={(e) => handleItemClick(e, n)}
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2a6 6 0 016 6v4l2 2v1H4v-1l2-2V8a6 6 0 016-6z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {n.message || "No message"}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : n.createdAtString || "Unknown time"}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={(e) => { e.stopPropagation(); setOpen(false); navigate("/notifications"); }}
                            className="w-full text-sm text-blue-600 dark:text-blue-300 hover:underline"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}