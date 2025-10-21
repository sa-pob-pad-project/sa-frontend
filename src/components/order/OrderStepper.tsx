"use client"

import { useOrderFlow } from "@/contexts/OrderFlowContext"

export function OrderStepper() {
  const {
    state: { currentStep, steps },
    stepMeta,
  } = useOrderFlow()

  const activeIndex = steps.indexOf(currentStep)

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {stepMeta.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = index < activeIndex

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor:
                      isActive || isCompleted ? "#1BC47D" : "transparent",
                    color: isActive || isCompleted ? "#ffffff" : "#1BC47D",
                    borderColor: "#1BC47D",
                  }}
                >
                  {index + 1}
                </div>
                <div className="hidden min-w-[120px] flex-col md:flex">
                  <span className="text-sm font-semibold text-gray-800">
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-gray-500">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
              {index < stepMeta.length - 1 && (
                <div
                  className="mt-2 hidden h-px w-full md:block"
                  style={{
                    backgroundColor: index < activeIndex ? "#1BC47D" : "#E5E7EB",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2 md:hidden">
        <span className="rounded-full bg-[#1BC47D]/10 px-3 py-1 text-xs font-medium text-[#1BC47D]">
          ขั้นตอน {activeIndex + 1} / {stepMeta.length}
        </span>
        <span className="text-xs text-gray-600">
          {stepMeta[activeIndex]?.label}
        </span>
      </div>
    </div>
  )
}

