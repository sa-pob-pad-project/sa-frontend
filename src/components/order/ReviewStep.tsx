"use client"

import { useMemo } from "react"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function ReviewStep() {
  const { state, setNote, nextStep, previousStep } = useOrderFlow()

  const pricing = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const deliveryFee = state.shipping.method === "delivery" ? 80 : 0
    const total = subtotal + deliveryFee
    return { subtotal, deliveryFee, total }
  }, [state.items, state.shipping.method])

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
      }),
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          ตรวจสอบรายการยา
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการชำระเงิน
        </p>
      </div>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="space-y-4">
          {state.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-2xl bg-white/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>
                {item.dosage && (
                  <p className="text-xs text-gray-600">{item.dosage}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  จำนวน {item.quantity} หน่วย
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-gray-700">
                {formatCurrency.format(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-white/60 p-4">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>ค่ายา</span>
            <span>{formatCurrency.format(pricing.subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
            <span>ค่าจัดส่ง</span>
            <span>
              {pricing.deliveryFee > 0
                ? formatCurrency.format(pricing.deliveryFee)
                : "ฟรี"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-base font-semibold text-gray-900">
            <span>ยอดรวมทั้งหมด</span>
            <span>{formatCurrency.format(pricing.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Label htmlFor="order-note" className="text-sm text-gray-700">
            หมายเหตุถึงเภสัชกร (ถ้ามี)
          </Label>
          <textarea
            id="order-note"
            value={state.note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="สามารถระบุข้อมูลเพิ่มเติม เช่น แพ้ยา หรือเวลาที่สะดวกรับยา"
            className="min-h-[96px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:outline-none focus:ring-2 focus:ring-[#1BC47D]/30"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          variant="outline"
          className="rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-1"
          onClick={() => previousStep()}
        >
          กลับไปดูสถานะ
        </Button>
        <Button
          className="rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a] md:flex-[1.5]"
          onClick={() => nextStep()}
        >
          ไปขั้นตอนชำระเงิน
        </Button>
      </div>
    </div>
  )
}

