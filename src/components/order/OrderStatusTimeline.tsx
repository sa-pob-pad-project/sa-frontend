"use client"

import {
  OrderStatusMeta,
  OrderTimelineStatus,
} from "@/contexts/OrderFlowContext"
import { CheckCircle2, Circle } from "lucide-react"

interface OrderStatusTimelineProps {
  statuses: OrderStatusMeta[]
  currentStatus: OrderTimelineStatus
  highlightColor?: string
}

export function OrderStatusTimeline({
  statuses,
  currentStatus,
  highlightColor = "#1BC47D",
}: OrderStatusTimelineProps) {
  const activeIndex = Math.max(
    statuses.findIndex((status) => status.key === currentStatus),
    0,
  )

  return (
    <div className="relative flex flex-col gap-4 pl-2">
      {statuses.map((status, index) => {
        const isCompleted = index < activeIndex
        const isActive = index === activeIndex
        const Icon = isCompleted ? CheckCircle2 : Circle

        return (
          <div key={status.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <Icon
                className="h-5 w-5 transition-colors"
                style={{
                  color: isActive || isCompleted ? highlightColor : "#D1D5DB",
                }}
              />
              {index < statuses.length - 1 && (
                <div
                  className="mt-1 w-px flex-1 border-l-2"
                  style={{
                    borderColor: isCompleted ? highlightColor : "#E5E7EB",
                  }}
                />
              )}
            </div>
            <div className="flex-1 rounded-2xl bg-white/70 p-3 shadow-sm">
              <p
                className="text-sm font-semibold text-gray-800"
                style={{
                  color: isActive || isCompleted ? highlightColor : "#1F2937",
                }}
              >
                {status.label}
              </p>
              <p className="mt-1 text-xs text-gray-600">{status.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
