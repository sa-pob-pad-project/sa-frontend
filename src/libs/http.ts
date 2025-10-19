import axios from "axios";

export const userApi = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:8000/api",
    withCredentials: true,
});

export const appointmentApi = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:8001/api",
    withCredentials: true,
});
