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
        const response = await axios.get(`${BASE}/cv/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        return response.data;
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
            `${BASE}/cv/change-status`,
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
            `${BASE}/cv/change-status`,
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