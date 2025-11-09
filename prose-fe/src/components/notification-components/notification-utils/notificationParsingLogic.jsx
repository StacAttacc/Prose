function makeKeyForItem(item = {}, groupKey) {
    if (item?.convocation) return "convocation";
    else if (item?.candidatureResponseId || (item?.candidatureId && item?.hasOwnProperty('accepted'))) return "employeur_response";
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
        const groupKey = g?.typeKey;
        items.forEach(item => {
            const key = makeKeyForItem(item, groupKey);
            if (!map[key]) map[key] = [];
            map[key].push(item);
        });
    });
    return map;
}

export function normalizeNotifications(payload) {
    const root = payload?.data;
    if (Array.isArray(root?.groups)) {
        return buildFromGroups(root.groups);
    }
    return {};
}