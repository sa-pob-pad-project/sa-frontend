"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { useOrderFlow } from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { getOrderById } from "@/services/apiOrderService"
import { getMedicineById } from "@/services/apiMedicineService"

type ApiOrderItem = {
  medicine_id: string
  medicine_name: string
  quantity: number
}

type ApiOrder = {
  order_id: string
  order_items: ApiOrderItem[]
  note?: string
  total_amount?: number
}

type MergedItem = {
  id: string
  name: string
  quantity: number
  price: number
  dosage?: string
  unit?: string
}

export function ReviewStep() {
  const { state, setNote, nextStep, previousStep } = useOrderFlow()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MergedItem[]>([])
  const [apiTotal, setApiTotal] = useState<number | undefined>(undefined)

  // cache ราคาเพื่อลดการยิง API ซ้ำ
  const priceCacheRef = useRef(new Map<string, { price: number; unit?: string }>())

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!state.orderId) {
        // ไม่มี orderId ก็ fallback ใช้ state.items เดิม
        const merged = state.items.map((it) => ({
          id: String(it.id),
          name: it.name,
          quantity: it.quantity,
          price: it.price ?? 0,
          dosage: it.dosage,
        }))
        setItems(merged)
        setApiTotal(undefined)
        return
      }

      setLoading(true)
      setError(null)
      console.log("Fetching order details for orderId:", state.orderId)
      try {
        // 1) ดึงรายการออเดอร์
        const resp = await getOrderById(state.orderId)
        const apiOrder: ApiOrder | undefined = Array.isArray(resp?.orders)
          ? resp.orders[0]
          : undefined
        if (!apiOrder) throw new Error("ไม่พบคำสั่งซื้อในระบบ")

        // sync note ถ้า state ยังว่าง
        if ((!state.note || !state.note.trim()) && apiOrder.note) {
          setNote(apiOrder.note)
        }
        setApiTotal(apiOrder.total_amount)

        // 2) เตรียม map จาก state.items (เพื่อดึง dosage ถ้ามี)
        const localById = new Map<string, { dosage?: string }>()
        const localByName = new Map<string, { dosage?: string }>()
        for (const it of state.items) {
          localById.set(String(it.id), { dosage: it.dosage })
          localByName.set(String(it.name).trim().toLowerCase(), { dosage: it.dosage })
        }

        // 3) ดึงราคาแต่ละยา (ใช้ cache + Promise.all)
        const fetchPrice = async (id: string) => {
          if (priceCacheRef.current.has(id)) return priceCacheRef.current.get(id)!
          const medResp = await getMedicineById(id)
          const med = medResp?.medicine
          const entry = {
            price: typeof med?.price === "number" ? med.price : 0,
            unit: med?.unit,
          }
          priceCacheRef.current.set(id, entry)
          return entry
        }

        const mergedPromises = (apiOrder.order_items ?? []).map(async (it) => {
          const id = String(it.medicine_id)
          const name = it.medicine_name
          let priceInfo: { price: number; unit: string | undefined } = { price: 0, unit: undefined }
          const result = await fetchPrice(id)
          priceInfo = {
            price: result.price,
            unit: result.unit ?? undefined, // ensure field always present
          }

          // เติม dosage จาก local state ถ้ามี
          const local = localById.get(id) ?? localByName.get(name.trim().toLowerCase())

          return {
            id,
            name,
            quantity: it.quantity ?? 0,
            price: priceInfo.price ?? 0,
            unit: priceInfo.unit,
            dosage: local?.dosage,
          } as MergedItem
        })

        const merged = await Promise.all(mergedPromises)
        if (!ignore) setItems(merged)
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ")
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    run()
    return () => {
      ignore = true
    }
    // state.items ใส่ใน dep เพื่อเติม dosage ให้เคส fallback/merge
  }, [state.orderId, state.items, state.note, setNote])

  // ราคา
  const pricing = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0,
    )
    // ถ้ามี total จาก API ให้เชื่อ total นั้น (กันกรณีระบบส่วนกลางคิดราคา/ส่วนลด)
    const deliveryFee = 0 // ใส่ลอจิกจริงได้ เช่น state.shipping.method === "flash" ? 80 : 0
    const total = typeof apiTotal === "number" ? apiTotal : subtotal + deliveryFee
    return { subtotal, deliveryFee, total }
  }, [items, apiTotal])

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
        <h2 className="text-lg font-semibold text-gray-900">ตรวจสอบรายการยา</h2>
        <p className="mt-1 text-sm text-gray-600">
          ตรวจสอบรายการและข้อมูลเพิ่มเติมก่อนดำเนินการชำระเงิน
        </p>
      </div>

      {state.orderId && (
        <p className="text-xs text-gray-500">
          หมายเลขคำสั่งซื้อ: <span className="font-medium">{state.orderId}</span>
        </p>
      )}

      {loading && (
        <p className="text-xs text-gray-500">กำลังโหลดรายการยา…</p>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-6 shadow-md">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-2xl bg-white/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                {item.dosage && <p className="text-xs text-gray-600">{item.dosage}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  จำนวน {item.quantity} {item.unit ?? "หน่วย"}
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-gray-700">
                {formatCurrency.format((item.price ?? 0) * (item.quantity ?? 0))}
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && !error && (
            <p className="text-sm text-gray-600">ไม่พบรายการยา</p>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-white/60 p-4">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>ค่ายา</span>
            <span>{formatCurrency.format(pricing.subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
            <span>ค่าจัดส่ง</span>
            <span>{pricing.deliveryFee ? formatCurrency.format(pricing.deliveryFee) : "ฟรี"}</span>
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
            onChange={(e) => setNote(e.target.value)}
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
