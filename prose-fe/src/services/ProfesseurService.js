import {http} from "./http.js";

export async function evaluateWorkplace(candidatureId, evaluation) {
    try {
        evaluation = {
            ...evaluation,
            'candidatureId': candidatureId,
        }

        const res = await http.post(`/professeur/evaluate`, evaluation);
        return res.data;
    } catch (error) {
        console.error('Erreur lors de l\'évaluation du milieu de travail:', error);
        throw error;
    }
}

export async function getCandidaturesProfesseur(professeurId, year) {
    try {
        const params = {};
        if (year) {
            params.year = year;
        }
        
        const res = await http.get(`/professeur/${professeurId}/mes-etudiants-candidatures`, {params: params});
        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        throw error;
    }
}

export async function getEtudiantsProfesseur(professeurId, year) {
    try {
        const params = {};
        if (year && year !== '') {
            params.year = year.toString();
        }

        const res = await http.get(`/professeur/${professeurId}/getCandidatures`, {params: params});
        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        throw error;
    }
}

