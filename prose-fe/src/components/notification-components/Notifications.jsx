import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Eye, EyeOff } from "lucide-react";
import {
    markManyNotifications,
    markSingleNotification,
    fetchNotifications
} from "./notification-utils/notifications-service-logic.jsx";
import { normalizeNotifications } from "./notification-utils/notification-parsing-logic.jsx";

export default function Notifications() {
    const { user } = useAuth();
    const [notificationsByType, setNotificationsByType] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openType, setOpenType] = useState(null);
    const [readCounter, setReadCounter] = useState(0);
    const mountedRef = useRef(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!user?.token) {
            setNotificationsByType({});
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let byType = normalizeNotifications(await fetchNotifications(user));
            if (mountedRef.current) setNotificationsByType(byType);
        } catch (err) {
            console.error("Failed to load notifications:", err);
            if (mountedRef.current) {
                setError(err?.message || "Failed to load notifications");
                setNotificationsByType({});
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }  
    }, [user.token, user.role, user.email, readCounter]);

    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenType(null);
            }
        }
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    async function markNotificationAsRead(id) {
        markSingleNotification(id, user);
    }

    async function markManyNotificationsAsRead(ids = []) {
        markManyNotifications(user, ids);
    }

    function defaultNavigatePath() {
        if (user.role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
        if (user.role === "EMPLOYEUR") return `/employeur/posted-stages`;
        if (user.role === "ETUDIANT") return `etudiant/mon-cv`;
        return "/";
    }

    const handleGroupClick = useCallback(async (typeKey, list) => {
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotificationsAsRead(ids);
            setReadCounter(c => c + ids.length);
            navigate(defaultNavigatePath());
        } catch (err) {
            console.error("Failed to mark card notifications as read:", err);
            navigate(defaultNavigatePath());
        }
    }, [navigate, user?.role, user?.token, user?.email]);

    const handleItemClick = useCallback(async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        setOpenType(null);

        const stageId = notification?.stageId || null;
        const candidatureId = notification?.candidatureId || null;
        const etudiantId = notification?.etudiantId || null;
        const cvId = notification?.cvId || null;
        const convocation = notification?.convocation || null;

        const isCandidature = Boolean(notification?.candidature || notification?.candidatureId);

        try {
            await markNotificationAsRead(notification.id);
            setNotificationsByType(prev => {
                const next = { ...prev };
                const arr = (next[typeKey] || []).filter(n => n.id !== notification.id);
                if (arr.length) next[typeKey] = arr;
                else delete next[typeKey];
                return next;
            });
            setReadCounter(c => c + 1);

            if (user.role === "EMPLOYEUR") {
                if (isCandidature) {
                    if (stageId) {
                        navigate(`/employeur/stages/${stageId}/candidatures`, { state: { openCandidatureId: candidatureId } });
                        return;
                    }
                }
            }
            else if (user.role === "ETUDIANT") {
                navigate(defaultNavigatePath());
            }
            else if (user.role === "GESTIONNAIRE") {
                if (isCandidature) {
                    if (stageId) {
                        navigate(defaultNavigatePath(), { state: { openEtudiantId: etudiantId } });
                        return;
                    }
                } else {
                    if (stageId) {
                        navigate("/gestionnaire/list-stages", { state: { openStageId: stageId } });
                        return;
                    } else if (!stageId && cvId) {
                        navigate("/gestionnaire/gestion-cv", { state: { openCvId: cvId } });
                        return;
                    } else if (convocation) {
                        navigate(defaultNavigatePath(), { state: { openEtudiantId: etudiantId } });
                        return;
                    }
                }
            }

            navigate(defaultNavigatePath());
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            navigate(defaultNavigatePath());
        }
    }, [navigate, user?.role, user?.token, user?.email]);

    const handleMarkSingleClick = async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        if (!notification?.id) return;
        try {
            await markNotificationAsRead(notification.id);
            setNotificationsByType(prev => {
                const next = { ...prev };
                const arr = (next[typeKey] || []).filter(n => n.id !== notification.id);
                if (arr.length) next[typeKey] = arr;
                else delete next[typeKey];
                return next;
            });
            setReadCounter(c => c + 1);
        } catch (err) {
            console.error("Failed to mark single notification as read:", err);
        }
    };

    const handleCloseType = useCallback(async (e, typeKey, list) => {
        e?.stopPropagation?.();
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotificationsAsRead(ids);
            setReadCounter(c => c + ids.length);
            setOpenType(null);
        } catch (err) {
            console.error("Failed to mark notifications as read (close type):", err);
        }
    }, [user?.role, user?.token, user?.email]);

    const totalCount = Object.values(notificationsByType).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

    if (!loading && error) {
        return <div className="mt-3 text-sm text-red-600">{error}</div>;
    }

    if (totalCount === 0) return null;

    function shortText(text, max = 80) {
        if (!text) return "";
        return text.length > max ? text.slice(0, max - 3) + "..." : text;
    }

    function labelForKey(key) {
        if (key === "stage") return `nouvelles offre(s) de stage à approuver`;
        if (key === "postulation") return `nouvelles candidature(s) reçue(s)`;
        if (key === "gestionnaire_cv") return `nouveau(x) CV(s) à examiner`;
        if (key === "etudiant_cv") return `changement sur votre CV`;
        if (key === "convocation") return `nouvelle(s) convocation(s)`;
        return `${key} notification(s)`;
    }

    return (
        <div ref={dropdownRef} className="space-y-3">
            {Object.entries(notificationsByType).map(([typeKey, list]) => {
                const count = (list || []).length;
                if (count === 0) return null;
                const showGrouped = count >= 4;
                const dropdownId = `notif-dropdown-${typeKey}`;
                const open = openType === typeKey;

                function renderCompactItem(n) {
                    return (
                        <>
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs">
                                !
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 whitespace-normal break-words overflow-hidden line-clamp-2">
                                    {shortText(n.message || n.senderEmail || "No message", 200)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : n.createdAtString || "Unknown time"}
                                </div>
                            </div>
                        </>
                    );
                }

                return (
                    <div key={typeKey} className="relative w-full text-left flex justify-center">
                        <div
                            className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition p-3 flex items-center justify-between"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleGroupClick(typeKey, list)}
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500" aria-live="polite">
                                        {count} {labelForKey(typeKey)}
                                    </div>

                                    {count <= 3 ? (
                                        <ul className="mt-3 space-y-2">
                                            {(list || []).map((n) => (
                                                <li key={n.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                                                    <div
                                                        className="flex items-start gap-3 flex-1"
                                                        onClick={(e) => handleItemClick(e, n, typeKey)}
                                                    >
                                                        {renderCompactItem(n)}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {count <= 3 && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleMarkSingleClick(e, n, typeKey)}
                                                                className="inline-flex items-center ml-2 py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                                                aria-label="Mark this notification as read"
                                                                title="Mark this notification as read"
                                                            >
                                                                <svg className="m-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden>
                                                                    <line x1="4" y1="4" x2="20" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                                                    <line x1="20" y1="4" x2="4" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-row items-center gap-2">
                                {count >= 4 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setOpenType(open ? null : typeKey); }}
                                            className="inline-flex items-center justify-center py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                            aria-haspopup="true"
                                            aria-expanded={open}
                                            aria-controls={dropdownId}
                                            aria-label="Toggle notifications dropdown"
                                            aria-pressed={open}
                                            title={open ? "Close notifications" : "Open notifications"}
                                        >
                                            {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleCloseType(e, typeKey, list); }}
                                            className="inline-flex items-center py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                            aria-label={`Mark all ${count} ${typeKey} notifications as read`}
                                            title="Mark all as read"
                                        >
                                            <svg className="m-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden>
                                                <line x1="4" y1="4" x2="20" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                                <line x1="20" y1="4" x2="4" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {showGrouped && openType === typeKey && (
                            <div id={dropdownId} className="origin-top absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 z-50" role="menu">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="p-2 flex flex-col">
                                        <div className="px-3 py-2 border-b flex items-center justify-between">
                                            <div className="text-sm font-semibold text-gray-800">
                                                {labelForKey(typeKey)}
                                            </div>
                                        </div>
                                        <ul className="space-y-2 overflow-y-auto max-h-64">
                                            {(list || []).slice(0, 20).map((n) => (
                                                <li key={n.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                                                    <div className="flex items-start gap-3 flex-1" onClick={(e) => handleItemClick(e, n, typeKey)}>
                                                        {renderCompactItem(n)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {count >= 4 && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleMarkSingleClick(e, n, typeKey); }}
                                                                    className="inline-flex items-center ml-2 py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                                                    aria-label="Mark this notification as read"
                                                                    title="Mark this notification as read"
                                                                >
                                                                    <svg className="m-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden>
                                                                        <line x1="4" y1="4" x2="20" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                                                        <line x1="20" y1="4" x2="4" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-2 mt-2 border-t flex justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setOpenType(null); }}
                                                className="inline-flex items-center py-1 px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                                aria-label="Close notifications dropdown"
                                            >
                                                Fermer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}