import axios from "axios";

const API_BASE = "http://localhost:8080";

export const http = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let accessToken = null;
let isRefreshing = false;
let pending = [];

export function setAccessToken(token) {
    accessToken = token || null;
    if (token) {
        http.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete http.defaults.headers.common.Authorization;
    }
}


export function getAccessToken() {
    return accessToken;
}

http.interceptors.request.use((config) => {

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.debug("[http] Authorization ->", config.headers?.Authorization);

    return config;
});

http.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (!error.response) return Promise.reject(error);

        if (error.response.status === 401 && !original._retry && !original.url.includes('/login')) {
            original._retry = true;
            console.debug("[http] Authorization =>", original.headers?.Authorization);
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

                const { data } = await http.post("/auth/refresh");
                setAccessToken(data.accessToken);


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
