"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#32C671",
  WAITING_PAYMENT: "#FFC107",
  PREPARING: "#FF9800",
  SHIPPING: "#8E44AD",
  COMPLETED: "#E91E63",
}

// function generateFallbackOrderId() {
//   if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
//     return `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
//   }
//   return `ORD-${Date.now().toString(36).toUpperCase()}`
// }

export function StatusStep() {
  const router = useRouter()
  const {
    state,
    statusMeta,
    nextStep,
    previousStep,
    setOrderId,
  } = useOrderFlow()

  useEffect(() => {
    if (state.orderId) {
      setOrderId(state.orderId)
    }
  }, [setOrderId, state.orderId])

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
            <p>แพทย์ผู้ดูแล : {state.doctor.name}</p>
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

