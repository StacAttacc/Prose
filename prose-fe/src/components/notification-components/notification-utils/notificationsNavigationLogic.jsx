export function getDefaultNavigationPath(role) {
    if (role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (role === "EMPLOYEUR") return `/employeur/posted-stages`;
    if (role === "ETUDIANT") return `/etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath(notification, role) {
    if (role === "EMPLOYEUR") {
        if (notification.type === "etudiant_offre_decision") {
            return {
                path: `/employeur/stages/${notification.stageId}/candidatures`,
                state: { openCandidatureId: notification.etudiantOffreDecisionId }
            };
        }
        else if (notification.type === "postulation") {
            return {
                path: `/employeur/stages/${notification.stageId}/candidatures`,
                state: { openCandidatureId: notification.candidaturePostulationId }
            };
        }
        else if (notification.type === "signature_entente") {
            return {
                //TODO: Update path when employeur entente page is created
                path: getDefaultNavigationPath("EMPLOYEUR"),
            }
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
                state: { openCandidatureId: notification.candidatureDecisionId }
            }
        } else if (notification.type === "signature_entente") {
            return {
                //TODO: Update path when student entente page is created
                path: getDefaultNavigationPath("ETUDIANT"),
            }
        }
    }

    else if (role === "GESTIONNAIRE") {
        if (notification.type === "etudiant_offre_decision") {
            if (notification.etudiantOffreDecisionId) {
                return {
                    path: getDefaultNavigationPath(role),
                    state: { etudiantOffreDecisionId: notification.etudiantOffreDecisionId }
                };
            }
        }
        if (notification.type === "postulation") {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification.etudiantId }
            };
        }
        if (notification.type === "stage") {
            return {
                path: "/gestionnaire/list-stages",
                state: { openStageId: notification.stageId }
            };
        }
        if (notification.type === "gestionnaire_cv") {
            return {
                path: "/gestionnaire/gestion-cv",
                state: { openCvId: notification.cvId }
            };
        }
        if (notification.type === "convocation") {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification.etudiantId }
            };
        }
        if (notification.type === "candidature_decision") {
            return {
                path: getDefaultNavigationPath(role),
                state: { openEtudiantId: notification.etudiantId }
            }
        }
    }

    return { path: getDefaultNavigationPath(role), state: null };
}

export function getGroupedNotificationNavigation(type, role) {
    if (role === "EMPLOYEUR") {
        if (type === "postulation") {
            return {
                path: `/employeur/stages/posted-stages`,
            };
        } else if (type === "employeur_response") {
            return {
                path: `/employeur/posted-stages`,
            };
        } else if (type === "signature_entente") {
            return {
                //TODO: Update path when employeur entente page is created
                path: getDefaultNavigationPath("EMPLOYEUR"),
            }
        }
    }

    else if (role === "ETUDIANT") {
        if (type === "etudiant_cv") {
            return {
                path: `/etudiant/mon-cv`,
            };
        } else if (type === "convocation") {
            return {
                path: `/etudiant/stages/candidatures`,
            };
        } else if (type === "signature_entente") {
            return {
                //TODO: Update path when student entente page is created
                path: getDefaultNavigationPath("ETUDIANT"),
            };
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