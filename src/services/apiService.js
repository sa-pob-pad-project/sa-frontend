import { http } from "@/libs/http";
import { ObjectUtils } from "@/libs/objectUtils";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/* ===================== LOGIN ===================== */
export async function loginPatient({ hospital_id, password }) {
  const res = await http.post("/api/user/v1/patient/login", {
    hospital_id,
    password,
  });
  const data = res.data;

  if (res.status === 200) return data;
  else if (res.status === 400) throw new Error(data.error || "Bad Request (400)");
  else if (res.status === 401) throw new Error(data.error || "Incorrect ID or Password");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

/* ===================== REGISTER ===================== */
export async function registerPatient(formData) {
  formData.birth_date = new Date(formData.birth_date);
  const res = await http.post("/api/user/v1/patient/register", formData);
  const data = res.data;

  if (res.status === 201) return data;
  else if (res.status === 400) throw new Error(data.error || "Bad Request (400)");
  else if (res.status === 500) throw new Error(data.error || "Server Error (500)");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

/* ===================== PROFILE ===================== */
export async function getProfile() {
  const res = await http.get("/api/user/v1/patient/me");
  const data = res.data;

  if (res.status === 200) return data;
  else if (res.status === 401) throw new Error("Unauthorized. Please login again.");
  else if (res.status === 500) throw new Error(data.error || "Server error (500)");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

/* ===================== UPDATE PROFILE ===================== */
export async function updateProfile(
    address,
    allergies,
    birth_date,
    blood_type,
    emergency_contact,
    first_name,
    id_card_number,
    last_name,
    phone_number
    )
    {
  const res = await http.patch("/api/user/v1/patient",    
    address,
    allergies,
    birth_date,
    blood_type,
    emergency_contact,
    first_name,
    id_card_number,
    last_name,
    phone_number);

  const data = res.data;
  if (res.status === 200) return data;
  else if (res.status === 400) throw new Error(data.error || "Invalid request body or user not found");
  else if (res.status === 401) throw new Error(data.error || "Unauthorized - Invalid or missing token");
  else if (res.status === 500) throw new Error(data.error || "Failed to update user profile");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

/* ===================== GET ID ===================== */
export async function getID(patient_data) {
  const res = await http.post("/api/user/v1/patients", patient_data);
  const data = res.data;

  if (res.status === 200) return data;
  else if (res.status === 404) throw new Error(data.error || "Patient Not Found");
  else if (res.status === 500) throw new Error(data.error || "Failed to get patient profiles");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

export async function getDoctorById(doctorId) {
    try {
        const res = await http.post("/user/v1/doctors", { doctor_ids: [doctorId] });
        if (res.status === 201 || res.status === 200) {
        return res.data
        }

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to get doctor info"))
    }
/* ===================== LATEST ORDER ===================== */
export async function latestOrder() {
  const res = await http.get("/api/order/v1/orders/latest");
  const data = res.data;

  if (res.status === 200) return data;
  else if (res.status === 401) throw new Error(data.error || "Unauthorized");
  else if (res.status === 404) throw new Error(data.error || "No orders found");
  else if (res.status === 500) throw new Error(data.error || "Failed to retrieve order");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);
}

/* ===================== UTIL ===================== */
export function calculateAge(birthDate) {
  if (ObjectUtils.isEmpty(birthDate)) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export async function AllDoctors() {
  const res = await http.get("/api/user/v1/doctors");
  const data = res.data;
  if (res.status === 200) return data;
  else if (res.status === 500) throw new Error(data.error || "Failed to get doctors");
  else throw new Error(data.error || `Unexpected status: ${res.status}`);  
}