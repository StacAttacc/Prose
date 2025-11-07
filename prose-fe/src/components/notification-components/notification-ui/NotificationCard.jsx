import {labelForKey} from "../notification-utils/notificationText.jsx";
import {NotificationItem} from "./NotificationItem.jsx";
import {Eye, EyeOff} from "lucide-react";
import {NotificationCloseButton} from "./NotificationCloseButton.jsx";

export function NotificationCard ({
    markGroupAndNavigate,
    list,
    typeKey,
    count,
    open,
    dropdownId,
    setOpenType,
    markAndNavigate,
    setReadCounter,
    markAndReload,
    user
}) {
    return (
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
                                    notification={n}
                                    markAndNavigate={markAndNavigate}
                                    typeKey={typeKey}
                                    key={n.id}
                                    setReadCounter={setReadCounter}
                                    markAndReload={markAndReload}
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

                        <NotificationCloseButton
                            isGroup={true}
                            list={list}
                            typeKey={typeKey}
                            count={count}
                            user={user}
                            setReadCounter={setReadCounter}
                            setOpenType={setOpenType}
                        />
                    </>
                )}
            </div>
        </div>
    )
}