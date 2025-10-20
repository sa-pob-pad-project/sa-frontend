"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Smartphone } from "lucide-react"

import {
  PaymentMethod,
  useOrderFlow,
} from "@/contexts/OrderFlowContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import {
  createPaymentAttempt,
  createPaymentInfo,
} from "@/services/apiPaymentService"

const PHONE_REGEX = /^0[0-9]{8,9}$/

const encodeDetails = (details: Record<string, string>) => {
  if (typeof window === "undefined" || typeof window.btoa !== "function") {
    throw new Error("ไม่สามารถเข้ารหัสข้อมูลการชำระเงินได้")
  }

  const json = JSON.stringify(details)
  const ascii = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )

  return window.btoa(ascii)
}

export function PaymentStep() {
  const router = useRouter()
  const {
    state,
    setPaymentMethod,
    setCardDraft,
    setPromptPayDraft,
    setStatus,
    nextStep,
    previousStep,
  } = useOrderFlow()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
      }),
    [],
  )

  const pricing = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const deliveryFee = state.shipping.method === "delivery" ? 80 : 0
    const total = subtotal + deliveryFee
    return { subtotal, deliveryFee, total }
  }, [state.items, state.shipping.method])

  const paymentMethod = state.payment.method
  const card = state.payment.card
  const promptpay = state.payment.promptpay

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let paymentDetails: Record<string, string> = {}

      if (paymentMethod === "credit_card") {
        if (
          !card.cardNumber ||
          !card.cardHolder ||
          !card.expiryDate ||
          !card.cvv
        ) {
          setError("กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน")
          return
        }
        paymentDetails = {
          card_number: card.cardNumber.replace(/\s+/g, ""),
          card_name: card.cardHolder,
          expiry_date: card.expiryDate,
          cvv: card.cvv,
        }
      } else {
        if (!promptpay.phoneNumber || !PHONE_REGEX.test(promptpay.phoneNumber)) {
          setError("กรุณากรอกเบอร์โทรศัพท์สำหรับ PromptPay ให้ถูกต้อง")
          return
        }
        paymentDetails = {
          phone_number: promptpay.phoneNumber,
        }
      }

      const encodedDetails = encodeDetails(paymentDetails)
      const paymentInfoResponse = await createPaymentInfo({
        payment_method: paymentMethod,
        details: encodedDetails,
      })

      const paymentInfoId = paymentInfoResponse?.payment_info?.id

      if (!paymentInfoId) {
        throw new Error("ไม่พบข้อมูลการชำระเงินที่สร้างขึ้น")
      }

      if (state.orderId) {
        await createPaymentAttempt({
          order_id: state.orderId,
          payment_info_id: paymentInfoId,
        })
      }

      setStatus("PREPARING")
      nextStep()
    } catch (err) {
      console.error("[order-flow] Payment error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการดำเนินการชำระเงิน",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleMethodChange = (value: PaymentMethod) => {
    setPaymentMethod(value)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">ชำระเงิน</h2>
          <p className="mt-1 text-sm text-gray-600">
            ยืนยันรายละเอียดและเลือกวิธีชำระเงินที่สะดวกสำหรับคุณ
          </p>
        </div>
        <Button
          variant="ghost"
          className="rounded-full text-[#1BC47D] hover:bg-[#1BC47D]/10"
          onClick={() => router.push("/billing/history")}
        >
          ดูประวัติการชำระเงิน
        </Button>
      </div>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span>ค่ายา</span>
            <span>{formatCurrency.format(pricing.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ค่าจัดส่ง</span>
            <span>
              {pricing.deliveryFee
                ? formatCurrency.format(pricing.deliveryFee)
                : "ฟรี"}
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-gray-900">
            <span>ยอดรวมทั้งหมด</span>
            <span>{formatCurrency.format(pricing.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
        <h3 className="text-sm font-semibold text-gray-800">
          เลือกวิธีชำระเงิน
        </h3>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: PaymentMethod) => handleMethodChange(value)}
          className="mt-4 space-y-3"
        >
          <div className="flex items-center space-x-3 rounded-2xl bg-white/70 p-4">
            <RadioGroupItem value="credit_card" id="credit-card" />
            <Label
              htmlFor="credit-card"
              className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-gray-800"
            >
              <CreditCard className="h-4 w-4 text-[#1BC47D]" />
              บัตรเครดิต/เดบิต
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-2xl bg-white/70 p-4">
            <RadioGroupItem value="promptpay" id="promptpay" />
            <Label
              htmlFor="promptpay"
              className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-gray-800"
            >
              <Smartphone className="h-4 w-4 text-[#1BC47D]" />
              PromptPay
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {paymentMethod === "credit_card" && (
        <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            ข้อมูลบัตรเครดิต
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="card-number" className="text-xs text-gray-600">
                หมายเลขบัตร
              </Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={card.cardNumber}
                onChange={(event) =>
                  setCardDraft({ cardNumber: event.target.value })
                }
                className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                maxLength={19}
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="card-holder" className="text-xs text-gray-600">
                ชื่อบนบัตร
              </Label>
              <Input
                id="card-holder"
                placeholder="ชื่อ - นามสกุล"
                value={card.cardHolder}
                onChange={(event) =>
                  setCardDraft({ cardHolder: event.target.value })
                }
                className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="expiry-date" className="text-xs text-gray-600">
                  วันหมดอายุ (MM/YY)
                </Label>
                <Input
                  id="expiry-date"
                  placeholder="08/28"
                  value={card.expiryDate}
                  onChange={(event) =>
                    setCardDraft({ expiryDate: event.target.value })
                  }
                  className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                  maxLength={5}
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label htmlFor="card-cvv" className="text-xs text-gray-600">
                  CVV
                </Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={card.cvv}
                  onChange={(event) =>
                    setCardDraft({ cvv: event.target.value })
                  }
                  className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                  maxLength={3}
                  inputMode="numeric"
                  type="password"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {paymentMethod === "promptpay" && (
        <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            ข้อมูล PromptPay
          </h3>
          <div>
            <Label htmlFor="promptpay-phone" className="text-xs text-gray-600">
              เบอร์โทรศัพท์
            </Label>
            <Input
              id="promptpay-phone"
              placeholder="0812345678"
              value={promptpay.phoneNumber}
              onChange={(event) =>
                setPromptPayDraft({
                  phoneNumber: event.target.value.replace(/\D/g, ""),
                })
              }
              className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
              maxLength={10}
              inputMode="numeric"
            />
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          variant="outline"
          className="rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-1"
          onClick={() => previousStep()}
          disabled={isLoading}
        >
          กลับไปตรวจสอบรายการ
        </Button>
        <Button
          className="rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a] md:flex-[1.5]"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "กำลังดำเนินการ..." : "ชำระเงิน"}
        </Button>
      </div>
    </div>
  )
}

