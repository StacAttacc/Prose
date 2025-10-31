import React from 'react';
import { shortText } from "../notification-utils/notificationText.jsx";

export function NotificationItem({ notification, onItemClick, onMarkSingleClick, typeKey}) {

    return (
        <li className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
            <div
                className="flex items-start gap-3 flex-1"
                onClick={(e) => onItemClick(e, notification, typeKey)}
            >
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
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={(e) => onMarkSingleClick(e, notification, typeKey)}
                    className="inline-flex items-center ml-2 py-1 px-2 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    aria-label="Mark this notification as read"
                    title="Mark this notification as read"
                >
                    <svg className="m-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden>
                        <line x1="4" y1="4" x2="20" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                        <line x1="20" y1="4" x2="4" y2="20" stroke="#ff0000" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </li>
    );
}