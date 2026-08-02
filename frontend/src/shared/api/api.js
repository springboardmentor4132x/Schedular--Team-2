import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("orbit-user")
            const { pathname } = window.location
            const publicPaths = ["/login", "/register", "/role-selection", "/forgot-password", "/oauth/callback"]
            if (!publicPaths.some(p => pathname.startsWith(p))) {
                window.location.href = "/login"
            }
        }
        return Promise.reject(error)
    }
);

export default API;