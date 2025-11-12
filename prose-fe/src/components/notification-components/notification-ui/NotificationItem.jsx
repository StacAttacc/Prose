import React from 'react';
import { shortText } from "../notification-utils/notificationText.jsx";
import {NotificationCloseButton} from "./NotificationCloseButton.jsx";
import {useI18n} from "../../../context/I18nContext.jsx";

export function NotificationItem({ notification, markAndNavigate, typeKey, setReadCounter, markAndReload }) {
    const t = useI18n();

    function renderCompactItem() {
        return (
            <>
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs">
                    !
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 whitespace-normal break-words overflow-hidden line-clamp-2">
                        {shortText(notification.message || notification.senderEmail || "No message", 200)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.createdAtString || "Unknown time"}
                    </div>
                </div>
            </>
        );
    }

    return (
        <li key={notification.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
            <div
                className="flex items-start gap-3 flex-1"
                onClick={(e) => markAndNavigate(e, notification, typeKey)}
            >
                {renderCompactItem()}
            </div>

            <div className="flex items-center gap-2">
                <NotificationCloseButton
                    isGroup={false}
                    markGroupAndClose={null}
                    notification={notification}
                    typeKey={typeKey}
                    setReadCounter={setReadCounter}
                    markAndReload={markAndReload}
                />
            </div>
        </li>
    )
}
