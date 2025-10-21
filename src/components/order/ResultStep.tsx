"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { getOrderById } from "@/services/apiOrderService"
import { getDoctorById } from "@/services/apiService"

// ให้สถานะเป็นตัวพิมพ์เล็กตรงกับ backend
function normalizeStatus(s: unknown) {
  return String(s || "").toLowerCase()
}

export function ResultStep() {
  const router = useRouter()
  const { state, setStatus, statusMeta, resetFlow } = useOrderFlow()

  const [doctorName, setDoctorName] = useState<string>(state.doctor?.name || "-")

  // ถ้าไม่มี orderId ให้เด้งกลับไปเริ่มต้น
  useEffect(() => {
    if (!state.orderId) {
      router.replace("/order?step=shipping")
    }
  }, [state.orderId, router])

  // ดึงสถานะจริง + ชื่อหมอ "ครั้งเดียว" เมื่อมี orderId (ไม่มี redirect ใดๆ)
  useEffect(() => {
    if (!state.orderId) return
    let ignore = false

    ;(async () => {
      try {
        const res = await getOrderById(state.orderId!)
        if (!res || ignore) return

        if (res.status) {
          setStatus(normalizeStatus(res.status) as any)
        }

        if (state?.doctor?.name) {
          setDoctorName(state.doctor.name)
        }

        if (res.doctor_id) {
          try {
            const respd = await getDoctorById(res.doctor_id)
            const d = Array.isArray(respd) ? respd[0] : respd
            if (!ignore && d?.first_name && d?.last_name) {
              setDoctorName(`${d.first_name} ${d.last_name}`)
            }
          } catch (err) {
            console.warn("[result] fetch doctor failed:", err)
          }
        }
      } catch (e) {
        if (!ignore) console.warn("[result] fetch failed:", e)
      }
    })()

    return () => { ignore = true }
  }, [state.orderId, state.doctor?.name, setStatus])

  const thaiDateFormatter = useMemo(
    () => new Intl.DateTimeFormat("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" }),
    [],
  )
  const thaiTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false }),
    [],
  )

  const now = new Date()
  const shippingMethodText =
    state.shipping.method === "flash" ? "จัดส่งถึงบ้าน" : "รับที่โรงพยาบาล"

  const currentStatusMeta = statusMeta.find((m) => m.key === state.status)
  const statusIndex = statusMeta.findIndex((m) => m.key === state.status)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">สรุปสถานะคำสั่งซื้อ</h2>
        <p className="mt-1 text-sm text-gray-600">
          ขอบคุณที่ชำระเงิน! ด้านล่างคือความคืบหน้าล่าสุดของออเดอร์คุณ
        </p>
      </div>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="flex flex-col gap-5 text-sm text-gray-700">
          <div className="space-y-2">
            <p>หมายเลขคำสั่ง : {state.orderId ?? "-"}</p>
            <p>แพทย์ผู้ดูแล : {doctorName || "-"}</p>
            <p>วิธีการจัดส่ง : {shippingMethodText}</p>
            <p>สถานะการสั่ง : {currentStatusMeta?.label ?? "-"}</p>
            <p>
              อัปเดตล่าสุด : {thaiTimeFormatter.format(now)} , {thaiDateFormatter.format(now)}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">ไทม์ไลน์สถานะ</p>
            <div className="mt-4 flex flex-col gap-4">
              {statusMeta.map((meta, index) => {
                const isCurrent = index === statusIndex
                const isPast = index < statusIndex
                const isNext = index === statusIndex + 1
                const isLast = index === statusMeta.length - 1

                // ✅ Logic สี
                let color = "#D1D5DB" // ยังไม่ถึง
                if (isPast || isCurrent) color = "#22C55E" // ผ่านแล้วหรือกำลังอยู่ → เขียว
                else if (isNext) color = "#FACC15" // ขั้นถัดไป → เหลือง

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
                              backgroundColor:
                                isPast || isCurrent ? "#22C55E" : "#D1D5DB",
                              opacity: isPast ? 0.8 : 1,
                            }}
                          />
                        )}
                      </div>

                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`text-sm ${
                            isCurrent
                              ? "font-semibold text-gray-900"
                              : isPast
                              ? "text-gray-800"
                              : isNext
                              ? "text-yellow-600"
                              : "text-gray-500"
                          }`}
                        >
                          {meta.label}
                        </span>

                        {isCurrent && (
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

      {/* ปุ่มสำหรับหน้าสรุป (ไม่มี next/previous step เพื่อกันวนลูป) */}
      <div className="flex flex-col gap-4">
        {/* แถวแรก: ปุ่มหลัก */}
        <Button
          className="w-full rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a]"
          onClick={() => router.push("/landing_page")}
        >
          กลับหน้าหลัก
        </Button>

        {/* แถวสอง: 2 คอลัมน์ */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10"
            onClick={() => {
              resetFlow()                   // เคลียร์ state flow
              router.replace("/order?step=shipping") // เริ่มสั่งใหม่
            }}
          >
            สั่งใหม่
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10"
            onClick={() => router.push(`/order/${state.orderId}?step=result`)}
          >
            รีเฟรชสถานะ
          </Button>
        </div>
      </div>
    </div>
  )
}
