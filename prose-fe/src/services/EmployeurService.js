const API = import.meta?.env?.VITE_API_URL || "http://localhost:8080";

async function parseJsonOrThrow(res) {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function getStageApplicants(stageId, token) {
    const res = await fetch(`${API}/employeur/stages/${stageId}/applications`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await parseJsonOrThrow(res);

    if (Array.isArray(data)) return data;

    return (
        data?.data ||
        data?.candidatures ||
        data?.content ||
        data?.results ||
        []
    );
}

export async function getEmployeurCandidatureNotifications(employeurEmail, token) {
    const res = await fetch(`${API}/employeur/notifications/postulations/${encodeURIComponent(employeurEmail)}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return await parseJsonOrThrow(res);
}

export async function markNotificationRead(notificationId, token) {
    if (!notificationId) return;
    const res = await fetch(`${API}/employeur/notifications/read/${notificationId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ notificationId })
    });
    return await parseJsonOrThrow(res).catch(() => {});
}

export const markNotificationsRead = (notificationIds = [], token) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id, token)));
};

export async function convoquerEntrevue(candidatureId, interviewData, token) {
    const res = await fetch(`${API}/employeur/candidatures/${candidatureId}/convoquer`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(interviewData)
    });
    return await parseJsonOrThrow(res);
}
