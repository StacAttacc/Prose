import { http, setAccessToken } from "./http";

export async function login(email, password) {
    const { data } = await http.post("/user/login", { email, password });
    setAccessToken(data.accessToken);
    return data.user;
}

export async function register(payload) {
    const { data } = await http.post("/employeur/register", payload);
    setAccessToken(data.accessToken);
    return data.user;
}

export async function logout() {
    try { await http.post("/auth/logout"); } catch {}
    setAccessToken(null);
}
