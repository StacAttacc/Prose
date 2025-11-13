import {
    getGestionnaireNotifications,
    markNotificationRead as markNotificationReadGestionnaire,
    markNotificationsRead as markNotificationsReadGestionnaire
} from "../../../services/GestionnaireService.js";
import {
    getEmployeurCandidatureNotifications,
    getEmployeurResponseNotifications,
    markNotificationRead as markNotificationReadEmployeur,
    markNotificationsRead as markNotificationsReadEmployeur
} from "../../../services/EmployeurService.js";
import {
    getEtudiantNotifications,
    markNotificationRead as markNotificationReadEtudiant,
    markNotificationsRead as markNotificationsReadEtudiant
} from "../../../services/EtudiantService.js";

export async function fetchNotifications(user) {
    if (user.role === "GESTIONNAIRE") {
        return await getGestionnaireNotifications(user.token);
    } else if (user.role === "EMPLOYEUR") {
        try {
            const [candidatureNotifs, responseNotifs] = await Promise.allSettled([
                getEmployeurCandidatureNotifications(user.email, user.token),
                getEmployeurResponseNotifications(user.email, user.token)
            ]);

            const allGroups = [
                ...(candidatureNotifs.status === 'fulfilled' ? (candidatureNotifs.value?.data?.groups || []) : []),
                ...(responseNotifs.status === 'fulfilled' ? (responseNotifs.value?.data?.groups || []) : [])
            ];

            const totalCount = allGroups.reduce((sum, group) => sum + (group?.items?.length || 0), 0);

            return {
                data: {
                    groups: allGroups,
                    totalCount: totalCount
                }
            };
        } catch (err) {
            console.error("Error fetching employer notifications:", err);
            return {
                data: {
                    groups: [],
                    totalCount: 0
                }
            };
        }
    } else if (user.role === "ETUDIANT") {
        return await getEtudiantNotifications(user.token);
    } else return null;
}

export async function markSingleNotificationAsRead(id, user) {
    if (!id) return;
    if (user.role === "GESTIONNAIRE") {
        await markNotificationReadGestionnaire(id, user.token);
    } else if (user.role === "EMPLOYEUR") {
        await markNotificationReadEmployeur(id, user.token);
    } else if (user.role === "ETUDIANT") {
        await markNotificationReadEtudiant(id, user.token);
    }
}

export async function markManyNotifications(user, ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    if (user.role === "GESTIONNAIRE") {
        await markNotificationsReadGestionnaire(ids, user.token);
    } else if (user.role === "EMPLOYEUR") {
        await markNotificationsReadEmployeur(ids, user.token);
    } else if (user.role === "ETUDIANT") {
        await markNotificationsReadEtudiant(ids, user.token);
    }
}