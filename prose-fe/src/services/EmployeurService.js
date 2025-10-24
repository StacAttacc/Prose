import {http} from "./http.js";

const API = import.meta?.env?.VITE_API_URL || "http://localhost:8080";


export async function getStageApplicants(stageId) {
    const {data} = await http.get(`/employeur/stages/${stageId}/applications`);
    if (Array.isArray(data)) return data;
    return (
        data?.data ||
        data?.candidatures ||
        data?.content ||
        data?.results ||
        []
    );
}


export async function approveApplicant(candidatureId, token) {
    try {
        const res = await http.post(`${API}/employeur/candidature/${candidatureId}/approve`, {}, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return res.data;
    } catch (err) {
        console.error("Erreur lors de l'approbation :", err);
        throw err;
    }
}

export async function rejectApplicant(candidatureId, token) {
    try {
        const res = await http.post(`${API}/employeur/candidature/${candidatureId}/reject`, {}, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return res.data;
    } catch (err) {
        console.error("Erreur lors du refus :", err);
        throw err;
    }
}
