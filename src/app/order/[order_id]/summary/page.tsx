"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { getOrderById } from "@/services/apiOrderService"
import { getDoctorById } from "@/services/apiService"

type OrderTimelineStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

interface OrderStatusMeta {
  key: OrderTimelineStatus
  label: string
  description: string
}

const ORDER_STATUS_SEQUENCE: OrderStatusMeta[] = [
  {
    key: "pending",
    label: "รอการตรวจสอบ",
    description: "ระบบกำลังตรวจสอบคำสั่งซื้อนี้",
  },
  {
    key: "approved",
    label: "อนุมัติแล้ว",
    description: "ใบสั่งยาผ่านการอนุมัติจากแพทย์เรียบร้อย",
  },
  {
    key: "paid",
    label: "ชำระเงินแล้ว",
    description: "ระบบได้รับการชำระเงินแล้ว เตรียมดำเนินการจัดยา",
  },
  {
    key: "processing",
    label: "กำลังดำเนินการ",
    description: "เภสัชกรกำลังจัดเตรียมยาและบรรจุภัณฑ์",
  },
  {
    key: "shipped",
    label: "กำลังจัดส่ง",
    description: "พัสดุออกจากคลังแล้วและอยู่ระหว่างจัดส่ง",
  },
  {
    key: "delivered",
    label: "ส่งถึงแล้ว",
    description: "ได้รับยาเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ",
  },
  {
    key: "cancelled",
    label: "คำสั่งซื้อถูกยกเลิก",
    description: "คำสั่งซื้อนี้ถูกยกเลิกแล้ว",
  },
  {
    key: "rejected",
    label: "ไม่อนุมัติ",
    description: "ใบสั่งยานี้ถูกปฏิเสธจากแพทย์หรือระบบ",
  },
]

export default function OrderSummaryPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.order_id as string | undefined

  const [orderData, setOrderData] = useState<any>(null)
  const [doctorName, setDoctorName] = useState<string>("-")
  const [status, setStatus] = useState<OrderTimelineStatus>("approved")
  const [shippingMethod, setShippingMethod] = useState<string>("ไม่ระบุ")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ให้สถานะเป็นตัวพิมพ์เล็กตรงกับ backend
  function normalizeStatus(s: unknown): OrderTimelineStatus {
    const normalized = String(s || "").toLowerCase()
    const validStatuses: OrderTimelineStatus[] = [
      "pending",
      "approved",
      "rejected",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]
    return (validStatuses.includes(normalized as OrderTimelineStatus)
      ? normalized
      : "approved") as OrderTimelineStatus
  }

  // ดึงข้อมูลคำสั่งซื้อ
  useEffect(() => {
    if (!orderId) {
      setError("ไม่พบเลขที่คำสั่งซื้อ")
      setLoading(false)
      return
    }

    let ignore = false

    ;(async () => {
      try {
        setLoading(true)
        const res = await getOrderById(orderId)

        if (ignore) return

        if (!res) {
          setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อ")
          setLoading(false)
          return
        }

        const ord = Array.isArray(res?.orders) ? res.orders[0] : res

        if (ord) {
          setOrderData(ord)

          // ตั้งค่าสถานะ
          if (ord.status) {
            setStatus(normalizeStatus(ord.status))
          }

          // ตั้งค่าวิธีจัดส่ง
          if (ord.delivery_method) {
            setShippingMethod(
              ord.delivery_method === "flash" ? "จัดส่งถึงบ้าน" : "รับที่โรงพยาบาล"
            )
          }

          // ดึงชื่อแพทย์
          if (ord.doctor_id) {
            try {
              const respd = await getDoctorById(ord.doctor_id)
              const d = Array.isArray(respd) ? respd[0] : respd
              if (!ignore && d?.first_name && d?.last_name) {
                setDoctorName(`${d.first_name} ${d.last_name}`)
              }
            } catch (err) {
              console.warn("[summary] fetch doctor failed:", err)
              setDoctorName(ord.doctor_name || "-")
            }
          }
        }

        setError(null)
      } catch (e) {
        if (!ignore) {
          console.warn("[summary] fetch failed:", e)
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    })()

    return () => {
      ignore = true
    }
  }, [orderId])

  const thaiDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    []
  )

  const thaiTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    []
  )

  const now = new Date()
  const currentStatusMeta = ORDER_STATUS_SEQUENCE.find((m) => m.key === status)
  const statusIndex = ORDER_STATUS_SEQUENCE.findIndex((m) => m.key === status)

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-16">
          <header className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center rounded-full p-2 text-[#1BC47D] hover:bg-[#1BC47D]/10"
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">
                สรุปคำสั่งซื้อ
              </h1>
            </div>
          </header>
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#1BC47D]"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-16">
        {/* Header */}
        <header className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center rounded-full p-2 text-[#1BC47D] hover:bg-[#1BC47D]/10"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">
              สรุปคำสั่งซื้อ
            </h1>
            <p className="text-xs text-gray-500 md:text-sm">
              ตรวจสอบสถานะและรายละเอียดของคำสั่งซื้อ
            </p>
          </div>
          <span className="ml-auto rounded-full bg-[#1BC47D]/10 px-3 py-1 text-xs font-medium text-[#1BC47D] md:text-sm">
            {currentStatusMeta?.label ?? "-"}
          </span>
        </header>

        {/* Error Message */}
        {error && (
          <Card className="rounded-3xl border-red-300 bg-red-50 p-6 shadow-md">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Main Content */}
        <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
          <div className="flex flex-col gap-5 text-sm text-gray-700">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">หมายเลขคำสั่ง:</span> {orderId ?? "-"}
              </p>
              <p>
                <span className="font-semibold">แพทย์ผู้ดูแล:</span> {doctorName || "-"}
              </p>
              <p>
                <span className="font-semibold">วิธีการจัดส่ง:</span> {shippingMethod}
              </p>
              <p>
                <span className="font-semibold">สถานะการสั่ง:</span>{" "}
                {currentStatusMeta?.label ?? "-"}
              </p>
              <p>
                <span className="font-semibold">อัปเดตล่าสุด:</span>{" "}
                {thaiTimeFormatter.format(now)} , {thaiDateFormatter.format(now)}
              </p>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-sm font-semibold text-gray-800">ไทม์ไลน์สถานะ</p>
              <div className="mt-4 flex flex-col gap-4">
                {ORDER_STATUS_SEQUENCE.map((meta, index) => {
                  const isActive = index === statusIndex
                  const isCompleted = index < statusIndex
                  const isLast = index === ORDER_STATUS_SEQUENCE.length - 1

                  let color = "#D1D5DB" // ยังไม่ถึง → เทา
                  if (isCompleted) color = "#22C55E" // ผ่านแล้ว → เขียว
                  else if (isActive) color = "#FACC15" // กำลังอยู่ → เหลือง

                  return (
                    <div key={meta.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: color, borderColor: color }}
                        />
                        {!isLast && (
                          <span
                            className="mt-1 w-px flex-1"
                            style={{
                              backgroundColor: isCompleted ? "#22C55E" : "#D1D5DB",
                              opacity: isCompleted ? 0.8 : 1,
                            }}
                          />
                        )}
                      </div>

                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`text-sm ${
                            isActive
                              ? "font-semibold text-gray-900"
                              : isCompleted
                              ? "text-gray-800"
                              : "text-gray-500"
                          }`}
                        >
                          {meta.label}
                        </span>
                        {isActive && (
                          <span className="text-xs text-gray-600">
                            {thaiTimeFormatter.format(now)} , {thaiDateFormatter.format(now)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        {orderData?.order_items && orderData.order_items.length > 0 && (
          <Card className="rounded-3xl border-none bg-gray-50 p-6 shadow-md">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">รายการยา</h3>
            <div className="space-y-3">
              {orderData.order_items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.medicine_name || "-"}
                    </p>
                    {item.dosage && (
                      <p className="text-xs text-gray-500">{item.dosage}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.quantity} {item.unit || "เม็ด"}
                    </p>
                    {item.price && (
                      <p className="text-xs text-gray-500">
                        ฿{Number(item.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10"
              onClick={() => router.push("/landing_page")}
            >
              กลับหน้าหลัก
            </Button>
            <Button
              className="w-full rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a]"
              onClick={() => router.push(`/order/${orderId}?step=status`)}
            >
              รีเฟรชสถานะ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
