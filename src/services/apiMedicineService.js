import { http } from "@/libs/http";

const MEDICINE_ENDPOINT = "/api/medicine/v1/medicines";

// response example
// {
//   "medicine": {
//     "created_at": "string",
//     "id": "string",
//     "name": "string",
//     "price": 0,
//     "stock": 0,
//     "unit": "string",
//     "updated_at": "string"
//   }
// }
export async function getMedicineById(medicineId) {
    try {
        const res = await http.get(`${MEDICINE_ENDPOINT}/${medicineId}`);
        if (res.status === 201 || res.status === 200) return res.data
        
        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        const errorMessage =
            response?.data?.error || "Failed to fetch medicine details";
        throw new Error(errorMessage);
    }
}


// response example
// {
//   "medicines": [
//     {
//       "created_at": "string",
//       "id": "string",
//       "name": "string",
//       "price": 0,
//       "stock": 0,
//       "unit": "string",
//       "updated_at": "string"
//     }
//   ],
//   "total": 0
// }
export async function getAllMedicines() {
    try {
        const res = await http.get(MEDICINE_ENDPOINT);
        if (res.status === 201 || res.status === 200) return res.data

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        const errorMessage =
            response?.data?.error || "Failed to fetch medicines list";
        throw new Error(errorMessage);
    }
}