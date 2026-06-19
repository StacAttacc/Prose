import axios from "axios";
import {API_BASE, setAccessToken} from "./http.js";

export async function login(email, password) {
    const {data} = await axios.post(API_BASE + "/user/login", {email, password});
    return data.data;
}

export async function registerEmployeur(payload) {
    const {data} = await axios.post(API_BASE + "/employeur/register", payload);
    return data.data;
}

export async function registerEtudiant(payload) {
    const {data} = await axios.post(API_BASE + "/etudiant/register", payload);
    return data.data;
}

export async function logout() {
    sessionStorage.removeItem("user");
    setAccessToken(null);
}

export async function getPDFEntente(ententeID, token) {
    const {data} = await axios.get(`${API_BASE}/user/${ententeID}/pdf`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data.data;
}