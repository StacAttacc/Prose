import axios from "axios";

const url = "http://localhost:8080";

export async function getEtudiantStages(token) {
    const {data} = await axios.get(`${url}/etudiant/stages/approuves`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    return data;
}