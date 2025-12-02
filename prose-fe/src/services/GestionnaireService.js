import {http} from "./http.js";

export async function submitStageDecision(id, {approved, reason}) {
    const endpoint = approved ? `/gestionnaire/stages/${id}/approuver` : `/gestionnaire/stages/${id}/rejeter`;
    const body = approved ? {} : {reason};

    const res = await http.put(endpoint, body);
    return res.data;
}

export const fetchAllCVs = async (token, year = null) => {
    try {
        const params = {};
        if (year && year !== "") {
            params.year = year.toString();
        }

        const response = await http.get(`/gestionnaire/cv/all`, {params: params});
        return Array.isArray(response.data) ? response.data : response.data.content;
    } catch (error) {
        if (error.response) {
            console.error('Erreur:', error.response.data);
            throw new Error(error.response.data);
        }
    }
}

export const approveCv = async (cvId, comment) => {
    try {
        await http.post(`/gestionnaire/cv/change-status`, {id: cvId, status: "Approved", comment: comment});
    } catch (error) {
        console.error('Error approving CV:', error.response.data);
    }
};

export const rejectCv = async (cvId, comment) => {
    try {
        console.log(comment)
        await http.post(`/gestionnaire/cv/change-status`, {id: cvId, status: "Rejected", comment: comment});
    } catch (error) {
        console.error('Error rejecting CV:', error);
    }
};

export async function markNotificationRead(notificationId) {
    await http.put(`/gestionnaire/notifications/read/${notificationId}`, {notificationId});
}

export const markNotificationsRead = (notificationIds = []) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id)));
};

export async function getAllStages(token, year = null) {
    const params = {};
    if (year && year !== '') {
        params.year = year.toString();
    }


    const {data} = await http.get("/gestionnaire/stages", {
        params: params
    });

    return data;
}

export async function getGestionnaireNotifications() {
    const {data} = await http.get(`/gestionnaire/notifications/all`);
    return data;
}

export async function getStageApplicantsManager(token, year = null) {
    try {
        const params = {};
        if (year && year !== '') {
            params.year = year.toString();
        }
        
        const res = await http.get(`/gestionnaire/getCandidatures`, {params: params});

        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Erreur getStageApplicantsManager:", e);
        return [];
    }
}

export async function generateEntente(candidatureId) {
    const res = await http.post(`/gestionnaire/candidatures/${candidatureId}/generer-entente`, {});

    return res?.data?.data ?? res?.data;
}

export async function checkEntenteExists(candidatureId) {
    try {
        const res = await http.get(`/gestionnaire/candidatures/${candidatureId}/entente`);
        return { exists: true, data: res.data?.data || res.data };
    } catch (error) {
        if (error.response?.status === 404) {
            return { exists: false };
        }
        throw error;
    }
}

export async function signEntente(ententeId, password) {
    const res = await http.put(`/gestionnaire/ententes/${ententeId}/signer`,{ password });

    return res.data;
}

export async function associerProfesseurEtudiant(professeurEmail, etudiantEmail) {
    try {
        const res = await http.post(
            `/gestionnaire/associate-professeur`,
            {
                etudiantEmail: etudiantEmail,
                professeurEmail: professeurEmail
            },
        );

        return res.data;
    } catch (error) {
        console.error('Erreur lors de l\'association:', error);
        throw error;
    }
}

export async function getAllEtudiants() {
    try {
        const res = await http.get("/gestionnaire/etudiants/all");


        return res.data?.data || res.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error);
        console.error('Error response:', error?.response?.data);
        console.error('Error status:', error?.response?.status);
        console.error('Error message:', error?.message);
        throw error;
    }
}

export async function getAllProfesseurs() {
    try {
        const res = await http.get("/gestionnaire/professeurs/all");

        return res.data?.data || res.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des professeurs:', error);
        console.error('Error response:', error?.response?.data);
        console.error('Error status:', error?.response?.status);
        console.error('Error message:', error?.message);
        throw error;
    }
}

export async function createProfesseur(professeurData, token) {
    try {
        
        const res = await http.post("/gestionnaire/professeurs/create", professeurData);

        return res.data;
    } catch (error) {
        console.error('Erreur lors de la création du professeur:', error);
        console.error('Token utilisé:', token ? 'Token présent' : 'Token manquant - utilisation de http');
        console.error('Response:', error?.response?.data);
        console.error('Status:', error?.response?.status);
        throw error;
    }
}

export async function assignStageToStudent(etudiantEmail, stageId, comment) {
    try {
        const res = await http.post("/gestionnaire/stages/assign", {
            etudiantEmail,
            stageId,
            comment: comment || null
        });

        return res.data?.data || res.data;
    } catch (error) {
        console.error('Erreur lors de l\'attribution du stage:', error);
        console.error('Error response:', error?.response?.data);
        console.error('Error status:', error?.response?.status);
        throw error;
    }
}