 function buildFromGroups(groups = []) {
    const map = {};
    groups.forEach(g => {
        const items = Array.isArray(g.items) ? g.items : [];
        items.forEach(item => {
            const key = g?.typeKey;
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