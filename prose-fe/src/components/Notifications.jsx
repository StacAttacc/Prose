// javascript
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getGestionnaireNotifications,
    markNotificationRead as markNotificationReadGestionnaire,
    markNotificationsRead as markNotificationsReadGestionnaire
} from "../services/GestionnaireService.js";
import {
    getCandidatureNotifications,
    markNotificationRead as markNotificationReadEmployeur,
    markNotificationsRead as markNotificationsReadEmployeur
} from "../services/EmployeurService.js";

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

    function normalizeListToTypes(list = [], fallbackKey = "default") {
        const map = {};
        list.forEach(n => {
            const key = (n?.type && n.type.toLowerCase?.()) || n?.notificationType?.toLowerCase?.() || fallbackKey;
            if (!map[key]) map[key] = [];
            map[key].push(n);
        });
        return map;
    }

    function buildFromGroups(groups = []) {
        const map = {};
        groups.forEach(g => {
            const key = (g?.typeKey || g?.type || "default").toLowerCase();
            map[key] = Array.isArray(g.items) ? g.items : [];
        });
        return map;
    }

    async function fetchAndNormalize() {
        if (!user?.token) {
            setNotificationsByType({});
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let raw;
            if (user.role === "GESTIONNAIRE") {
                raw = await getGestionnaireNotifications(user.token);
            } else if (user.role === "EMPLOYEUR") {
                raw = await getCandidatureNotifications(user.email, user.token);
            } else {
                raw = null;
            }

            // raw may already be parsed; unwrap common wrapper { message, data }
            const payload = raw?.data || raw || null;

            let byType = {};

            if (payload?.groups && Array.isArray(payload.groups)) {
                byType = buildFromGroups(payload.groups);
            } else if (Array.isArray(payload)) {
                byType = normalizeListToTypes(payload);
            } else if (payload?.postulationNotifications) {
                byType = normalizeListToTypes(payload.postulationNotifications, "postulation");
            } else if (payload?.stageNotifications) {
                byType = normalizeListToTypes(payload.stageNotifications, "stage");
            } else if (payload?.items && Array.isArray(payload.items)) {
                byType = normalizeListToTypes(payload.items);
            } else if (payload?.data && Array.isArray(payload.data)) {
                byType = normalizeListToTypes(payload.data);
            } else {
                byType = {};
            }

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
    }

    useEffect(() => {
        fetchAndNormalize();
        // refresh when readCounter changes (after marking read)
    }, [user?.token, user?.role, user?.email, readCounter]);

    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenType(null);
            }
        }
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    async function markSingleNotification(id) {
        if (!id) return;
        if (user.role === "GESTIONNAIRE") {
            await markNotificationReadGestionnaire(id, user.token);
        } else if (user.role === "EMPLOYEUR") {
            await markNotificationReadEmployeur(id, user.token);
        } else {
            await markNotificationReadGestionnaire(id, user.token);
        }
    }

    async function markManyNotifications(ids = []) {
        if (!Array.isArray(ids) || ids.length === 0) return;
        if (user.role === "GESTIONNAIRE") {
            await markNotificationsReadGestionnaire(ids, user.token);
        } else if (user.role === "EMPLOYEUR") {
            await markNotificationsReadEmployeur(ids, user.token);
        } else {
            await markNotificationsReadGestionnaire(ids, user.token);
        }
    }

    function defaultNavigatePath(typeKey) {
        if (user.role === "GESTIONNAIRE") return "/gestionnaire/list-stages";
        if (user.role === "EMPLOYEUR") return `/employeur/${encodeURIComponent(user.email)}/stages`;
        return "/";
    }

    const handleCardClick = useCallback(async (typeKey, list) => {
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotifications(ids);
            setReadCounter(c => c + ids.length);
            navigate(defaultNavigatePath(typeKey));
        } catch (err) {
            console.error("Failed to mark card notifications as read:", err);
            navigate(defaultNavigatePath(typeKey));
        }
    }, [navigate, user?.role, user?.token, user?.email]);

    const handleItemClick = useCallback(async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        setOpenType(null);
        const stageId = notification?.stage?.id || notification?.stageId || notification?.candidature?.stage?.id || notification?.candidatureId;
        try {
            await markSingleNotification(notification.id);
            setReadCounter(c => c + 1);
            if (stageId) {
                navigate(defaultNavigatePath(typeKey), { state: { openStageId: stageId } });
            } else {
                navigate(defaultNavigatePath(typeKey));
            }
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            navigate(defaultNavigatePath(typeKey));
        }
    }, [navigate, user?.role, user?.token, user?.email]);

    const handleCloseType = useCallback(async (e, typeKey, list) => {
        e?.stopPropagation?.();
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotifications(ids);
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

    return (
        <div ref={dropdownRef} className="space-y-3">
            {Object.entries(notificationsByType).map(([typeKey, list]) => {
                const count = (list || []).length;
                if (count === 0) return null;
                const showGrouped = count >= 4;
                return (
                    <div key={typeKey} className="relative inline-block text-left">
                        <div
                            className="w-full bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition p-3 flex items-center justify-between"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleCardClick(typeKey, list)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="font-semibold capitalize">{typeKey}</div>
                                <div className="text-sm text-gray-500">{count} new</div>
                            </div>

                            <div className="flex items-center gap-2">
                                {showGrouped ? (
                                    <button onClick={(e) => { e.stopPropagation(); setOpenType(openType === typeKey ? null : typeKey); }}
                                            className="text-sm text-blue-600 underline">
                                        View
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {showGrouped && openType === typeKey && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 z-50" role="menu">
                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="p-2">
                                        {(list || []).slice(0, 10).map(item => (
                                            <div key={item.id} className="flex justify-between items-start p-2 hover:bg-gray-50 cursor-pointer"
                                                 onClick={(e) => handleItemClick(e, item, typeKey)}>
                                                <div>
                                                    <div className="text-sm font-medium">{item.message || item.senderEmail}</div>
                                                    <div className="text-xs text-gray-500">{item.senderEmail}</div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); handleItemClick(e, item, typeKey); }}
                                                            className="text-xs text-blue-600">Open</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleCloseType(e, typeKey, [item]); }}
                                                            className="text-xs text-gray-500">Mark read</button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-2 text-right">
                                            <button onClick={(e) => handleCloseType(e, typeKey, list)} className="text-sm text-red-600">
                                                Mark all read
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