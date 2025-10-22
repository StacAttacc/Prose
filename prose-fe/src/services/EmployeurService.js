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
