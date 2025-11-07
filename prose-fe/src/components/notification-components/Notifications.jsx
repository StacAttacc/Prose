import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Eye, EyeOff } from "lucide-react";
import {
    markManyNotifications,
    fetchNotifications,
    markSingleNotificationAsRead
} from "./notification-utils/notificationsServiceLogic.jsx";
import { normalizeNotifications } from "./notification-utils/notificationParsingLogic.jsx";
import {
    getDefaultNavigationPath,
    getGroupedNotificationNavigation,
    getNotificationNavigationPath
} from "./notification-utils/notificationsNavigationLogic.jsx";
import { labelForKey } from "./notification-utils/notificationText.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import {NotificationItem} from "./notification-ui/NotificationItem.jsx";
import {NotificationGroupDropdown} from "./notification-ui/NotificationGroupDropdown.jsx";

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
        async function fetchData() {
            if (!user?.token) {
                setNotificationsByType({});
                setLoading(false);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const payload = await fetchNotifications(user);
                const byType = await normalizeNotifications(payload);
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
        fetchData();
    }, [user, readCounter]);

    useEffect(() => {
        function onClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenType(null);
            }
        }
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    const markGroupAndNavigate = useCallback(async (typeKey, list) => {
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotifications(user, ids);
            setReadCounter(c => c + ids.length);
            const { path, state } = getGroupedNotificationNavigation(typeKey, user.role);
            navigate(path, state ? { state } : undefined);
        } catch (err) {
            console.error("Failed to mark card notifications as read:", err);
            navigate(getDefaultNavigationPath(user.role));
        }
    }, [navigate, user]);

    const markAndNavigate = useCallback(async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        if (!notification?.id) return;
        setOpenType(null);

        try {
            await markSingleNotificationAsRead(notification.id, user);
            setNotificationsByType(prev => {
                const next = { ...prev };
                const arr = (next[typeKey] || []).filter(n => n.id !== notification.id);
                if (arr.length) next[typeKey] = arr;
                else delete next[typeKey];
                return next;
            });
            setReadCounter(c => c + 1);

            const { path, state } = getNotificationNavigationPath(notification, user.role);
            navigate(path, state ? { state } : undefined);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            navigate(getDefaultNavigationPath(user.role));
        }
    }, [navigate, user]);

    const markAndClose = async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        if (!notification?.id) return;
        try {
            await markSingleNotificationAsRead(notification.id, user);
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

    const markGroupAndClose = useCallback(async (e, list) => {
        e?.stopPropagation?.();
        const ids = (list || []).map(n => n.id).filter(Boolean);
        try {
            await markManyNotifications(user, ids);
            setReadCounter(c => c + ids.length);
            setOpenType(null);
        } catch (err) {
            console.error("Failed to mark notifications as read (close type):", err);
        }
    }, [user]);

    const totalCount = Object.values(notificationsByType).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

    if (!loading && error) {
        return <ErrorBanner message={error} />;
    }

    if (totalCount === 0) return null;

    return (
        <div ref={dropdownRef} className="space-y-3">
            {Object.entries(notificationsByType).map(([typeKey, list]) => {
                const count = (list || []).length;
                if (count === 0) return null;
                const showGrouped = count >= 4;
                const dropdownId = `notif-dropdown-${typeKey}`;
                const open = openType === typeKey;
                return (
                    <div key={typeKey} className="relative w-full text-left flex justify-center">
                        <div
                            className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition p-3 flex items-center justify-between"
                            role="button"
                            tabIndex={0}
                            onClick={() => markGroupAndNavigate(typeKey, list)}
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500" aria-live="polite">
                                        {count} {labelForKey(typeKey)}
                                    </div>

                                    {count <= 3 ? (
                                        <ul className="mt-3 space-y-2">
                                            {(list || []).map((n) => (
                                                <NotificationItem
                                                    itemCount={count}
                                                    notification={n}
                                                    markAndNavigate={markAndNavigate}
                                                    markAndClose={markAndClose}
                                                    typeKey={typeKey}
                                                    key={n.id}
                                                />
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
                                            onClick={(e) => { e.stopPropagation(); markGroupAndClose(e, list); }}
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
                            <NotificationGroupDropdown
                                dropdownId={dropdownId}
                                list={list}
                                typeKey={typeKey}
                                count={count}
                                markAndNavigate={markAndNavigate}
                                markAndClose={markAndClose}
                                setOpenType={setOpenType}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}