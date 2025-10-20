
import { http } from "@/libs/http";

export async function createOrder(payload) {
    try {
        const res = await http.post("/order/v1/orders", payload);
        if (res.status === 201 || res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        if (response?.data?.error) {
            throw new Error(response.data.error);
        }
        throw new Error("Failed to create order");
    }
}

// request payload example
// {
//     "address": "You home",
//     "phone_number": "12045674",
//     "delivery_method": "flash"
// }
export async function createDeliveryInfo(payload) {
    try {
        const res = await http.post("/delivery-info/v1/", payload);

        if (res.status === 201 || res.status === 200) {
            return res.data;
        }

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        if (response?.data?.error) {
            throw new Error(response.data.error);
        }
        throw new Error("Failed to create delivery info");
    }
}

// {
//   "address": "string",
//   "delivery_method": "flash",
//   "id": "string",
//   "phone_number": "string"
// }
export async function updateDeliveryInfo(payload) {
    try {
        const res = await http.put(`/delivery-info/v1/${payload.id}`, payload);
        if (res.status === 201 || res.status === 200) {
            return res.data;
        }

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        if (response?.data?.error) {
            throw new Error(response.data.error);
        }
        throw new Error("Failed to update delivery info");
    }
}

export async function getDeliveryInfoByMethod(method) {
    try {
        const res = await http.get(`/delivery-info/v1/methods?method=${method}`);

        if (res.status === 201 || res.status === 200) {
            return res.data;
        }

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        const response = error?.response;
        if (response?.data?.error) {
            throw new Error(response.data.error);
        }
        throw new Error("Failed to get delivery info by method");
    }
}