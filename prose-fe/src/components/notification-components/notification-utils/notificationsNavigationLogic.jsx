export function getDefaultNavigationPath(user) {
    const role = typeof user === 'string' ? user : user.role;
    if (role === "GESTIONNAIRE") return "/gestionnaire/candidatures";
    if (role === "EMPLOYEUR") return `/employeur/posted-stages`;
    if (role === "ETUDIANT") return `etudiant/mon-cv`;
    return "/";
}

export function getNotificationNavigationPath(params) {
    // Support both old signature (notification, role) and new signature (object with role, notification, etc.)
    let notification, role, isGrouped, groupType;
    if (params && typeof params === 'object' && 'role' in params) {
        role = params.role;
        notification = params.notification;
        isGrouped = params.isGrouped;
        groupType = params.groupType;
    } else {
        // Old signature support
        notification = params;
        role = arguments[1];
    }
    
    const { stageId, candidatureId, etudiantId, cvId, convocation, candidatureResponseId, stageResponseId, candidatureDecisionId, signatureEntenteCandidatureId } = notification || {};
    const isCandidature = Boolean(notification?.candidature || notification?.candidatureId);
    const isEmployeurResponse = Boolean(candidatureResponseId || (notification?.candidatureId && notification?.hasOwnProperty('accepted')));

    if (role === "EMPLOYEUR") {
        if (isEmployeurResponse) {
            const candId = candidatureResponseId || candidatureId;
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
        // Notification de signature d'entente - naviguer vers les candidatures avec la candidature ouverte
        if (signatureEntenteCandidatureId || notification?.type === "signature_entente") {
            const candidatureId = signatureEntenteCandidatureId || notification?.signatureEntenteCandidatureId;
            if (candidatureId) {
                return {
                    path: getDefaultNavigationPath({ role }),
                    state: { 
                        openCandidatureId: candidatureId,
                        openTab: "APPROVED" // Ouvrir l'onglet APPROVED car l'entente est signée par étudiant et employeur
                    }
                };
            }
        }
        if (isCandidature && stageId) {
            return {
                path: getDefaultNavigationPath({ role }),
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
                path: getDefaultNavigationPath({ role }),
                state: { openEtudiantId: etudiantId }
            };
        }
        if (candidatureDecisionId) {
            return {
                path: getDefaultNavigationPath({ role }),
                state: { openEtudiantId: etudiantId }
            }
        }
    }

    return { path: getDefaultNavigationPath({ role }), state: null };
}

export function getGroupedNotificationNavigation(type, role) {
    if (role === "EMPLOYEUR") {
        if (type === "postulation")
        return {
            path: `/employeur/posted-stages`,
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
                path: getDefaultNavigationPath({ role }),
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
                path: getDefaultNavigationPath({ role }),
            };
        }
        if (type === "signature_entente") {
            return {
                path: getDefaultNavigationPath({ role }),
            };
        }
    }

    return { path: getDefaultNavigationPath({ role }), state: null };
}