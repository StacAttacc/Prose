import axios from "axios";

const BASE_URL = "http://localhost:8080";

export async function login(email, password) {
    const {data} = await axios.post(BASE_URL + "/user/login", {email, password});
    return data.data;
}

export async function registerEmployeur(payload) {
    const {data} = await axios.post(BASE_URL + "/employeur/register", payload);
    return data.data;
}

export async function registerEtudiant(payload) {
    const {data} = await axios.post(BASE_URL + "/etudiant/register", payload);
    return data.data;
}

export async function logout() {
    sessionStorage.removeItem("user");
}

export async function getPDFEntente(ententeID, token) {
    const {data} = await axios.get(`${BASE_URL}/user/${ententeID}/pdf`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data.data;
}