"use client"

import { useEffect, useState } from "react"
import { MapPin, Phone, Truck } from "lucide-react"

import {
  DeliveryMethod,
  useOrderFlow,
} from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createOrder,
  createDeliveryInfo,
  updateDeliveryInfo,
  getDeliveryInfo,
} from "@/services/apiOrderService"
import { useRouter } from "next/navigation"

type DeliveryInfoRecord = {
  id?: string
  address?: string
  phone_number?: string
  delivery_method?: DeliveryMethod
}

const DELIVERY_OPTIONS: Array<{
  id: DeliveryMethod
  label: string
  description: string
  icon: typeof Truck
}> = [
  {
    id: "flash",
    label: "จัดส่งถึงบ้าน",
    description: "บริการจัดส่งถึงหน้าบ้าน ภายใน 1-3 วันทำการ",
    icon: Truck,
  },
  {
    id: "pick_up",
    label: "รับที่โรงพยาบาล",
    description: "รับยาที่จุดรับยาโรงพยาบาลตามเวลาทำการ",
    icon: MapPin,
  },
]

const PHONE_REGEX = /^0[0-9]{8,9}$/

function extractDeliveryInfo(data: unknown): DeliveryInfoRecord | null {
  if (!data) return null

  const info = (data as any)?.delivery_info 
  if (info && typeof info === "object") {
    return info as DeliveryInfoRecord
  }
  return null
}

export function ShippingStep() {
  const { state, setShipping, setStatus, setOrderId, nextStep } = useOrderFlow()
  const { shipping, orderId, note: orderNote } = state

  const [errors, setErrors] = useState<{
    address?: string
    pickupLocation?: string
    phone?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingInfo, setIsFetchingInfo] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    let ignore = false

    const fetchDeliveryInfo = async (method: DeliveryMethod) => {
      setIsFetchingInfo(true)

      try {
        const response = await getDeliveryInfo({
          delivery_method: method,
        })
        if (ignore) return
        
        const info = extractDeliveryInfo(response)
        if (info) {
          const updates: Partial<typeof shipping> = {
            deliveryInfoId: info.id,
            phone: info.phone_number ?? "",
          }
          const infoAddress = info.address ?? ""
          if (method === "flash") {
            updates.address = infoAddress
          } else {
            updates.pickupLocation = infoAddress
          }

          setShipping(updates)
        } else {
          setShipping({
            deliveryInfoId: undefined,
          })
        }
      } catch (error) {
        if (!ignore) {
          console.warn("[order-flow] fetch delivery info failed:", error)
        }
      } finally {
        if (!ignore) {
          setIsFetchingInfo(false)
        }
      }
    }

    fetchDeliveryInfo(shipping.method)

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping.method])

  const handleMethodSelect = (method: DeliveryMethod) => {
    if (method === shipping.method) return
    setErrors({})
    setSubmitError(null)
    setShipping({
      method,
      deliveryInfoId: undefined,
      phone: "",
    })
  }

  const validate = () => {
    const nextErrors: typeof errors = {}

    if (shipping.method === "flash") {
      if (!shipping.address.trim()) {
        nextErrors.address = "กรุณากรอกที่อยู่สำหรับจัดส่ง"
      }
    } else {
      if (!(shipping.pickupLocation ?? "").trim()) {
        nextErrors.pickupLocation = "กรุณาระบุสถานที่รับยา"
      }
    }

    if (!shipping.phone.trim() || !PHONE_REGEX.test(shipping.phone.trim())) {
      nextErrors.phone = "กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก (ขึ้นต้นด้วย 0)"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleContinue = async () => {
    setSubmitError(null)

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const addressValue =
        shipping.method === "flash"
          ? shipping.address.trim()
          : (shipping.pickupLocation ?? "").trim()

      const deliveryPayload = {
        id: shipping.deliveryInfoId,
        address: addressValue,
        phone_number: shipping.phone.trim(),
        delivery_method: shipping.method,
      }

      let deliveryInfoId = shipping.deliveryInfoId

      if (deliveryInfoId) {
        const updateResponse = await updateDeliveryInfo(
          deliveryInfoId,
          deliveryPayload,
        )
        const updated = extractDeliveryInfo(updateResponse)
        if (updated?.id) {
          deliveryInfoId = updated.id
        }
      } else {
        const createResponse = await createDeliveryInfo(deliveryPayload)
        const created = extractDeliveryInfo(createResponse)
        if (created?.id) {
          deliveryInfoId = created.id
        }
      }

      if (deliveryInfoId && deliveryInfoId !== shipping.deliveryInfoId) {
        setShipping({ deliveryInfoId })
      }

      // console.log("[order-flow] oder ID:", orderId)
      if (!orderId) {
        const orderResponse = await createOrder({
          note: orderNote ?? shipping.note ?? "",
        })
        const newOrderId = orderResponse.order_id

        if (!newOrderId) {
          throw new Error("ไม่พบรหัสคำสั่งซื้อที่สร้างขึ้น")
        }

        // console.log("[order-flow] created new order with ID:", newOrderId)
        setOrderId(newOrderId)
        router.push(`/order/${newOrderId}?step=status`)
        return
      }

      setStatus("pending")
      nextStep()
    } catch (error) {
      console.error("[order-flow] shipping step submit failed:", error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถดำเนินการต่อได้ กรุณาลองใหม่อีกครั้ง",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isSubmitting || isFetchingInfo

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl bg-white/70 p-3">
            {DELIVERY_OPTIONS.map((option) => {
              const isActive = shipping.method === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleMethodSelect(option.id)}
                  className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-white shadow-sm"
                      : "bg-transparent hover:bg-white/80"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isActive ? "bg-[#1BC47D]/10" : "bg-white/60"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-[#1BC47D]" />
                  </span>
                  <span className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {option.label}
                    </span>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </span>
                </button>
              )
            })}
          </div>

          {shipping.method === "flash" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="delivery-address" className="text-sm text-gray-700">
                ที่อยู่สำหรับจัดส่ง
              </Label>
              <textarea
                id="delivery-address"
                value={shipping.address}
                onChange={(event) =>
                  setShipping({ address: event.target.value })
                }
                placeholder="กรอกที่อยู่จัดส่ง เช่น บ้านเลขที่ ซอย ถนน เขต จังหวัด และรหัสไปรษณีย์"
                className="min-h-[96px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:outline-none focus:ring-2 focus:ring-[#1BC47D]/30"
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="pickup-location" className="text-sm text-gray-700">
                สถานที่รับยา
              </Label>
              <Input
                id="pickup-location"
                value={shipping.pickupLocation ?? ""}
                onChange={(event) =>
                  setShipping({ pickupLocation: event.target.value })
                }
                placeholder="จุดรับยาโรงพยาบาล (เช่น อาคาร B ชั้น 2)"
                className="rounded-2xl border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:ring-[#1BC47D]/30"
              />
              {errors.pickupLocation && (
                <p className="text-xs text-red-500">{errors.pickupLocation}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="delivery-phone" className="text-sm text-gray-700">
              เบอร์โทรศัพท์ติดต่อ
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1BC47D]" />
              <Input
                id="delivery-phone"
                value={shipping.phone}
                onChange={(event) =>
                  setShipping({ phone: event.target.value.replace(/\D/g, "") })
                }
                placeholder="0XXXXXXXXX"
                className="rounded-2xl border-gray-200 bg-white pl-11 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:ring-[#1BC47D]/30"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="delivery-note" className="text-sm text-gray-700">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </Label>
            <textarea
              id="delivery-note"
              value={shipping.note ?? ""}
              onChange={(event) =>
                setShipping({ note: event.target.value })
              }
              placeholder="ระบุคำแนะนำเพิ่มเติม เช่น ฝากยาม เพื่อนำไปหน้าบ้าน"
              className="min-h-[80px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:outline-none focus:ring-2 focus:ring-[#1BC47D]/30"
            />
          </div>
        </div>
      </Card>

      {isFetchingInfo && !isSubmitting && (
        <p className="text-xs text-gray-500">กำลังโหลดข้อมูลการจัดส่ง...</p>
      )}

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={isBusy}
        className="mt-auto h-12 w-full rounded-full bg-[#1BC47D] text-base font-semibold text-white hover:bg-[#18a86a] disabled:cursor-not-allowed disabled:opacity-75"
      >
        {isSubmitting
          ? "กำลังดำเนินการ..."
          : isFetchingInfo
            ? "กำลังโหลดข้อมูล..."
            : "ดำเนินการต่อ"}
      </Button>
    </div>
  )
}

