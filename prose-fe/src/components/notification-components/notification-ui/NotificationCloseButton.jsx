import React, {useCallback} from "react";
import {markManyNotifications} from "../notification-utils/notificationsServiceLogic.jsx";

export function NotificationCloseButton({
        isGroup,
        list,
        typeKey,
        count,
        notification,
        user,
        setReadCounter,
        setOpenType,
        markAndReload
    })
{
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

    const markAndClose = async (e, notification, typeKey) => {
        e?.stopPropagation?.();
        if (!notification?.id) return;
        try {
            await markAndReload(notification, typeKey);
        } catch (err) {
            console.error("Failed to mark single notification as read:", err);
        }
    };

    function handleButtonClick(e) {
        e.stopPropagation();
        (isGroup) ? markGroupAndClose(e, list) : markAndClose(e, notification, typeKey);
    }

    function buttonLabel() {
        if (isGroup) {
            return `Mark all ${count} ${typeKey} notifications as read`;
        } else {
            return "Mark this notification as read";
        }
    }

    return (
        <button
            type="button"
            onClick={(e) => handleButtonClick(e)}
            className="inline-flex items-center py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            aria-label={buttonLabel()}
            title={buttonLabel()}
        >
            <svg className="m-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden>
                <line x1="4" y1="4" x2="20" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="20" y1="4" x2="4" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
        </button>
    )
}