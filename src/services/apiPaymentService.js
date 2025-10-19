import { http } from "@/libs/http";

const PAYMENT_ATTEMPT_ENDPOINT = "/payment/v1/attempt";
const PAYMENT_INFO_ENDPOINT = "/payment/v1/info";

function handlePaymentError(error, fallbackMessage) {
    const response = error?.response;

    if (response) {
        const { status, data } = response;
        const message = data?.error || fallbackMessage;

        switch (status) {
            case 400:
                throw new Error(message || "Bad Request (400)");
            case 401:
                throw new Error(message || "Unauthorized (401)");
            case 403:
                throw new Error(message || "Forbidden (403)");
            case 404:
                throw new Error(message || "Not Found (404)");
            case 500:
                throw new Error(message || "Internal Server Error (500)");
            default:
                throw new Error(message || `Unexpected status: ${status}`);
        }
    }

    throw new Error(fallbackMessage);
}

export async function createPaymentAttempt(payload) {
    try {
        const res = await http.post(PAYMENT_ATTEMPT_ENDPOINT, payload);

        if (res.status === 201) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to create payment attempt");
    }
}

export async function updatePaymentAttempt(attemptId, payload = {}) {
    try {
        const res = await http.patch(PAYMENT_ATTEMPT_ENDPOINT, {
            ...payload,
            payment_attempt_id: attemptId,
        });

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to update payment attempt");
    }
}

export async function getPaymentAttemptById(attemptId) {
    try {
        const res = await http.get(`${PAYMENT_ATTEMPT_ENDPOINT}/${attemptId}`);

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to fetch payment attempt");
    }
}

export async function getPaymentAttemptByOrderId(orderId) {
    try {
        const res = await http.get(PAYMENT_ATTEMPT_ENDPOINT, {
            params: { order_id: orderId },
        });

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to fetch payment attempts for order");
    }
}

export async function createPaymentInfo(payload) {
    try {
        const res = await http.post(PAYMENT_INFO_ENDPOINT, payload);

        if (res.status === 201) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to create payment information");
    }
}

export async function getPaymentInfoById(paymentInfoId) {
    try {
        const res = await http.get(`${PAYMENT_INFO_ENDPOINT}/${paymentInfoId}`);

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to fetch payment information");
    }
}

export async function getAllPaymentInfos() {
    try {
        const res = await http.get(PAYMENT_INFO_ENDPOINT);

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to list payment information");
    }
}

export async function updatePaymentInfo(payload) {
    try {
        const res = await http.put(PAYMENT_INFO_ENDPOINT, payload);

        if (res.status === 200) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to update payment information");
    }
}

export async function deletePaymentInfo(paymentInfoId) {
    try {
        const res = await http.delete(PAYMENT_INFO_ENDPOINT, {
            data: { id: paymentInfoId },
        });

        if (res.status === 200) return res.data;
        if (res.status === 204) return res.data;

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`);
    } catch (error) {
        handlePaymentError(error, "Failed to delete payment information");
    }
}
