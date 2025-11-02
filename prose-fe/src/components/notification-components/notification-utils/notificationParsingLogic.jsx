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
    const root = payload?.data ?? payload;

    if (root?.groups && Array.isArray(root.groups)) {
        return buildFromGroups(root.groups);
    } else if (Array.isArray(root)) {
        return normalizeListToTypes(root);
    } else if (root?.postulationNotifications) {
        return normalizeListToTypes(root.postulationNotifications, "postulation");
    } else if (root?.stageNotifications) {
        return normalizeListToTypes(root.stageNotifications, "stage");
    } else if (root?.convocationNotifications) {
        return normalizeListToTypes(root.convocationNotifications, "convocation");
    } else if (root?.gestionnaireCvNotifications) {
        return normalizeListToTypes(root.gestionnaireCvNotifications, "gestionnaire_cv");
    } else if (root?.etudiantCvNotifications) {
        return normalizeListToTypes(root.etudiantCvNotifications, "etudiant_cv");
    } else if (root?.items && Array.isArray(root.items)) {
        return normalizeListToTypes(root.items);
    } else if (root?.content && Array.isArray(root.content)) {
        return normalizeListToTypes(root.content);
    } else if (root?.page?.content && Array.isArray(root.page.content)) {
        return normalizeListToTypes(root.page.content);
    } else if (root?.data && Array.isArray(root.data)) {
        return normalizeListToTypes(root.data);
    } else {
        return {};
    }
}