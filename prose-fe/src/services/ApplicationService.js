import axios from "axios";


const BASE_URL = "http://localhost:8080";


export async function getStageApplicants(stageId, token) {
    const {data} = await axios.get(`${BASE_URL}/employeur/stages/${stageId}/candidatures`, {
        headers: {'Authorization': `Bearer ${token}`}
    });
    return data;
}


export async function updateApplicantStatus(stageId, applicantId, status, token, rejectionReason) {
    const payload = {status, rejectionReason};
    const {data} = await axios.patch(`${BASE_URL}/employeur/stages/${stageId}/candidatures/${applicantId}`, payload, {
        headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'}
    });
    return data;
}