export function getDefaultNavigationPath(role) {
    if (role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (role === "EMPLOYEUR") return `/employeur/posted-stages`;
    if (role === "ETUDIANT") return `/etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath(notification, role) {
    const {
        stageId,
        candidatureId,
        etudiantId,
        cvId,
        convocation,
        stageResponseId,
        etudiantOffreDecisionId
    } = notification;
    const isCandidature = Boolean(notification?.candidature || notification?.candidatureId);
    const isEtudiantOffreDecision = Boolean(etudiantOffreDecisionId);

    if (role === "EMPLOYEUR") {
        if (isEtudiantOffreDecision) {
            const candId = etudiantOffreDecisionId;
            const stage = stageResponseId || stageId;

            if (stage && candId) {
                return {
                    path: `/employeur/stages/${stage}/candidatures`,
                    state: { openCandidatureId: candId }
                };
            }
            return {
                path: `/employeur/posted-stages`,
            };
        }

        else if (isCandidature && stageId && candidatureId) {
            return {
                path: `/employeur/stages/${stageId}/candidatures`,
                state: { openCandidatureId: candidatureId }
            };
        }
    }

    else if (role === "ETUDIANT") {
        if (notification.type === "etudiant_cv") {
            return {
                path: `/etudiant/mon-cv`,
            }
        } else if (notification.type === "convocation") {
            return {
                path: `/etudiant/stages/candidatures`,
                state: { openCandidatureId: notification.convocation }
            }
        } else if (notification.type === "candidature_decision") {
            return {
                path: `/etudiant/stages/candidatures`,
                state: { openCandidatureId: notification.candidatureDecisionId}
            }
        }
    }

    else if (role === "GESTIONNAIRE") {
        if (notification.type === "employeur_response") {
            if (etudiantOffreDecisionId) {
                return {
                    path: getDefaultNavigationPath(role),
                    state: { etudiantOffreDecisionId: etudiantOffreDecisionId }
                };
            }
        }
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
        if (notification.type === "candidature_decision") {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: etudiantId }
            }
        }
    }

    return { path: getDefaultNavigationPath(role), state: null };
}

export function getGroupedNotificationNavigation(type, role) {
    if (role === "EMPLOYEUR") {
        if (type === "postulation")
        return {
            path: `/employeur/stages/posted-stages`,
        };
        if (type === "employeur_response")
        return {
            path: `/employeur/posted-stages`,
        };
    }

    else if (role === "ETUDIANT") {
        if (type === "etudiant_cv") {
            return {
                path: `/etudiant/mon-cv`,
            }
        } else if (type === "convocation") {
            return {
                path: `/etudiant/stages/candidatures`,
            }
        }
    }

    else if (role === "GESTIONNAIRE") {
        if (type === "postulation") {
            return {
                path: getDefaultNavigationPath(role),
            };
        }
        if (type === "stage") {
            return {
                path: "/gestionnaire/list-stages",
            };
        }
        if (type === "gestionnaire_cv") {
            return {
                path: "/gestionnaire/gestion-cv",
            };
        }
        if (type === "convocation") {
            return {
                path: getDefaultNavigationPath(role),
            };
        }
    }

    return { path: getDefaultNavigationPath(role), state: null };
}