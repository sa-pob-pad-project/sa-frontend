import { http } from "@/libs/http";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_ORDER_URL || "http://localhost:5000";


export async function HistoryOrder() {

    const res = await http.get("/api/order/v1/orders");
    const data = res.data;
    if (res.status === 200) return data;
    else if (res.status === 401) throw new Error(data.error || "Unauthorized");
    else if (res.status === 500) throw new Error(data.error || "Failed to retrieve orders");
    else throw new Error(data.error || `Unexpected status: ${res.status}`);
}