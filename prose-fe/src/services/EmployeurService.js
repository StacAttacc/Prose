import {http} from "./http.js";

const URL_BASE = "http://localhost:8080";

export async function createStage(stage) {
    await http.post( `/employeur/createStage`, stage);
}

export async function getEmployeurStages(email, token, year = null) {
    const params = {};
    if (year) {
        params.year = year;
    }

    const {data} = await http.get(`/employeur/${email}/stages`, {params: params})

    return data;
}

export async function getStageApplicants(stageId) {
    const { data } = await http.get(`/employeur/stages/${stageId}/applications`);

    if (Array.isArray(data)) return data;
    return data?.data || data?.candidatures || data?.content || data?.results || [];
}

async function updateCandidatureStatus(candidatureId, status) {
    const id = Number(candidatureId);
    if (!Number.isFinite(id)) throw new Error("candidatureId invalide");

    const res = await http.put(`/employeur/candidatures/${id}/update`, {}, {
        params: { status }
    });

    return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        data: res.data,
    };
}

export function approveApplicant(candidatureId) {
    return updateCandidatureStatus(candidatureId, "ACCEPTEE");
}

export function rejectApplicant(candidatureId) {
    return updateCandidatureStatus(candidatureId, "REFUSEE");
}

export async function getEmployeurNotifications() {
    const res = await http.get(`/employeur/notifications/all`);

    return res.data;
}

export async function markNotificationRead(notificationId) {
    if (!notificationId) return;
    const res = await http.put(`${URL_BASE}/employeur/notifications/read/${notificationId}`, {});
    return res.data;
}

export const markNotificationsRead = (notificationIds = []) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id)));
};

export async function checkEntenteExists(candidatureId) {
    try {
        const res = await http.get(`/employeur/candidatures/${candidatureId}/entente`);
        return { exists: true, data: res.data?.data || res.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { exists: false };
        }
        throw error;
    }
}

export async function signEntente(ententeId, password) {
    const res = await http.put(`/employeur/ententes/${ententeId}/signer`, {password});
    return res.data;
}

export async function convoquerEntrevue(candidatureId, interviewData) {
    const res = await http.put(`/employeur/candidatures/${candidatureId}/convoquer`, interviewData);
    return res.data;
}

export async function getEntentesForEvaluation(employeurId, token, year) {
    const params = year ? { year } : {};

    const res = await http.get(`/employeur/${employeurId}/ententes`, {
        params: params,
    });
    return res.data;
}

export async function createEvaluation(employeurId, evaluationData) {
    const res = await http.post(`/employeur/${employeurId}/evaluate`, evaluationData);
    return res.data;
}

export async function getEvaluationByEntente(employeurId, ententeId) {
    const res = await http.get(`/employeur/${employeurId}/evaluation/${ententeId}`);
    return res.data;
}
