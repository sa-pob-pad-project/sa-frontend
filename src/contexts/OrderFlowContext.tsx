"use client"

import { createContext, useContext, useEffect, useMemo, useReducer } from "react"

export type DeliveryMethod = "flash" | "pick_up"
export type PaymentMethod = "credit_card" | "promptpay"
export type OrderFlowStepId = "shipping" | "status" | "review" | "payment" | "result"

export interface OrderFlowStepMeta {
  id: OrderFlowStepId
  label: string
  description?: string
}

export type OrderTimelineStatus =
  | "APPROVED"
  | "WAITING_PAYMENT"
  | "PREPARING"
  | "SHIPPING"
  | "COMPLETED"

export interface OrderStatusMeta {
  key: OrderTimelineStatus
  label: string
  description: string
}

export interface DoctorInfo {
  id: string
  name: string
  specialty: string
  hospital: string
  avatarUrl?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  dosage?: string
  price: number
}

export interface OrderHistoryEntry {
  id: string
  orderNumber: string
  createdAt: string
  doctor: DoctorInfo
  items: OrderItem[]
  note?: string
}

export interface ShippingInfo {
  method: DeliveryMethod
  address: string
  phone: string
  note?: string
  pickupLocation?: string
  deliveryInfoId?: string
}

export interface CardPaymentDraft {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}

export interface PromptPayDraft {
  phoneNumber: string
}

export interface PaymentDraft {
  method: PaymentMethod
  card: CardPaymentDraft
  promptpay: PromptPayDraft
}

export interface OrderFlowState {
  steps: OrderFlowStepId[]
  currentStep: OrderFlowStepId
  history: OrderHistoryEntry[]
  doctor: DoctorInfo
  items: OrderItem[]
  shipping: ShippingInfo
  note: string
  payment: PaymentDraft
  orderId?: string
  status: OrderTimelineStatus
}

interface OrderFlowContextValue {
  state: OrderFlowState
  stepMeta: OrderFlowStepMeta[]
  statusMeta: OrderStatusMeta[]
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: OrderFlowStepId) => void
  resetFlow: () => void
  setShipping: (info: Partial<ShippingInfo>) => void
  setItems: (items: OrderItem[]) => void
  setNote: (note: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCardDraft: (draft: Partial<CardPaymentDraft>) => void
  setPromptPayDraft: (draft: Partial<PromptPayDraft>) => void
  setOrderId: (orderId: string | undefined) => void
  setStatus: (status: OrderTimelineStatus) => void
  beginFromHistory: (historyId: string) => void
}

type OrderFlowAction =
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "GO_TO_STEP"; payload: { step: OrderFlowStepId } }
  | { type: "RESET_FLOW" }
  | { type: "SET_SHIPPING"; payload: Partial<ShippingInfo> }
  | { type: "SET_ITEMS"; payload: OrderItem[] }
  | { type: "SET_NOTE"; payload: string }
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SET_CARD_DRAFT"; payload: Partial<CardPaymentDraft> }
  | { type: "SET_PROMPTPAY_DRAFT"; payload: Partial<PromptPayDraft> }
  | { type: "SET_ORDER_ID"; payload: string | undefined }
  | { type: "SET_STATUS"; payload: OrderTimelineStatus }
  | { type: "BEGIN_FROM_HISTORY"; payload: { historyId: string } }

const ORDER_FLOW_STEPS: OrderFlowStepMeta[] = [
  {
    id: "shipping",
    label: "ข้อมูลการจัดส่ง",
    description: "ระบุวิธีรับยาและกรอกข้อมูลให้ครบถ้วน",
  },
  {
    id: "status",
    label: "สถานะการสั่งยา",
    description: "ติดตามความคืบหน้าของคำสั่งซื้อ",
  },
  {
    id: "review",
    label: "ตรวจสอบรายการยา",
    description: "ตรวจสอบความถูกต้องก่อนชำระเงิน",
  },
  {
    id: "payment",
    label: "ชำระเงิน",
    description: "เลือกวิธีและยืนยันการชำระเงิน",
  },
  {
    id: "result",
    label: "สรุปสถานะ",
    description: "ดูสถานะล่าสุดหลังชำระเงิน",
  },
]

const ORDER_STATUS_SEQUENCE: OrderStatusMeta[] = [
  {
    key: "APPROVED",
    label: "อนุมัติแล้ว",
    description: "ใบสั่งยาผ่านการอนุมัติจากแพทย์เรียบร้อย",
  },
  {
    key: "WAITING_PAYMENT",
    label: "รอชำระเงิน",
    description: "กรุณาชำระเงินเพื่อให้เริ่มเตรียมยา",
  },
  {
    key: "PREPARING",
    label: "เตรียมจัดส่ง",
    description: "เภสัชกรกำลังจัดเตรียมยาและบรรจุภัณฑ์",
  },
  {
    key: "SHIPPING",
    label: "กำลังจัดส่ง",
    description: "พัสดุออกจากคลังแล้วและอยู่ระหว่างจัดส่ง",
  },
  {
    key: "COMPLETED",
    label: "ส่งถึงแล้ว",
    description: "ได้รับยาเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ",
  },
]

const ORDER_FLOW_STORAGE_KEY = "order-flow-state"

const DEFAULT_HISTORY: OrderHistoryEntry[] = [
  {
    id: "history-001",
    orderNumber: "123456789",
    createdAt: "2025-09-17T08:00:00+07:00",
    doctor: {
      id: "doctor-001",
      name: "นพ.เทิด เทิน",
      specialty: "แพทย์แผนทั่วไป",
      hospital: "โรงพยาบาลวิจัยควอนตัมการแพทย์ศาสตร์",
      avatarUrl: "/images/doctor-placeholder.svg",
    },
    note: "มีอาการปวดศีรษะเรื้อรัง ตรวจติดตามทุก 2 เดือน",
    items: [
      {
        id: "medicine-001",
        name: "ยาแก้ปวดศีรษะ",
        dosage: "12 เม็ด / แพ็ค",
        quantity: 6,
        price: 250,
      },
      {
        id: "medicine-002",
        name: "วิตามินบำรุงสมอง",
        dosage: "12 เม็ด / แพ็ค",
        quantity: 6,
        price: 250,
      },
      {
        id: "medicine-003",
        name: "ยาคลายกล้ามเนื้อ",
        dosage: "12 เม็ด / แพ็ค",
        quantity: 6,
        price: 250,
      },
    ],
  },
]

const DEFAULT_STATE: OrderFlowState = {
  steps: ORDER_FLOW_STEPS.map((step) => step.id),
  currentStep: "shipping",
  history: DEFAULT_HISTORY,
  doctor: {
    ...(DEFAULT_HISTORY[0]?.doctor ?? {
      id: "doctor-default",
      name: "ทีมแพทย์ประจำโรงพยาบาล",
      specialty: "แพทย์ประจำ",
      hospital: "โรงพยาบาลของคุณ",
      avatarUrl: "/images/doctor-placeholder.svg",
    }),
  },
  items: DEFAULT_HISTORY[0]?.items ?? [],
  shipping: {
    method: "flash",
    address: "",
    phone: "",
    note: "",
    pickupLocation: "",
    deliveryInfoId: undefined,
  },
  note: "",
  payment: {
    method: "credit_card",
    card: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
    promptpay: {
      phoneNumber: "",
    },
  },
  orderId: undefined,
  status: "APPROVED",
}

function orderFlowReducer(state: OrderFlowState, action: OrderFlowAction): OrderFlowState {
  switch (action.type) {
    case "NEXT_STEP": {
      const nextIndex = Math.min(
        state.steps.length - 1,
        state.steps.indexOf(state.currentStep) + 1,
      )
      return {
        ...state,
        currentStep: state.steps[nextIndex],
      }
    }
    case "PREVIOUS_STEP": {
      const prevIndex = Math.max(0, state.steps.indexOf(state.currentStep) - 1)
      return {
        ...state,
        currentStep: state.steps[prevIndex],
      }
    }
    case "GO_TO_STEP": {
      if (!state.steps.includes(action.payload.step)) {
        return state
      }
      return {
        ...state,
        currentStep: action.payload.step,
      }
    }
    case "RESET_FLOW": {
      return {
        ...DEFAULT_STATE,
        history: state.history,
        doctor: state.doctor,
      }
    }
    case "SET_SHIPPING": {
      return {
        ...state,
        shipping: {
          ...state.shipping,
          ...action.payload,
        },
      }
    }
    case "SET_ITEMS": {
      return {
        ...state,
        items: action.payload,
      }
    }
    case "SET_NOTE": {
      return {
        ...state,
        note: action.payload,
      }
    }
    case "SET_PAYMENT_METHOD": {
      return {
        ...state,
        payment: {
          ...state.payment,
          method: action.payload,
        },
      }
    }
    case "SET_CARD_DRAFT": {
      return {
        ...state,
        payment: {
          ...state.payment,
          card: {
            ...state.payment.card,
            ...action.payload,
          },
        },
      }
    }
    case "SET_PROMPTPAY_DRAFT": {
      return {
        ...state,
        payment: {
          ...state.payment,
          promptpay: {
            ...state.payment.promptpay,
            ...action.payload,
          },
        },
      }
    }
    case "SET_ORDER_ID": {
      return {
        ...state,
        orderId: action.payload,
      }
    }
    case "SET_STATUS": {
      return {
        ...state,
        status: action.payload,
      }
    }
    case "BEGIN_FROM_HISTORY": {
      const historyEntry = state.history.find(
        (entry) => entry.id === action.payload.historyId,
      )

      if (!historyEntry) {
        return state
      }

      return {
        ...state,
        currentStep: "shipping",
        doctor: historyEntry.doctor,
        items: historyEntry.items,
        note: historyEntry.note ?? "",
        shipping: {
          ...DEFAULT_STATE.shipping,
        },
        orderId: undefined,
        status: "APPROVED",
      }
    }
    default:
      return state
  }
}

const OrderFlowContext = createContext<OrderFlowContextValue | undefined>(
  undefined,
)

function getInitialState(): OrderFlowState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE
  }

  try {
    const persisted = window.sessionStorage.getItem(ORDER_FLOW_STORAGE_KEY)
    if (!persisted) {
      return DEFAULT_STATE
    }

    const parsed = JSON.parse(persisted) as Partial<OrderFlowState>
    return {
      ...DEFAULT_STATE,
      ...parsed,
      steps: DEFAULT_STATE.steps,
      shipping: {
        ...DEFAULT_STATE.shipping,
        ...(parsed.shipping ?? {}),
      },
      items: parsed.items ?? DEFAULT_STATE.items,
      note: parsed.note ?? DEFAULT_STATE.note,
      orderId: parsed.orderId ?? DEFAULT_STATE.orderId,
      status: parsed.status ?? DEFAULT_STATE.status,
      payment: DEFAULT_STATE.payment,
    }
  } catch (error) {
    console.warn("[order-flow] Failed to parse persisted state", error)
    return DEFAULT_STATE
  }
}

export function OrderFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderFlowReducer, undefined, getInitialState)

  useEffect(() => {
    if (typeof window === "undefined") return

    const serialisableState = {
      currentStep: state.currentStep,
      shipping: state.shipping,
      items: state.items,
      note: state.note,
      orderId: state.orderId,
      status: state.status,
    }

    window.sessionStorage.setItem(
      ORDER_FLOW_STORAGE_KEY,
      JSON.stringify(serialisableState),
    )
  }, [
    state.currentStep,
    state.shipping,
    state.items,
    state.note,
    state.orderId,
    state.status,
  ])

  const memoisedMeta = useMemo(() => ORDER_FLOW_STEPS, [])
  const memoisedStatusMeta = useMemo(() => ORDER_STATUS_SEQUENCE, [])

  const value = useMemo<OrderFlowContextValue>(() => {
    return {
      state,
      stepMeta: memoisedMeta,
      statusMeta: memoisedStatusMeta,
      nextStep: () => dispatch({ type: "NEXT_STEP" }),
      previousStep: () => dispatch({ type: "PREVIOUS_STEP" }),
      goToStep: (step) => dispatch({ type: "GO_TO_STEP", payload: { step } }),
      resetFlow: () => dispatch({ type: "RESET_FLOW" }),
      setShipping: (info) => dispatch({ type: "SET_SHIPPING", payload: info }),
      setItems: (items) => dispatch({ type: "SET_ITEMS", payload: items }),
      setNote: (note) => dispatch({ type: "SET_NOTE", payload: note }),
      setPaymentMethod: (method) =>
        dispatch({ type: "SET_PAYMENT_METHOD", payload: method }),
      setCardDraft: (draft) =>
        dispatch({ type: "SET_CARD_DRAFT", payload: draft }),
      setPromptPayDraft: (draft) =>
        dispatch({ type: "SET_PROMPTPAY_DRAFT", payload: draft }),
      setOrderId: (orderId) =>
        dispatch({ type: "SET_ORDER_ID", payload: orderId }),
      setStatus: (status) => dispatch({ type: "SET_STATUS", payload: status }),
      beginFromHistory: (historyId) =>
        dispatch({ type: "BEGIN_FROM_HISTORY", payload: { historyId } }),
    }
  }, [state, memoisedMeta, memoisedStatusMeta])

  return (
    <OrderFlowContext.Provider value={value}>
      {children}
    </OrderFlowContext.Provider>
  )
}

export function useOrderFlow() {
  const context = useContext(OrderFlowContext)

  if (!context) {
    throw new Error("useOrderFlow must be used within an OrderFlowProvider")
  }

  return context
}

export function useOrderFlowState() {
  return useOrderFlow().state
}

export function useOrderFlowNavigation() {
  const {
    nextStep,
    previousStep,
    goToStep,
    resetFlow,
    setOrderId,
    setStatus,
  } = useOrderFlow()

  return useMemo(
    () => ({
      nextStep,
      previousStep,
      goToStep,
      resetFlow,
      setOrderId,
      setStatus,
    }),
    [goToStep, nextStep, previousStep, resetFlow, setOrderId, setStatus],
  )
}

