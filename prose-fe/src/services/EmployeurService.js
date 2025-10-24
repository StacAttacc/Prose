import {http} from "./http";
const BASE_URL = "http://localhost:8080/employeur";

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