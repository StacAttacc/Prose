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
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
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
