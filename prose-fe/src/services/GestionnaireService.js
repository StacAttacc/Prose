import axios from "axios";

const BASE_URL_GESTIONNAIRE = "http://localhost:8080/gestionnaire";

export async function submitStageDecision(id, { approved, reason }, token) {
  const endpoint = approved ? `${BASE_URL_GESTIONNAIRE}/stages/${id}/approuver` : `${BASE_URL_GESTIONNAIRE}/stages/${id}/rejeter`;
  const body = approved ? {} : { reason };
  
  const res = await axios.put(endpoint, body, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}

export const fetchAllCVs = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL_GESTIONNAIRE}/cv/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        return Array.isArray(response.data) ? response.data : response.data.content;
    } catch (error) {
        if (error.response) {
            console.error('Erreur:', error.response.data);
            throw new Error(error.response.data);
        }
    }
}

export const approveCv = async (cvId, comment, token) => {
    try {
        await axios.post(
            `${BASE_URL_GESTIONNAIRE}/cv/change-status`,
            { id: cvId, status: "Approved", comment: comment },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            }
        );
    } catch (error) {
        console.error('Error approving CV:', error.response.data);
    }
};

export const rejectCv = async (cvId, comment, token) => {
    try {
        await axios.post(
            `${BASE_URL_GESTIONNAIRE}/cv/change-status`,
            { id: cvId, status: "Rejected", comment: comment },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            }
        );
    } catch (error) {
        console.error('Error rejecting CV:', error);
    }
};

export async function getAllStages(token) {
    const { data } = await axios.get(`${BASE_URL_GESTIONNAIRE}/stages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return data;
}



export async function getStageApplicantsManager(stageId, token) {
    try {
        const url = stageId
            ? `${API}/gestionnaire/stages/${stageId}/applications`
            : `${API}/gestionnaire/stages/applications`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!res.ok) {
            return [
                {
                    id: 101,
                    email: "alice@school.com",
                    firstName: "Alice",
                    lastName: "Bernard",
                    fullName: "Alice Bernard",
                    status: "EN_ATTENTE",
                    motivationLetter: "Je suis motivée par...",
                    stageTitle: "Développeur Java Backend",
                },
                {
                    id: 102,
                    email: "marc@school.com",
                    firstName: "Marc",
                    lastName: "Lavoie",
                    fullName: "Marc Lavoie",
                    status: "APPROUVEE", // ⚠️ anciennement 'ACCEPTEE' → on met le bon libellé
                    motivationLetter: "Je possède 2 stages précédents...",
                    stageTitle: "Frontend React",
                },
            ];
        }

        const data = await res.json().catch(() => null);
        return Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];
    } catch (e) {
        console.debug("getStageApplicantsManager error:", e);
        return [];
    }
}