import axios from "axios";

export const http = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:8000/api",
    withCredentials: true,
});
