"use client"

import { useEffect, useRef } from "react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { ArrowLeft } from "lucide-react"

import {
  OrderFlowProvider,
  OrderFlowStepId,
  useOrderFlow,
} from "@/contexts/OrderFlowContext"
import { OrderStepper } from "@/components/order/OrderStepper"
import { ShippingStep } from "@/components/order/ShippingStep"
import { StatusStep } from "@/components/order/StatusStep"
import { ReviewStep } from "@/components/order/ReviewStep"
import { PaymentStep } from "@/components/order/PaymentStep"
import { ResultStep } from "@/components/order/ResultStep"

function OrderPageBody() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { state, goToStep } = useOrderFlow()
  const hasSyncedQueryRef = useRef(false)

  useEffect(() => {
    if (hasSyncedQueryRef.current) return
    const stepParam = searchParams.get("step") as OrderFlowStepId | null
    if (
      stepParam &&
      stepParam !== state.currentStep &&
      state.steps.includes(stepParam)
    ) {
      goToStep(stepParam)
    }
    hasSyncedQueryRef.current = true
  }, [searchParams, state.currentStep, state.steps, goToStep])

  useEffect(() => {
    if (!hasSyncedQueryRef.current) return
    const currentUrlStep = searchParams.get("step")
    if (currentUrlStep === state.currentStep) return

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (state.currentStep === "shipping") {
      params.delete("step")
    } else {
      params.set("step", state.currentStep)
    }
    const queryString = params.toString()
    router.replace(
      queryString ? `${pathname}?${queryString}` : pathname,
      { scroll: false },
    )
  }, [state.currentStep, searchParams, router, pathname])

  const nameStepMap = () => {
    switch (state.currentStep) {
      case "shipping":
        return "ข้อมูลจัดส่ง"
      case "status":
        return "ตรวจสอบสถานะ"
      case "review":
        return "ตรวจสอบคำสั่งซื้อ"
      case "payment":
        return "ชำระเงิน"
      case "result":
        return "ผลลัพธ์คำสั่งซื้อ"
      default:
        return "ข้อมูลจัดส่ง"
    }
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case "shipping":
        return <ShippingStep />
      case "status":
        return <StatusStep />
      case "review":
        return <ReviewStep />
      case "payment":
        return <PaymentStep />
      case "result":
        return <ResultStep />
      default:
        return <ShippingStep />
    }
  }

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
              {nameStepMap()}
            </h1>
            {/* <p className="text-xs text-gray-500 md:text-sm">
              ทำตามขั้นตอนทีละขั้นเพื่อสั่งยาและชำระเงินอย่างครบถ้วน
            </p> */}
          </div>
        </header>
        <OrderStepper />


        <main className="rounded-3xl bg-transparent">{renderStep()}</main>
      </div>
    </div>
  )
}

export default function OrderPage() {
  return (
    <OrderFlowProvider>
      <OrderPageBody />
    </OrderFlowProvider>
  )
}
