import axios from 'axios';

const BASE_URL = 'http://localhost:8080/gestionnaire';

export const fetchAllPendingCvs = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/cv/pending`, {
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
        await axios.post(`${BASE_URL}/cv/${cvId}/approve`, {
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
        await axios.post(`${BASE_URL}/cv/${cvId}/reject`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    } catch (error) {
        console.error('Error rejecting CV:', error);
    }
};