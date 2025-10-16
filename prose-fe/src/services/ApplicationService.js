// services/ApplicationService.js
const API = import.meta?.env?.VITE_API_URL || "http://localhost:8080";

// Utilitaires sûrs (pas de ?? / ||)
function firstNonEmpty(...vals) {
    for (const v of vals) {
        if (v === null || v === undefined) continue;
        const s = String(v);
        if (s.trim().length > 0) return s.trim();
    }
    return "";
}
function joinNames(a, b) {
    const left = a ? String(a).trim() : "";
    const right = b ? String(b).trim() : "";
    const j = [left, right].filter(Boolean).join(" ").trim();
    return j;
}

async function parseJsonOrThrow(res) {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

function extractList(payload) {
    if (Array.isArray(payload)) return payload;

    // essaie différents wrappers sans || ; renvoie dès qu'on trouve un tableau
    const candidates = [
        payload && payload.entity,
        payload && payload.data,
        payload && payload.candidatures,
        payload && payload.items,
        payload && payload.content,
        payload && payload.results,
    ];
    for (const c of candidates) if (Array.isArray(c)) return c;

    return [];
}

function normalizeApplicant(c = {}) {
    const etu = c.etudiant || {};

    const email = firstNonEmpty(etu.email, c.etudiantEmail, c.email);

    const fullNameFromEtu = firstNonEmpty(etu.fullName);
    const fullNameJoined = joinNames(etu.firstName, etu.lastName);
    const legacyNames = joinNames(c.prenom, c.nom);
    const fullName = firstNonEmpty(fullNameFromEtu, fullNameJoined, legacyNames, email, "—");

    let motivation = "";
    if (typeof c.motivation === "string" && c.motivation.trim()) {
        motivation = c.motivation.trim();
    } else if (typeof c.motivationLetterText === "string" && c.motivationLetterText.trim()) {
        motivation = c.motivationLetterText.trim();
    } else if (c.motivationLetterData) {
        motivation = "(Lettre de motivation jointe)";
    }

    let skills = [];
    if (Array.isArray(c.skills)) skills = c.skills;
    else if (Array.isArray(c.competences)) skills = c.competences;

    const status = firstNonEmpty(c.status, c.statut);

    const id = c.id != null ? c.id : (c.candidatureId != null ? c.candidatureId : (c.applicationId != null ? c.applicationId : null));

    return {
        id,
        email,
        fullName,
        motivation,
        skills,
        status,
        _raw: c,
    };
}

export async function getStageApplicants(stageId, token) {
    const res = await fetch(`${API}/employeur/stages/${stageId}/applications`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const payload = await parseJsonOrThrow(res);
    const list = extractList(payload);

    return Array.isArray(list) ? list.map(normalizeApplicant) : [];
}
