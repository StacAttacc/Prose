function makeKeyForItem(item = {}, groupKey) {
    if (item?.convocation) return "convocation";
    else if (item?.candidatureId) return "postulation";
    else if (item?.stageId) return "stage";
    else if (item?.cvId) return "gestionnaire_cv";
    else if (item?.etudiantId) return "etudiant_cv";
    else if (groupKey && typeof groupKey === "string" && !/\s/.test(groupKey)) return groupKey.toLowerCase();
    else if (item?.type) {
        return String(item.type)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }
    return "default";
}  

function buildFromGroups(groups = []) {
    const map = {};
    groups.forEach(g => {
        const items = Array.isArray(g.items) ? g.items : [];
        const groupKey = g?.typeKey || g?.type || undefined;
        items.forEach(item => {
            const key = makeKeyForItem(item, groupKey);
            if (!map[key]) map[key] = [];
            map[key].push(item);
        });
    });
    return map;
}

function normalizeListToTypes(list = [], fallbackKey = "default") {
    const map = {};
    list.forEach(n => {
        const key = makeKeyForItem(n, fallbackKey || undefined) || fallbackKey;
        if (!map[key]) map[key] = [];
        map[key].push(n);
    });
    return map;
}

export function normalizeNotifications(payload) {
    if (payload?.groups && Array.isArray(payload.groups)) {
        return buildFromGroups(payload.groups);
    } else if (Array.isArray(payload)) {
        return normalizeListToTypes(payload);
    } else if (payload?.postulationNotifications) {
        return normalizeListToTypes(payload.postulationNotifications, "postulation");
    } else if (payload?.stageNotifications) {
        return normalizeListToTypes(payload.stageNotifications, "stage");
    } else if (payload?.convocationNotifications) {
        return normalizeListToTypes(payload.convocationNotifications, "convocation");
    } else if (payload?.gestionnaireCvNotifications) {
        return normalizeListToTypes(payload.gestionnaireCvNotifications, "gestionnaire_cv");
    } else if (payload?.etudiantCvNotifications) {
        return normalizeListToTypes(payload.etudiantCvNotifications, "etudiant_cv");
    } else if (payload?.items && Array.isArray(payload.items)) {
        return normalizeListToTypes(payload.items);
    } else if (payload?.data && Array.isArray(payload.data)) {
        return normalizeListToTypes(payload.data);
    } else {
        return {};
    }
}