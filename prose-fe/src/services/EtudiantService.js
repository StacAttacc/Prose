import { http } from "./http.js";
import axios from "axios";

const CV_UPLOAD_URL = "/etudiant/televerser-cv";
const CV_DOWNLOAD_URL = "/etudiant/telecharger-cv";
const BASE_URL_ETUDIANT = "http://localhost:8080/etudiant";

export const televerserCv = async (cv, user) => {
    try{
        const dataToSend = new FormData();
        dataToSend.append('cv', cv);
        dataToSend.append("email", user.email);

        const { data } = await http.post(CV_UPLOAD_URL, dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });
        return data;
    } catch (e) {
        if (e.response) {
            console.error('Erreur:', e.response.data);
            throw new Error(e.response.data);
        } else if (e.request) {
            console.error('Requête erronée:', e.request);
            throw new Error('Aucune réponse du serveur. Veuillez réessayer plus tard.');
        } else {
            console.error('Erreur inconnue:', e.message);
            throw new Error(e.message || 'Une erreur inconue est survenue');
        }
    }
};

export const telechargerCv = async (email, token) => {
    try {
        const url = `${CV_DOWNLOAD_URL}/${encodeURIComponent(email)}`;

        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : undefined;

        const { data } = await http.get(url, config);
        return data;
    } catch (e) {
        if (e.response) {
            console.error("Erreur:", e.response.data);
            throw new Error(e.response.data);
        } else if (e.request) {
            console.error("Requête erronée:", e.request);
            throw new Error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
        } else {
            console.error("Erreur inconnue:", e.message);
            throw new Error(e.message || "Une erreur inconnue est survenue");
        }
    }
};

export const checkCvStatus = async () => {
    try {
        const { data } = await http.get("/etudiant/cv/status");
        return data;
    } catch (e) {
        console.error("Erreur lors de la vérification du CV:", e);
        throw e;
    }
};

export const getCvInfo = async () => {
    try {
        const { data } = await http.get("/etudiant/cv/info");
        return data;
    } catch (e) {
        console.error("Erreur lors de la récupération des infos du CV:", e);
        throw e;
    }
};

export const checkIfAlreadyApplied = async (stageId) => {
    try {
        const { data } = await http.get(`/etudiant/candidature/check/${stageId}`);
        return data;
    } catch (e) {
        console.error("Erreur lors de la vérification de la candidature:", e);
        throw e;
    }
};

export const submitCandidature = async (formData) => {
    try {
        const { data } = await http.post("/etudiant/candidature", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (e) {
        console.error("Erreur lors de la soumission de la candidature:", e);
        throw e;
    }
};

export const getMesCandidatures = async () => {
    try {
        const { data } = await http.get("/etudiant/candidatures");
        return data.data;
    } catch (e) {
        console.error("Erreur lors de la récupération des candidatures:", e);
        throw e;
    }
};

export const getEtudiantNotifications = async () => {
    try {
        const { data } = await http.get("/etudiant/notifications/all");
        return data;
    } catch (e) {
        console.error("Erreur lors de la récupération des notifications:", e);
        throw e;
    }
}

export async function markNotificationRead(notificationId, token) {
    try {
        const { data } = await http.put(
            `${BASE_URL_ETUDIANT}/notifications/read/${notificationId}`,
            { notificationId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return data;
    } catch (e) {
        console.error("Erreur lors du marquage de la notification comme lue:", e);
        throw e;
    }
}

export const markNotificationsRead = (notificationIds = [], token) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id, token)));
};
