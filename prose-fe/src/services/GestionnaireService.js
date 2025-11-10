import axios from "axios";

const BASE_URL_GESTIONNAIRE = "http://localhost:8080/gestionnaire";

export async function submitStageDecision(id, {approved, reason}, token) {
    const endpoint = approved ? `${BASE_URL_GESTIONNAIRE}/stages/${id}/approuver` : `${BASE_URL_GESTIONNAIRE}/stages/${id}/rejeter`;
    const body = approved ? {} : {reason};

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
            {id: cvId, status: "Approved", comment: comment},
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
            {id: cvId, status: "Rejected", comment: comment},
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

export async function markNotificationRead(notificationId, token) {
    return await axios.put(
        `${BASE_URL_GESTIONNAIRE}/notifications/read/${notificationId}`,
        {notificationId},
        {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        }
    );
}

export const markNotificationsRead = (notificationIds = [], token) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return Promise.resolve();
    }
    return Promise.all(notificationIds.map(id => markNotificationRead(id, token)));
};

export async function getAllStages(token, year = null) {
    const params = {};
    if (year && year !== null && year !== undefined && year !== '') {
        params.year = year.toString();
    }
    const url = `${BASE_URL_GESTIONNAIRE}/stages`;
    console.log('Calling getAllStages - URL:', url, 'params:', params, 'year value:', year, 'year type:', typeof year);
    const {data} = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: params
    });
    console.log('Backend response - number of stages:', data?.data?.length);
    if (data?.data && data.data.length > 0) {
        const years = data.data.map(s => s.startDate ? new Date(s.startDate).getFullYear() : 'N/A');
        console.log('Years in returned stages:', [...new Set(years)]);
    }
    return data;
}

export async function getGestionnaireNotifications(token) {
    const {data} = await axios.get(`${BASE_URL_GESTIONNAIRE}/notifications/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(data);
    return data;
}


export async function getStageDetailsByApplication(applicationId, token) {
    const res = await fetch(`${BASE_URL_GESTIONNAIRE}/applications/${applicationId}/stage`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function getStageApplicantsManager(token, year = null) {
    try {
        const params = {};
        if (year && year !== null && year !== undefined && year !== '') {
            params.year = year.toString();
        }
        
        const res = await axios.get(`${BASE_URL_GESTIONNAIRE}/getCandidatures`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            params: params
        });

        const data = res.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Erreur getStageApplicantsManager:", e);
        return [];
    }
}

export async function generateEntente(candidatureId, token) {
    const BASE_URL_GESTIONNAIRE = "http://localhost:8080/gestionnaire";
    const url = `${BASE_URL_GESTIONNAIRE}/candidatures/${candidatureId}/generer-entente`;
    const res = await axios.post(url, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    return res?.data?.data ?? res?.data;
}
