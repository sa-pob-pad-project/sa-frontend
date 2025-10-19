"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { createPaymentAttempt, createPaymentInfo } from "@/services/apiPaymentService"

type PaymentMethod = "credit_card" | "promptpay"

interface CreditCardDetails {
  card_number: string
  card_name: string
  expiry_date: string
  cvv: string
}

interface PromptPayDetails {
  phone_number: string
}

const encodeDetails = (details: CreditCardDetails | PromptPayDetails | Record<string, never>) => {
  if (typeof window === "undefined" || typeof window.btoa !== "function") {
    throw new Error("Base64 encoder is not available in the current environment.")
  }

  const json = JSON.stringify(details)
  const ascii = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  )

  return window.btoa(ascii)
}

export default function PaymentPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Credit card form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  // PromptPay form state
  const [phoneNumber, setPhoneNumber] = useState("")

  const orderDetails = {
    productCost: 500,
    shippingCost: 1500,
    total: 2000,
  }

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let details: CreditCardDetails | PromptPayDetails | Record<string, never> = {}

      if (paymentMethod === "credit_card") {
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
          setError("กรุณากรอกข้อมูลบัตรให้ครบถ้วน")
          setIsLoading(false)
          return
        }
        details = {
          card_number: cardNumber,
          card_name: cardName,
          expiry_date: expiryDate,
          cvv: cvv,
        }
      } else if (paymentMethod === "promptpay") {
        if (!phoneNumber) {
          setError("กรุณากรอกเบอร์โทรศัพท์")
          setIsLoading(false)
          return
        }
        details = {
          phone_number: phoneNumber,
        }
      }

      const encodedDetails = encodeDetails(details)
      const paymentInfoResponse = await createPaymentInfo({
        payment_method: paymentMethod,
        details: encodedDetails,
      })

      const paymentInfoId = paymentInfoResponse?.payment_info?.id
      if (!paymentInfoId) {
        throw new Error("ไม่พบข้อมูลการชำระเงินที่สร้าง")
      }

      const orderId = "" // TODO: เชื่อม order_id จาก flow ของ order จริง
      if (!orderId) {
        console.warn("[payment] Missing order ID. Skipping createPaymentAttempt.")
      } else {
        await createPaymentAttempt({
          order_id: orderId,
          payment_info_id: paymentInfoId,
        })
      }

      alert("ชำระเงินสำเร็จ!")
    } catch (err) {
      console.error("[v0] Payment error:", err)
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการชำระเงิน")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#AFFFD5]">
        <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="mb-6">
                <nav className="bg-white text-black px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-md flex items-center">
                    <button
                        onClick={() => router.push("/landing_page")}
                        className="flex items-center text-black hover:scale-105 transition-transform"
                    >
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    </button>
                    <h1 className="flex-1 text-center text-xl md:text-2xl font-semibold text-black">
                    ชำระเงิน
                    </h1>
                </nav>
            </div>

            {/* Order Summary */}
            <Card className="mb-6 bg-green-500 text-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-md">
            <h2 className="mb-4 text-xs md:text-sm font-semibold text-white">ข้อมูลใบชำระ</h2>
            <div className="space-y-2 text-sm md:text-base text-white">
                <div className="flex justify-between">
                    <span>ค่าสินค้า</span>
                    <span>{orderDetails.productCost}</span>
                </div>
                <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span>{orderDetails.shippingCost}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/40 pt-3 font-semibold">
                    <span>รวมทั้งหมด</span>
                    <span>{orderDetails.total}</span>
                </div>
            </div>
            </Card>

            {/* Payment Method Selection */}
            <Card className="mb-6 bg-white p-4 md:p-6 rounded-2xl shadow-md">
                <h2 className="mb-4 text-sm font-semibold text-green-700">เลือกวิธีชำระเงิน</h2>

                {/* บนมือถือ = เรียงลง, จอใหญ่ = กริด 2 คอลัมน์ */}
                <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-2"
                >
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3 md:p-4">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label
                            htmlFor="credit_card"
                            className="flex flex-1 cursor-pointer items-center gap-2 text-sm md:text-base font-normal"
                        >
                            <CreditCard className="h-4 w-4" />
                            บัตรเครดิต/เดบิต
                        </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3 md:p-4">
                        <RadioGroupItem value="promptpay" id="promptpay" />
                        <Label
                            htmlFor="promptpay"
                            className="flex flex-1 cursor-pointer items-center gap-2 text-sm md:text-base font-normal"
                        >
                            <Smartphone className="h-4 w-4" />
                            พร้อมเพย์
                        </Label>
                    </div>
                </RadioGroup>
            </Card>

            {/* Payment Details Form */}
            {paymentMethod === "credit_card" && (
            <Card className="mb-6 bg-white p-4 md:p-6 rounded-2xl shadow-md">
                <h2 className="mb-4 text-sm font-semibold text-green-700">ใส่ข้อมูล</h2>

                {/* ฟอร์ม: มือถือ=1คอลัมน์, จอใหญ่=2คอลัมน์ */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor="cardNumber" className="text-xs md:text-sm">หมายเลขบัตร</Label>
                        <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="mt-1 bg-gray-50 text-sm md:text-base"
                            maxLength={19}
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <Label htmlFor="cardName" className="text-xs md:text-sm">ชื่อบนบัตร</Label>
                        <Input
                            id="cardName"
                            placeholder="ชื่อบนบัตร"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="mt-1 bg-gray-50 text-sm md:text-base"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expiryDate" className="text-xs md:text-sm">วันหมดอายุ</Label>
                            <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="mt-1 bg-gray-50 text-sm md:text-base"
                                maxLength={5}
                                inputMode="numeric"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cvv" className="text-xs md:text-sm">CVV</Label>
                            <Input
                                id="cvv"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                className="mt-1 bg-gray-50 text-sm md:text-base"
                                maxLength={4}
                                type="password"
                                inputMode="numeric"
                            />
                        </div>
                    </div>
                </div>
            </Card>
            )}

            {paymentMethod === "promptpay" && (
            <Card className="mb-6 bg-white p-4 md:p-6 rounded-2xl shadow-md">
                <h2 className="mb-4 text-sm font-semibold text-green-700">ใส่ข้อมูล</h2>
                <div>
                    <Label htmlFor="phoneNumber" className="text-xs md:text-sm">เบอร์โทรศัพท์</Label>
                    <Input
                        id="phoneNumber"
                        placeholder="0812345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 bg-gray-50 text-sm md:text-base"
                        maxLength={10}
                        inputMode="numeric"
                    />
                </div>
            </Card>
            )}

            {/* Error Message */}
            {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 md:p-4 text-sm md:text-base text-destructive">
                {error}
            </div>
            )}

            {/* Payment Button */}
            <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-green-600 text-white hover:bg-green-700 py-3 md:py-4 text-base md:text-lg rounded-2xl"
                size="lg"
                >
                {isLoading ? "กำลังดำเนินการ..." : "ชำระเงิน"}
            </Button>
        </div>
    </div>

  )
}







