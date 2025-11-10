import {labelForKey} from "../notification-utils/notificationText.jsx";
import {NotificationItem} from "./NotificationItem.jsx";

export function NotificationGroupDropdown ({dropdownId, list, typeKey, markAndNavigate, setOpenType, setReadCounter, markAndReload}) {
    return (
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
                            <NotificationItem
                                notification={n}
                                typeKey={typeKey}
                                key={n.id}
                                setReadCounter={setReadCounter}
                                markAndReload={markAndReload}
                                markAndNavigate={markAndNavigate}
                            />
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
    );
}