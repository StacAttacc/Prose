import { http } from "./http.js";

const BASE_URL_PROFESSEUR = "http://localhost:8080/professeur";

/**
 * Évalue le milieu de travail pour une candidature
 * @param {Object} evaluation - Les données d'évaluation du milieu de travail
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object>} Réponse du serveur
 */
export async function evaluateWorkplace(evaluation, token) {
    try {
        const res = await http.post(`${BASE_URL_PROFESSEUR}/evaluate`, evaluation, {
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

/**
 * Récupère toutes les candidatures des étudiants associés au professeur
 * @param {string} professeurId - ID du professeur
 * @param {string} year - Année de la session (optionnel)
 * @param {string} token - Token d'authentification
 * @returns {Promise<Array>} Liste des candidatures
 */
export async function getCandidaturesProfesseur(professeurId, year, token) {
    try {
        const params = {};
        if (year) {
            params.year = year;
        }
        
        const res = await http.get(`${BASE_URL_PROFESSEUR}/${professeurId}/mes-etudiants-candidatures`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params
        });
        
        // ReturnEntityDTO structure: { message: "...", data: [...] }
        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        throw error;
    }
}

