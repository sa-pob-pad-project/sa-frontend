"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { getOrderById } from "@/services/apiOrderService"
import { getDoctorById } from "@/services/apiService"

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#32C671",
  WAITING_PAYMENT: "#FFC107",
  PROCESSING: "#FF9800",   // ✅ ให้ชื่อสถานะสอดคล้องกับ state ของคุณ
  SHIPPING: "#8E44AD",
  COMPLETED: "#E91E63",
}

export function StatusStep() {
  const router = useRouter()
  const { state, setStatus, statusMeta, nextStep, previousStep } = useOrderFlow()

  // ✅ local state สำหรับชื่อหมอ (เลี่ยงการแก้ context ตอนนี้)
  const [doctorName, setDoctorName] = useState<string>(state.doctor?.name || "-")

  // ถ้ายังไม่มี orderId ให้เด้งกลับไปเริ่ม flow
  useEffect(() => {
    if (!state.orderId) {
      router.replace("/order?step=shipping")
    }
  }, [state.orderId, router])

  // ดึงสถานะจริง + ดึงชื่อหมอครั้งเดียวเมื่อมี orderId
  useEffect(() => {
    if (!state.orderId) return
    let ignore = false

    const fetchStatusAndDoctor = async () => {
      try {
        const res = await getOrderById(state.orderId!)
        if (!res || ignore) return

        // อัปเดตสถานะ (map ให้ตรง enum ถ้าจำเป็น)
        if (res.status) setStatus(res.status)

        // ตั้งชื่อหมอจาก state ก่อน ถ้ามี
        if (state?.doctor?.name) {
          setDoctorName(state.doctor.name)
        }

        if (res.doctor_id) {
          try {
            const respd = await getDoctorById(res.doctor_id)

            const d = respd[0]
            if (!ignore && d?.first_name && d?.last_name) {
              setDoctorName(d.first_name + " " + d.last_name)
            }
          } catch (err) {
            console.warn("[status] fetch doctor failed:", err)
          }
        }
      } catch (e) {
        if (!ignore) console.warn("[status] fetch failed:", e)
      }
    }

    fetchStatusAndDoctor()
    return () => { ignore = true }
  }, [state.orderId, state.doctor?.name])


  const thaiDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [],
  )

  const thaiTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [],
  )

  const now = new Date()

  const shippingMethodText =
    state.shipping.method === "flash" ? "จัดส่งถึงบ้าน" : "รับที่โรงพยาบาล"

  const currentStatusMeta = statusMeta.find((meta) => meta.key === state.status)
  const statusIndex = statusMeta.findIndex((meta) => meta.key === state.status)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          สถานะการสั่งยา
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบรายละเอียดการสั่งซื้อและความคืบหน้าของคำสั่งนี้
        </p>
      </div>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="flex flex-col gap-5 text-sm text-gray-700">
          <div className="space-y-2">
            <p>หมายเลขคำสั่ง : {state.orderId ?? "-"}</p>
            <p>แพทย์ผู้ดูแล : {doctorName || "-"}</p> {/* ✅ ใช้ local state */}
            <p>วิธีการจัดส่ง : {shippingMethodText}</p>
            <p>สถานะการสั่ง : {currentStatusMeta?.label ?? "-"}</p>
            <p>
              วัน/เวลา การสั่งซื้อ : {thaiTimeFormatter.format(now)} ,{" "}
              {thaiDateFormatter.format(now)}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">สถานะ</p>
            <div className="mt-4 flex flex-col gap-4">
              {statusMeta.map((meta, index) => {
                const color = STATUS_COLORS[meta.key] ?? "#A0AEC0"
                const isActive = index === statusIndex
                const isCompleted = index < statusIndex
                const isLast = index === statusMeta.length - 1

                return (
                  <div key={meta.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className="h-3 w-3 rounded-full border"
                        style={{
                          backgroundColor: color,
                          borderColor: color,
                          opacity: isActive || isCompleted ? 1 : 0.3,
                        }}
                      />
                      {!isLast && (
                        <span
                          className="mt-1 w-px flex-1"
                          style={{
                            backgroundColor: isCompleted ? color : "#D1D5DB",
                            opacity: isCompleted ? 0.7 : 1,
                          }}
                        />
                      )}
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`text-sm ${
                          isActive ? "font-semibold text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {meta.label}
                      </span>
                      {isActive && (
                        <span className="text-xs text-gray-600">
                          {thaiTimeFormatter.format(now)} ,{" "}
                          {thaiDateFormatter.format(now)}
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

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          className="order-1 rounded-full border border-[#1BC47D] bg-white text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-[1.5]"
          onClick={() => nextStep()}
        >
          ตรวจสอบรายการยา
        </Button>
        <Button
          variant="outline"
          className="order-2 rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-1"
          onClick={() => previousStep()}
        >
          นัดหมอ
        </Button>
        <Button
          variant="ghost"
          className="order-3 rounded-full text-gray-600 hover:bg-gray-100 md:flex-1"
          onClick={() => router.push("/landing_page")}
        >
          กลับหน้าหลัก
        </Button>
      </div>
    </div>
  )
}
