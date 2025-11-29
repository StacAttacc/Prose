import {
    getGestionnaireNotifications,
    markNotificationRead as markNotificationReadGestionnaire,
    markNotificationsRead as markNotificationsReadGestionnaire
} from "../../../services/GestionnaireService.js";
import {
    getEmployeurNotifications,
    markNotificationRead as markNotificationReadEmployeur,
    markNotificationsRead as markNotificationsReadEmployeur
} from "../../../services/EmployeurService.js";
import {
    getEtudiantNotifications,
    markNotificationRead as markNotificationReadEtudiant,
    markNotificationsRead as markNotificationsReadEtudiant
} from "../../../services/EtudiantService.js";

export async function fetchNotifications(user) {
    switch (user.role) {
        case "GESTIONNAIRE":
            return await getGestionnaireNotifications(user.token);
        case "EMPLOYEUR":
            return await getEmployeurNotifications(user.token);
        case "ETUDIANT":
            return await getEtudiantNotifications();
        default:
            return null;
    }
}

export async function markSingleNotificationAsRead(id, user) {
    if (!id) return;
    switch (user.role) {
        case "GESTIONNAIRE":
            await markNotificationReadGestionnaire(id, user.token);
            break;
        case "EMPLOYEUR":
            await markNotificationReadEmployeur(id, user.token);
            break;
        case "ETUDIANT":
            await markNotificationReadEtudiant(id);
            break;
        default:
            break;
    }
}

export async function markManyNotifications(user, ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    switch (user.role) {
        case "GESTIONNAIRE":
            await markNotificationsReadGestionnaire(ids, user.token);
            break;
        case "EMPLOYEUR":
            await markNotificationsReadEmployeur(ids, user.token);
            break;
        case "ETUDIANT":
            await markNotificationsReadEtudiant(ids);
            break;
        default:
            break;
    }
}