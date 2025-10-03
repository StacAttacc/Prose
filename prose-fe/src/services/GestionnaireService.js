import axios from "axios";

const BASE_URL_GESTIONNAIRE = 'http://localhost:8080/gestionnaire';

export const fetchAllPendingCvs = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL_GESTIONNAIRE}/cv/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('There was an error fetching the pending CVs!', error);
        return [];
    }
};

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
        console.error('Error approving CV:', error);
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
