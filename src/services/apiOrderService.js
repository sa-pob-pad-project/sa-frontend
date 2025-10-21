
import { http } from "@/libs/http"

const ORDER_ENDPOINT = "/order/v1/orders"
const DELIVERY_INFO_ENDPOINT = "/delivery-info/v1" // ห้ามแก้ไข path นี้เด็ดขาด

function extractErrorMessage(error, fallback) {
  const response = error?.response
  if (response?.data?.error) {
    return response.data.error
  }
  return fallback
}

export async function createOrder(payload) {
    try {
        const res = await http.post(ORDER_ENDPOINT, payload)
        if (res.status === 201 || res.status === 200) return res.data

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to create order"))
    }
}

// response example
// {
//   "orders": [
//     {
//       "created_at": "string",
//       "delivery_at": "string",
//       "delivery_status": "string",
//       "doctor_id": "string",
//       "note": "string",
//       "order_id": "string",
//       "order_items": [
//         {
//           "medicine_id": "string",
//           "medicine_name": "string",
//           "quantity": 0
//         }
//       ],
//       "patient_id": "string",
//       "reviewed_at": "string",
//       "status": "string",
//       "submitted_at": "string",
//       "total_amount": 0,
//       "updated_at": "string"
//     }
//   ],
//   "total": 0
// }
export async function getOrderById(orderId) {
    try {
        const res = await http.get(ORDER_ENDPOINT + `/${orderId}`)
        if (res.status === 201 || res.status === 200) return res.data

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to get order"))
    }
}

export async function createDeliveryInfo(payload) {
  try {
    const res = await http.post(DELIVERY_INFO_ENDPOINT, payload)

    if (res.status === 201 || res.status === 200) {
      return res.data
    }

    throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to create delivery info"))
  }
}

export async function updateDeliveryInfo(id, payload) {
  try {
    const res = await http.put(`${DELIVERY_INFO_ENDPOINT}`, payload)
    if (res.status === 200 || res.status === 204) {
      return res.data
    }

    throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to update delivery info"))
  }
}

export async function getDeliveryInfo(params = {}) {
    // console.log("getDeliveryInfo params:", params);
    const queryParams = { ...params }
    const deliveryMethod = queryParams.delivery_method

    if (deliveryMethod) {
        queryParams.method = deliveryMethod === "delivery" ? "flash" : deliveryMethod
        delete queryParams.delivery_method
    }

    try {
        const res = await http.get(`${DELIVERY_INFO_ENDPOINT}/methods`, { params: queryParams })

        if (res.status === 200) {
            return res.data
        }
        if (res.status === 204) {
            return null
        }

        throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
    } catch (error) {
        const status = error?.response?.status
        if (status === 404) {
            return null
        }
        throw new Error(extractErrorMessage(error, "Failed to get delivery info"))
    }
}

export async function payOrder(payload) {
  try {
    const res = await http.post(`${ORDER_ENDPOINT}/pay`, payload)

    if (res.status === 201 || res.status === 200) {
      return res.data
    }

    throw new Error(res.data?.error || `Unexpected status: ${res.status}`)
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to pay order"))
  }
}