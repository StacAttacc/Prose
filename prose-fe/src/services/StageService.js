import axios from "axios";

const url = "http://localhost:8080";

export async function createStage(stage, token) {
    await axios.post(url + "/employeur/createStage", stage, {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    });
}

export async function getEmployeurStages(email, token, year = null) {
    const params = {};
    if (year) {
        params.year = year;
    }
    
    const {data} = await axios.get(`${url}/employeur/${email}/stages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: params
    })

    return data;
}

export async function getEtudiantStages(token) {
    const {data} = await axios.get(`${url}/etudiant/stages/approuves`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return data;
}