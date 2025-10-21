import axios from "axios";

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    withCredentials: true,
});

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.status === 401 || error.status === 403) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
