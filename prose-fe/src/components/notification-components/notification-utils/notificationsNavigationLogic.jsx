export function getDefaultNavigationPath(role) {
    if (role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (role === "EMPLOYEUR") return `/employeur/posted-stages`;
    if (role === "ETUDIANT") return `/etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath({role, notification = null, isGrouped = false, groupType = null}) {
    let type;
    if (isGrouped === true && groupType != null) {
        type = groupType;
    } else if (notification != null && notification.type) {
        type = notification.type;
    } else {
        return {
            path: getDefaultNavigationPath(role)
        };
    }
    if (role === "EMPLOYEUR") {
        return getEmployeurPaths({role, notification, isGrouped, type});
    } else if (role === "ETUDIANT") {
        return getEtudiantPaths({role, notification, isGrouped, type});
    } else if (role === "GESTIONNAIRE") {
        return getGestionnairePaths({role, notification, isGrouped, type});
    } else {
        return {
            path: "/login"
        };
    }
}

function getEmployeurPaths({role, notification = null, isGrouped = false, type}) {
    switch (type) {
        case "etudiant_offre_decision":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: `/employeur/stages/${notification?.stageId}/candidatures`,
                state: { openCandidatureId: notification?.etudiantOffreDecisionId }
            };
        case "postulation":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: `/employeur/stages/${notification?.stageId}/candidatures`,
                state: { openCandidatureId: notification?.candidaturePostulationId }
            };
        case "signature_entente":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : notification?.stageId ? {
                path: `/employeur/stages/${notification.stageId}/candidatures`,
                state: { openEntenteId: notification?.signatureEntenteCandidatureId }
            } : {
                path: getDefaultNavigationPath(role),
            };
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}

function getEtudiantPaths({role, notification = null, isGrouped = false, type}) {
    switch (type) {
        case "etudiant_cv":
            return {
                path: `/etudiant/mon-cv`,
            };
        case "convocation":
            return isGrouped ? {
                path: `/etudiant/stages/candidatures`,
            } : {
                path: `/etudiant/stages/candidatures`,
                state: { openCandidatureId: notification?.convocation }
            };
        case "candidature_decision":
            return isGrouped ? {
                path: `/etudiant/stages/candidatures`,
            } : {
                path: `/etudiant/stages/candidatures`,
                state: { openCandidatureId: notification?.candidatureDecisionId }
            };
        case "signature_entente":
            return isGrouped ? {
                path: `/etudiant/stages/candidatures`,
            } : {
                path: `/etudiant/stages/candidatures`,
                state: { openEntenteId: notification?.signatureEntenteCandidatureId }
            };
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}

function getGestionnairePaths({role, notification = null, isGrouped = false, type}) {
    switch (type) {
        case "etudiant_offre_decision":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { etudiantOffreDecisionId: notification?.etudiantOffreDecisionId }
            };
        case "postulation":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification?.etudiantId }
            };
        case "stage":
            return isGrouped ? {
                path: "/gestionnaire/list-stages"
            } : {
                path: "/gestionnaire/list-stages",
                state: { openStageId: notification?.stageId }
            };
        case "gestionnaire_cv":
            return isGrouped ? {
                path: "/gestionnaire/gestion-cv",
            } : {
                path: "/gestionnaire/gestion-cv",
                state: { openCvId: notification?.cvId }
            };
        case "convocation":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification?.etudiantId }
            };
        case "candidature_decision":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification?.etudiantId }
            };
        case "signature_entente":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { 
                    openCandidatureId: notification?.signatureEntenteCandidatureId,
                    openTab: "APPROVED" // Ouvrir l'onglet APPROVED car l'entente est signée par étudiant et employeur
                }
            };
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}
