import {useEffect, useState, useRef, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {
    getGestionnaireNotifications,
    markNotificationRead,
    markNotificationsRead
} from "../services/GestionnaireService.js";

export default function Notifications() {
    const {user} = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [readNotifications, setReadNotifications] = useState(0);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const mountedRef = useRef(true);
    const dropdownId = "notif-dropdown";

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!user?.token) {
            setNotifications([]);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        async function fetchAllGestionnaireNotifications() {
            setLoading(true);
            setError(null);
            try {
                setNotifications([]);
                const response = await getGestionnaireNotifications(user.token);
                if (cancelled || !mountedRef.current) return;
                const data = response?.data?.stageNotifications || response?.data || [];
                setNotifications(Array.isArray(data) ? data : []);
            } catch (err) {
                if (cancelled || !mountedRef.current) return;
                console.error("Failed to load notifications:", err);
                setError(err?.message || "Failed to load notifications");
                setNotifications([]);
            } finally {
                if (!cancelled && mountedRef.current) setLoading(false);
            }
        }

        fetchAllGestionnaireNotifications();
        return () => { cancelled = true; };
    }, [user?.token, readNotifications]);

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

    const handleCardClick = useCallback(async () => {
        await markNotificationsRead((notifications || []).map(n => n.id), user.token);
        setReadNotifications(prev => prev + readNotifications +1);
        navigate("/gestionnaire/list-stages");
    }, [navigate]);

    const handleCardKeyDown = useCallback((e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
        }
    }, [handleCardClick]);

    const handleToggle = useCallback((e) => {
        e.stopPropagation();
        setOpen((v) => !v);
    }, []);

    const handleItemClick = useCallback(async (e, notification) => {
        e.stopPropagation();
        setOpen(false);
        const stageId = notification?.stage?.id || notification?.stageId;
        try {
            if (stageId) {
                await markNotificationRead(notification.id, user.token);
                setReadNotifications(prev => prev + 1);
                navigate("/gestionnaire/list-stages", { state: { openStageId: stageId } });
            } else {
                navigate("/gestionnaire/list-stages");
            }
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
            navigate("/gestionnaire/list-stages", stageId ? { state: { openStageId: stageId } } : undefined);
        }
    }, [navigate, notifications, user?.token]);

    function shortText(text, max = 80) {
        if (!text) return "";
        return text.length > max ? `${text.slice(0, max - 1)}…` : text;
    }

    return (!loading && error ? (
                <div className="mt-3 text-sm text-red-600">{error}</div>)
        : (count === 0 ? (<></>)
            : (
                <div className="relative inline-block text-left" ref={dropdownRef}>
                    <div
                        className="w-full bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition p-4 flex items-center justify-between"
                        role="button"
                        tabIndex={0}
                        onClick={handleCardClick}
                        onKeyDown={handleCardKeyDown}
                        aria-label="Open notifications page"
                    >
                        <div className="flex items-start gap-3 flex-1">
                            <div>
                                <div className="text-xs text-gray-500" aria-live="polite">
                                    Vous avez {count} nouvelle(s) offre(s) de stage à approuver
                                </div>

                                {count <= 3 ? (
                                        <ul className="mt-3 space-y-2">
                                            {notifications.map((n) => (
                                                <li key={n.id}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleItemClick(e, n)}
                                                        className="w-full text-left flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md hover:bg-gray-100"
                                                        title={n.message || ""}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs">
                                                            !
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {shortText(n.message || "No message", 80)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : n.createdAtString || "Unknown time"}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null
                                }
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {count >= 4 && (
                                <button
                                    type="button"
                                    onClick={handleToggle}
                                    className="inline-flex items-center mx-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 "
                                    aria-haspopup="true"
                                    aria-expanded={open}
                                    aria-controls={dropdownId}
                                    aria-label="Toggle notifications dropdown"
                                >
                                    <svg className={`m-2 w-4 h-4 transition-transform ${open ? "transform rotate-180" : ""}`}
                                         viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <path fillRule="evenodd"
                                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {count >= 4 && (
                        <div id={dropdownId}
                             className={`origin-top-right absolute right-0 mt-2 w-full z-50 ${open ? "block" : "hidden"}`}
                             role="menu" aria-hidden={!open}>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="text-sm font-semibold text-gray-800">Nouvelles offres de stage</div>
                                </div>

                                <div>
                                    {loading ? (
                                        <div className="p-4 flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                        strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 text-sm text-red-600">{error}</div>
                                    ) : (
                                        <ul className="max-h-64 overflow-auto divide-y divide-gray-100">
                                            {notifications.map((n) => (
                                                <li key={n.id}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleItemClick(e, n)}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3"
                                                    >
                                                        <div className="flex-shrink-0">
                                                            <div
                                                                className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"
                                                                     aria-hidden>
                                                                    <path
                                                                        d="M12 2a6 6 0 016 6v4l2 2v1H4v-1l2-2V8a6 6 0 016-6z"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate"
                                                                 title={n.message || ""}>
                                                                {shortText(n.message || "No message", 120)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : n.createdAtString || "Unknown time"}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        )
    );
}