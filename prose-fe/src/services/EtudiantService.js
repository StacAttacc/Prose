import { http } from "./http.js";

const CV_UPLOAD_URL = "/etudiant/televerser-cv";
const CV_DOWNLOAD_URL = "/etudiant/telecharger-cv";

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

export const telechargerCv = async (email) => {
    try {
        const { data } = await http.get(`${CV_DOWNLOAD_URL}/${encodeURIComponent(email)}`);
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

export async function getEtudiantStages() {
    const {data} = await http.get(`/etudiant/stages/approuves`);
    return data;
}

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

export async function checkEntenteExists(candidatureId, token) {
    try {
        const res = await http.get(`/etudiant/candidatures/${candidatureId}/entente`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return { exists: true, data: res.data?.data || res.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { exists: false };
        }
        throw error;
    }
}

export async function signEntente(ententeId, password) {
    const res = await http.put(`/etudiant/ententes/${ententeId}/signer`, {password});

    return res.data;
}

export const getMesCandidatures = async () => {
    try {
        const { data } = await http.get("/etudiant/candidatures");
        return data.data;
    } catch (e) {
        console.error("Erreur lors de la récupération des candidatures:", e);
        throw e;
    }
};

export async function getEtudiantNotifications() {
    try {
        const { data } = await http.get("/etudiant/notifications/all");

        return data;
    } catch (e) {
        console.error("Erreur lors de la récupération des notifications:", e);
        throw e;
    }
}

export async function markNotificationRead(notificationId) {
    try {
        const { data } = await http.put(
            `/etudiant/notifications/read/${notificationId}`,
            { notificationId });
        return data;
    } catch (e) {
        console.error("Erreur lors du marquage de la notification comme lue:", e);
        throw e;
    }
}

export const markNotificationsRead = (notificationIds = []) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id)));
};

export const respondToOffer = async (candidatureId, accepted, comment = "") => {
    try {
        const { data } = await http.put("/etudiant/candidatures/respond", {
            candidatureId: candidatureId,
            accepted: accepted,
            comment: comment
        });
        return data;
    } catch (e) {
        console.error("Erreur lors de la réponse à l'offre:", e);
        throw e;
    }
};
