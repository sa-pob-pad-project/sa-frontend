"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ResultStep() {
  const router = useRouter()
  const { state, statusMeta, setStatus, resetFlow } = useOrderFlow()

  const completed = state.status === "COMPLETED"

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
      }),
    [],
  )

  const total = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const deliveryFee = state.shipping.method === "flash" ? 80 : 0
    return subtotal + deliveryFee
  }, [state.items, state.shipping.method])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <CheckCircle2 className="h-6 w-6 text-[#1BC47D]" />
        คำสั่งซื้อสำเร็จ
      </div>
      <p className="text-sm text-gray-600">
        การชำระเงินเสร็จสมบูรณ์ สามารถตรวจสอบความคืบหน้าของการจัดส่งได้จากข้อมูลด้านล่าง
      </p>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
            <span>หมายเลขคำสั่งซื้อ</span>
            <span className="font-semibold text-[#1BC47D]">
              {state.orderId ?? "-"}
            </span>
          </div>

          <div className="space-y-3">
            {statusMeta.map((meta) => (
              <div key={meta.key} className="flex items-center justify-between">
                <span>{meta.label}</span>
                <span
                  className={`text-xs ${
                    state.status === meta.key
                      ? "text-[#1BC47D]"
                      : "text-gray-500"
                  }`}
                >
                  {state.status === meta.key ? "กำลังดำเนินการ" : ""}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/60 p-4">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>ยอดรวมทั้งหมด</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency.format(total)}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              หมายเหตุ: {state.note ? state.note : "ไม่มี"}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          className="rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a] md:flex-[1.5]"
          onClick={() => router.push(`/orders/${state.orderId ?? ""}`)}
        >
          ดูรายละเอียดคำสั่งซื้อ
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-1"
          onClick={() => setStatus("COMPLETED")}
          disabled={completed}
        >
          {completed ? "ส่งถึงแล้ว" : "อัปเดตสถานะเป็นส่งถึงแล้ว"}
        </Button>
        <Button
          variant="ghost"
          className="rounded-full text-gray-600 hover:bg-gray-100 md:flex-1"
          onClick={() => {
            resetFlow()
            router.push("/landing_page")
          }}
        >
          กลับหน้าหลัก
        </Button>
      </div>
    </div>
  )
}

