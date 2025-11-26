import {http} from "./http";
const API = "http://localhost:8080";

async function parseJsonOrThrow(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export async function getStageApplicants(stageId) {
    const { data } = await http.get(`/employeur/stages/${stageId}/applications`);
    if (Array.isArray(data)) return data;
    return data?.data || data?.candidatures || data?.content || data?.results || [];
}

export async function updateCandidatureStatus(candidatureId, status, token) {
    const id = Number(candidatureId);
    if (!Number.isFinite(id)) throw new Error("candidatureId invalide");

    const res = await http.put(
        `/employeur/candidatures/${id}/update`,
        {},
        {
            params: { status },
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        data: res.data,
    };
}

export function approveApplicant(candidatureId, token) {
    return updateCandidatureStatus(candidatureId, "ACCEPTEE", token);
}

export function rejectApplicant(candidatureId, token) {
    return updateCandidatureStatus(candidatureId, "REFUSEE", token);
}
export async function getEmployeurNotifications(employeurEmail, token) {
    const res = await http.get(`${API}/employeur/notifications/all`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return res.data;
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

export async function checkEntenteExists(candidatureId, token) {
    try {
        const res = await http.get(`/employeur/candidatures/${candidatureId}/entente`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return { exists: true, data: res.data?.data || res.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { exists: false };
        }
        throw error;
    }
}

export async function signEntente(ententeId, password, token) {
    const res = await fetch(`${API}/employeur/ententes/${ententeId}/signer`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password })
    });
    return await parseJsonOrThrow(res);
}

export async function convoquerEntrevue(candidatureId, interviewData, token) {
    const res = await fetch(`${API}/employeur/candidatures/${candidatureId}/convoquer`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(interviewData)
    });
    return await parseJsonOrThrow(res);
}

export async function getEntentesForEvaluation(employeurId, token, year) {
    const params = year ? { year } : {};
    const res = await http.get(`/api/employeur/${employeurId}/evaluations/ententes`, {
        params,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}

export async function createEvaluation(employeurId, evaluationData, token) {
    const res = await http.post(`/api/employeur/${employeurId}/evaluations`, evaluationData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}

export async function getEvaluationByEntente(employeurId, ententeId, token) {
    const res = await http.get(`/api/employeur/${employeurId}/evaluations/entente/${ententeId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}
