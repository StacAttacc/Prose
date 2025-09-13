import axios from "axios";

const API_BASE = "http://localhost:8080";

export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // pour envoyer le cookie httpOnly (refresh)
});

let accessToken = null;
let isRefreshing = false;
let pending = [];

export function setAccessToken(token) {
    accessToken = token || null;
}

http.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Pas de response (réseau down / CORS), on jette directement
        if (!error.response) return Promise.reject(error);

        if (error.response.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pending.push({ resolve, reject });
                })
                    .then((token) => {
                        original.headers.Authorization = `Bearer ${token}`;
                        return http(original);
                    })
                    .catch(Promise.reject);
            }

            isRefreshing = true;
            try {
                // le cookie refresh httpOnly circule via withCredentials
                const { data } = await http.post("/auth/refresh");
                setAccessToken(data.accessToken);

                // Réveille la file
                pending.forEach((p) => p.resolve(data.accessToken));
                pending = [];

                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return http(original);
            } catch (e) {
                pending.forEach((p) => p.reject(e));
                pending = [];
                setAccessToken(null);
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
