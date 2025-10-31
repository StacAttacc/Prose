export function getDefaultNavigationPath(user) {
    if (user.role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (user.role === "EMPLOYEUR") return `/employeur/posted-stages`;
    if (user.role === "ETUDIANT") return `etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath(notification, role) {
    const { stageId, candidatureId, etudiantId, cvId, convocation } = notification;
    const isCandidature = Boolean(notification?.candidature || notification?.candidatureId);

    if (role === "EMPLOYEUR" && isCandidature && stageId) {
        return {
            path: `/employeur/stages/${stageId}/candidatures`,
            state: { openCandidatureId: candidatureId }
        };
    }

    if (role === "GESTIONNAIRE") {
        if (isCandidature && stageId) {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: etudiantId }
            };
        }
        if (stageId) {
            return {
                path: "/gestionnaire/list-stages",
                state: { openStageId: stageId }
            };
        }
        if (!stageId && cvId) {
            return {
                path: "/gestionnaire/gestion-cv",
                state: { openCvId: cvId }
            };
        }
        if (convocation) {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: etudiantId }
            };
        }
    }

    return { path: getDefaultNavigationPath(role), state: null };
}