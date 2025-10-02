import axios from "axios";

const CV_UPLOAD_URL = "http://localhost:8080/etudiant/televerser-cv";
const CV_DOWNLOAD_URL = "http://localhost:8080/etudiant/telecharger-cv";
const BASE_URL_GESTIONNAIRE = 'http://localhost:8080/gestionnaire';

export const televerserCv = async (cv, user) => {
    try{
        const dataToSend = new FormData();
        dataToSend.append('cv', cv);
        dataToSend.append("email", user.data.email);

        const { data } = await axios.post(CV_UPLOAD_URL, dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${user.data.token}`
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

export const telechargerCv = async (email, user) => {
    try {
        const response = await axios.get(`${CV_DOWNLOAD_URL}/${email}`, {
            headers: {
                'Authorization': `Bearer ${user.data.token}`
            }
        });

        console.log(response);

        return response.data;
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

export const fetchAllPendingCvs = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL_GESTIONNAIRE}/cv/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the pending CVs!', error);
        return [];
    }
};

export const approveCv = async (cvId, token) => {
    try {
        await axios.post(`${BASE_URL_GESTIONNAIRE}/cv/${cvId}/approve`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error approving CV:', error);
    }
};

export const rejectCv = async (cvId, token) => {
    try {
        await axios.post(`${BASE_URL_GESTIONNAIRE}/cv/${cvId}/reject`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error rejecting CV:', error);
    }
};
