import { http } from "@/libs/http";
import { ObjectUtils } from "@/libs/objectUtils";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_APPOINTMENT_URL || "http://localhost:5000";


export async function AppointmentSlots(doctor_id) {
    const res = await http.get("/api/appointment/v1/doctor/{doctor_id}/slots", doctor_id);
    const data = res.data;
    if (res.status === 200) return data;
    else if (res.status === 400) throw new Error(data.error || "Bad Request");
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 404) throw new Error(data.error || "Doctor Not Found");
    else if (res.status === 500) throw new Error(data.error || "Internal Server Error");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
}
    
export async function LastestAppointment() {
    const res = await http.get("/api/appointment/v1/patient/history/latest");
    const data = res.data;
    if (res.status === 200) return data;
    else if (res.status === 204) throw new Error(data.error || "No appointments found");
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 500) throw new Error(data.error || "Internal Server Error");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

export async function BookAppointment(doctor_id, start_time) {
    const res = await http.post("/api/appointment/v1/patient", {
        doctor_id,
        start_time,
    });
    const data = res.data;
    if (res.status === 201) return data;
    else if (res.status === 400) throw new Error(data.error || 
    "Appointment created successfully");
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 409) throw new Error(data.error || "Conflict - slot already booked");
    else if (res.status === 500) throw new Error(data.error || "Internal Server Error");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
} 

export async function HistoryAppointment() {
    const res = await http.get("/api/appointment/v1/patient/history");
    const data = res.data;
    if (res.status === 200) return data;
    else if (res.status === 204) throw new Error(data.error || "No appointments found");
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 500) throw new Error(data.error || "Internal Server Error");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

export async function IncomingAppointment() {
    const res = await http.get("//api/appointment/v1/patient/incoming");
    const data = res.data;
    if (res.status === 200) return data;
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 500) throw new Error(data.error || "Internal Server Error");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
}