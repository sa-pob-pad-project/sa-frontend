import axios from "axios";


export const http = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:5000/api",
    withCredentials: true,
});

export const appointmentApi = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:8001/api",
    withCredentials: true,
});
