import { http, setAccessToken } from "./http";

export async function login(email, password) {
    const { data } = await http.post("/user/login", { email, password });
    console.log(data.data);
    return data.data;
}

export async function registerEmployeur(payload) {
    const { data } = await http.post("/employeur/register", payload);
    setAccessToken(data.token);
    return data.data;
}

export async function registerEtudiant(payload) {
    const { data } = await http.post("/etudiant/register", payload);
    setAccessToken(data.token);
    return data.data;
}

export async function logout() {
    setAccessToken(null);
    sessionStorage.removeItem("user");
}
