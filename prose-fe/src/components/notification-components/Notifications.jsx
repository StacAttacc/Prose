import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
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
import ErrorBanner from "../display-components/ErrorBanner.jsx";
import {NotificationGroupDropdown} from "./notification-ui/NotificationGroupDropdown.jsx";
import {NotificationCard} from "./notification-ui/NotificationCard.jsx";

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
        let timerId;
        let inFlight = false;

        async function fetchData() {
            if (inFlight) return;

            if (!user?.token) {
                setNotificationsByType({});
                setLoading(false);
                setError(null);
                return;
            }

            inFlight = true;
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
                inFlight = false;
                if (mountedRef.current) setLoading(false);
            }
        }
        fetchData();
        timerId = setInterval(fetchData, 30000);
        return () => {
            clearInterval(timerId)
        }

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

    async function markAndReload(notification, typeKey) {
        await markSingleNotificationAsRead(notification.id, user);
        setNotificationsByType(prev => {
            const next = { ...prev };
            const arr = (next[typeKey] || []).filter(n => n.id !== notification.id);
            if (arr.length) next[typeKey] = arr;
            else delete next[typeKey];
            return next;
        });
        setReadCounter(c => c + 1);
    }

    const markAndNavigate = useCallback(async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        if (!notification?.id) return;
        setOpenType(null);

        try {
            await markAndReload(notification, typeKey);
            const { path, state } = getNotificationNavigationPath(notification, user.role);
            navigate(path, state ? { state } : undefined);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            navigate(getDefaultNavigationPath(user.role));
        }
    }, [navigate, user]);

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
                        <NotificationCard
                            markGroupAndNavigate={markGroupAndNavigate}
                            list={list}
                            typeKey={typeKey}
                            count={count}
                            open={open}
                            dropdownId={dropdownId}
                            setOpenType={setOpenType}
                            markAndNavigate={markAndNavigate}
                            setReadCounter={setReadCounter}
                            markAndReload={markAndReload}
                            user={user}
                        />

                        {showGrouped && openType === typeKey && (
                            <NotificationGroupDropdown
                                dropdownId={dropdownId}
                                list={list}
                                typeKey={typeKey}
                                count={count}
                                markAndNavigate={markAndNavigate}
                                setReadCounter={setReadCounter}
                                markAndReload={markAndReload}
                                setOpenType={setOpenType}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
