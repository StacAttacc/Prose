import axios from "axios";

const BASE_URL_PROFESSEUR = "http://localhost:8080/professeur";

export async function evaluateWorkplace(candidatureId, evaluation, token) {
    try {
        evaluation = {
            ...evaluation,
            'candidatureId': candidatureId,
        }

        const res = await axios.post(`${BASE_URL_PROFESSEUR}/evaluate`, evaluation, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        console.error('Erreur lors de l\'évaluation du milieu de travail:', error);
        throw error;
    }
}

export async function getCandidaturesProfesseur(professeurId, year, token) {
    try {
        const params = {};
        if (year) {
            params.year = year;
        }
        
        const res = await axios.get(`${BASE_URL_PROFESSEUR}/${professeurId}/mes-etudiants-candidatures`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params
        });
        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        throw error;
    }
}

export async function getEtudiantsProfesseur(professeurId, year, token) {
    try {
        const params = {};
        if (year && year !== '') {
            params.year = year.toString();
        }

        console.log(token)

        const res = await axios.get(`${BASE_URL_PROFESSEUR}/${professeurId}/getCandidatures`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params
        });
        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        throw error;
    }
}

