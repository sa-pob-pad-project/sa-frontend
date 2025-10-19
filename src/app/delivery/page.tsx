"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DeliveryMethod = "delivery" | "pickup"

const deliveryOptions: Array<{
  id: DeliveryMethod
  label: string
  icon: typeof Truck
}> = [
  {
    id: "delivery",
    label: "การจัดส่ง",
    icon: Truck,
  },
  {
    id: "pickup",
    label: "รับยาเอง",
    icon: MapPin,
  },
]

export default function DeliveryPage() {
  const router = useRouter()
  const [method, setMethod] = useState<DeliveryMethod>("delivery")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")

  const handleContinue = () => {
    // TODO: เชื่อมต่อข้อมูลการจัดส่งกับ flow จริง
    console.log({ method, address, phone, note })
  }

  return (
    <div className="min-h-screen bg-[#AFFFD5]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6 pb-24 md:max-w-2xl lg:max-w-3xl">
        <nav className="flex items-center rounded-2xl bg-white px-4 py-3 shadow-md">
          <button
            onClick={() => router.back()}
            className="flex items-center text-black transition-transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-black md:text-2xl">
            ข้อมูลการจัดส่ง
          </h1>
        </nav>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <div className="flex w-full items-center justify-between rounded-full bg-white p-1 shadow-md md:w-auto md:gap-2">
              {deliveryOptions.map(({ id, label, icon: Icon }) => {
                const isActive = method === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors md:text-base ${
                      isActive
                        ? "bg-[#1BC47D] text-white shadow-sm"
                        : "text-[#1BC47D]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Card className="rounded-3xl border border-[#1BC47D]/30 bg-white p-5 shadow-md">
            <div className="mb-4 flex items-center gap-2 text-[#1BC47D]">
              <Truck className="h-5 w-5" />
              <h2 className="text-base font-semibold">ที่อยู่จัดส่ง</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="delivery-address" className="text-sm text-gray-700">
                  ที่อยู่
                </Label>
                <textarea
                  id="delivery-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="กรอกที่อยู่สำหรับการจัดส่งยา"
                  className="min-h-[96px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:outline-none focus:ring-2 focus:ring-[#1BC47D]/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="delivery-phone" className="text-sm text-gray-700">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="delivery-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0xx-xxx-xxxx"
                  className="rounded-2xl border-gray-300 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:ring-[#1BC47D]/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="delivery-note" className="text-sm text-gray-700">
                  หมายเหตุ (ไม่บังคับ)
                </Label>
                <textarea
                  id="delivery-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="เช่น ตั้งตู้แช่ หรือ ระบุห้อง"
                  className="min-h-[80px] w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#1BC47D] focus:outline-none focus:ring-2 focus:ring-[#1BC47D]/30"
                />
              </div>
            </div>
          </Card>
        </div>

        <Button
          onClick={handleContinue}
          className="mt-auto h-12 w-full rounded-full bg-[#1BC47D] text-base font-semibold text-white hover:bg-[#18a86a]"
        >
          ดำเนินการต่อ
        </Button>
      </div>
    </div>
  )
}

