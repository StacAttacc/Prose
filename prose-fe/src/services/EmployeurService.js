import {getAccessToken, http, setAccessToken} from "./http.js";

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



export async function updateCandidatureStatus(candidatureId, status) {
    const token = getAccessToken();
    const { data } = await http.put(
        `/employeur/candidatures/${candidatureId}/update`,
        null,
        {
            params: { status },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
    );
    return data;
}


export const approveApplicant = (id) => updateCandidatureStatus(id, "ACCEPTEE");
export const rejectApplicant  = (id) => updateCandidatureStatus(id, "REFUSEE");