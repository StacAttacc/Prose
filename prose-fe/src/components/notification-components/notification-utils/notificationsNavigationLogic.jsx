export function getDefaultNavigationPath(role) {
    if (role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (role === "EMPLOYEUR") return `/employeur/stages/posted-stages`;
    if (role === "ETUDIANT") return `/etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath({role, notification = null, isGrouped, groupType}) {
    if (role === "EMPLOYEUR") {
        return getEmployeurPaths({role, notification, isGrouped, type: groupType});
    } else if (role === "ETUDIANT") {
        return getEtudiantPaths({role, notification, isGrouped, type: groupType});
    } else if (role === "GESTIONNAIRE") {
        return getGestionnairePaths({role, notification, isGrouped, type: groupType});
    } else {
        return {
            path: "/login"
        };
    }
}

function getEmployeurPaths({role, notification = null, isGrouped, type}) {
    switch (type) {
        case "etudiant_offre_decision":
        case "postulation":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: `/employeur/stages/${notification?.stageId}/candidatures`,
                state: { openCandidatureId: notification?.candidatureId }
            };
        case "signature_entente":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: `/employeur/stages/${notification.stageId}/candidatures`,
                state: { openEntenteId: notification?.candidatureId }
            };
        case "demande_approbation_stage":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { openDemandeApprobationStageId: notification?.stageId }
            }
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}

function getEtudiantPaths({role, notification = null, isGrouped, type}) {
    switch (type) {
        case "cv_decision":
            return {
                path: `/etudiant/mon-cv`,
            };
        case "convocation":
        case "assignation":
        case "candidature_decision":
            return isGrouped ? {
                path: `/etudiant/stages/candidatures`,
            } : {
                path: `/etudiant/stages/candidatures`,
                state: { openCandidatureId: notification?.candidatureId }
            };
        case "signature_entente":
            return isGrouped ? {
                path: `/etudiant/stages/candidatures`,
            } : {
                path: `/etudiant/stages/candidatures`,
                state: { openEntenteId: notification?.candidatureId }
            };
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}

function getGestionnairePaths({role, notification = null, isGrouped, type}) {
    switch (type) {
        case "etudiant_offre_decision":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { etudiantOffreDecisionId: notification?.candidatureId }
            };
        case "postulation":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification?.etudiantId }
            };
        case "creation_stage":
            return isGrouped ? {
                path: "/gestionnaire/list-stages"
            } : {
                path: "/gestionnaire/list-stages",
                state: { openStageId: notification?.stageId }
            };
        case "new_cv":
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
        case "gestionnaire_entente":
            return isGrouped ? {
                path: getDefaultNavigationPath(role),
            } : {
                path: getDefaultNavigationPath(role),
                state: { 
                    openCandidatureId: notification?.candidatureId,
                    openTab: "APPROVED"
                }
            };
        default:
            return {
                path: getDefaultNavigationPath(role),
            };
    }
}
