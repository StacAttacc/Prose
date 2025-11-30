import axios from "axios";
import {http} from "msw";

const URL_BASE = "http://localhost:8080";

export async function createStage(stage) {
    await http.post( `${URL_BASE}/employeur/createStage`, stage);
}

export async function getStageApplicants(stageId, token) {
    const { data } = await axios.get(`${URL_BASE}/employeur/stages/${stageId}/applications`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (Array.isArray(data)) return data;
    return data?.data || data?.candidatures || data?.content || data?.results || [];
}

async function updateCandidatureStatus(candidatureId, status, token) {
    const id = Number(candidatureId);
    if (!Number.isFinite(id)) throw new Error("candidatureId invalide");

    const res = await axios.put(
        `${URL_BASE}/employeur/candidatures/${id}/update`,
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

export async function getEmployeurNotifications(token) {
    const res = await axios.get(`${URL_BASE}/employeur/notifications/all`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

export async function markNotificationRead(notificationId, token) {
    if (!notificationId) return;
    const res = await axios.put(`${URL_BASE}/employeur/notifications/read/${notificationId}`, {},{
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return res.data;
}

export const markNotificationsRead = (notificationIds = [], token) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id, token)));
};

export async function checkEntenteExists(candidatureId, token) {
    try {
        const res = await axios.get(`${URL_BASE}/employeur/candidatures/${candidatureId}/entente`, {
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
    const res = await axios.put(`${URL_BASE}/employeur/ententes/${ententeId}/signer`, password, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
}

export async function convoquerEntrevue(candidatureId, interviewData, token) {
    const res = await axios.put(`${URL_BASE}/employeur/candidatures/${candidatureId}/convoquer`, interviewData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
}

export async function getEntentesForEvaluation(employeurId, token, year) {
    const params = year ? { year } : {};

    const res = await axios.get(`${URL_BASE}/employeur/${employeurId}/ententes`, {
        params,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return res.data;
}

export async function createEvaluation(employeurId, evaluationData, token) {
    console.log(evaluationData);
    const res = await axios.post(`${URL_BASE}/employeur/${employeurId}/evaluate`, evaluationData, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return res.data;
}

export async function getEvaluationByEntente(employeurId, ententeId, token) {
    const res = await axios.get(`${URL_BASE}/employeur/${employeurId}/evaluation/${ententeId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    console.log(res.data)
    return res.data;
}
