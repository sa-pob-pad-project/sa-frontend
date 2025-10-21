"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone } from "lucide-react";

import { PaymentMethod, useOrderFlow } from "@/contexts/OrderFlowContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createPaymentAttempt, createPaymentInfo, getPaymentInfoByMethod } from "@/services/apiPaymentService";
import { getOrderById } from "@/services/apiOrderService";
import { getMedicineById } from "@/services/apiMedicineService";

const PHONE_REGEX = /^0[0-9]{8,9}$/;

type Stage =
  | "idle"
  | "validating"
  | "creatingInfo"
  | "creatingAttempt"
  | "success"
  | "error";

type MergedItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  dosage?: string;
  unit?: string;
};

type PaymentInfo = {
  id: string
  method: "credit_card" | "promptpay"
  details: unknown // หรือระบุเป็น union ถ้ารู้ schema ชัดเจน
}


function encodeDetails(details: Record<string, string>) {
  if (typeof window === "undefined" || typeof window.btoa !== "function") {
    throw new Error("ไม่สามารถเข้ารหัสข้อมูลการชำระเงินได้");
  }
  const json = JSON.stringify(details);
  const ascii = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return window.btoa(ascii);
}

export function PaymentStep() {
  const router = useRouter();
  const {
    state,
    setPaymentMethod,
    setCardDraft,
    setPromptPayDraft,
    setStatus,
    nextStep,
    previousStep,
  } = useOrderFlow();

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)

  // ====== ดึง "รายการยา" แบบเดียวกับ ReviewStep ======
  const [loadingItems, setLoadingItems] = useState(false);
  const [items, setItems] = useState<MergedItem[]>([]);
  const [apiTotal, setApiTotal] = useState<number | undefined>(undefined);
  const priceCacheRef = useRef(new Map<string, { price: number; unit: string | undefined }>());

  useEffect(() => {
    let cancelled = false

    const method = state.payment.method
    if (!method) {
      setPaymentInfo(null)
      setError(null)
      setStage("idle")
      return
    }

    setStage("validating")
    setError(null)

    ;(async () => {
      try {
        const res = await getPaymentInfoByMethod(method) // e.g. GET /payment?method=...
        if (cancelled) return
        setPaymentInfo(res)
        // ยังไม่เริ่ม flow สร้าง info/attempt → กลับไป idle รอ action ต่อไป
        setStage("idle")
      } catch (e: any) {
        if (cancelled) return
        setPaymentInfo(null)
        setError(e?.message ?? "โหลดข้อมูลการชำระเงินล้มเหลว")
        setStage("error")
        console.error("Failed to fetch payment info:", e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [state.payment.method])

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!state.orderId) {
        // fallback: ไม่มี orderId ใช้ของใน state ไปพลาง ๆ
        const merged = state.items.map((it) => ({
          id: String(it.id),
          name: it.name,
          quantity: it.quantity,
          price: it.price ?? 0,
          dosage: it.dosage,
        }));
        setItems(merged);
        setApiTotal(undefined);
        return;
      }

      setLoadingItems(true);
      setError(null);
      try {
        const resp = await getOrderById(state.orderId);

        const orderItems = resp?.order_items;
        if (!Array.isArray(orderItems)) throw new Error("ไม่พบคำสั่งซื้อในระบบ");

        setApiTotal(resp.total_amount);

        // map dosage จาก state.items ถ้ามี
        const localById = new Map<string, { dosage?: string }>();
        const localByName = new Map<string, { dosage?: string }>();
        for (const it of state.items) {
          localById.set(String(it.id), { dosage: it.dosage });
          localByName.set(String(it.name).trim().toLowerCase(), { dosage: it.dosage });
        }

        // fetch ราคาแต่ละตัว (cache + Promise.all)
        const fetchPrice = async (id: string): Promise<{ price: number; unit: string | undefined }> => {
          const cached = priceCacheRef.current.get(id);
          if (cached) return cached;
          const medResp = await getMedicineById(id);
          const med = medResp?.medicine;
          const entry = {
            price: typeof med?.price === "number" ? med.price : 0,
            unit: med?.unit ?? undefined,
          };
          priceCacheRef.current.set(id, entry);
          return entry;
        };

        const mergedPromises = orderItems.map(async (it: any) => {
          const id = String(it.medicine_id);
          const name = it.medicine_name;
          const priceInfo = await fetchPrice(id);
          const local = localById.get(id) ?? localByName.get(name.trim().toLowerCase());
          return {
            id,
            name,
            quantity: it.quantity ?? 0,
            price: priceInfo.price ?? 0,
            unit: priceInfo.unit,
            dosage: local?.dosage,
          } as MergedItem;
        });

        const merged = await Promise.all(mergedPromises);
        if (!ignore) setItems(merged);
      } catch (e: any) {
        if (!ignore) setError(e?.message ?? "ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ");
      } finally {
        if (!ignore) setLoadingItems(false);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [state.orderId, state.items]);

  // ====== คำนวณราคา (อิงรายการที่ดึงมา) ======
  const pricing = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );
    const deliveryFee = state.shipping.method === "flash" ? 0 : 0;
    const total = typeof apiTotal === "number" ? apiTotal : subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, [items, apiTotal, state.shipping.method]);

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
      }),
    []
  );

  // ====== ชำระเงิน ======
  const paymentMethod = state.payment.method;
  const card = state.payment.card;
  const promptpay = state.payment.promptpay;

  const disabled = (stage !== "idle" && stage !== "error") || loadingItems;

  const validate = (): string | null => {
    if (!state.orderId) return "ไม่มีรหัสคำสั่งซื้อ (orderId)";

    if (paymentMethod === "credit_card") {
      if (!card.cardNumber?.trim()) return "กรุณากรอกหมายเลขบัตร";
      if (!card.cardHolder?.trim()) return "กรุณากรอกชื่อบนบัตร";
      if (!card.expiryDate?.trim()) return "กรุณากรอกวันหมดอายุบัตร";
      if (!card.cvv?.trim()) return "กรุณากรอก CVV";
      return null;
    }

    const phone = promptpay.phoneNumber?.trim() ?? "";
    if (!phone || !PHONE_REGEX.test(phone)) {
      return "กรุณากรอกเบอร์โทรศัพท์สำหรับ PromptPay ให้ถูกต้อง";
    }
    return null;
  };

  const handlePayment = async () => {
    setError(null);
    setStage("validating");

    const validateMsg = validate();
    if (validateMsg) {
      setError(validateMsg);
      setStage("error");
      return;
    }

    try {
      setStage("creatingInfo");

      let details: Record<string, string> = {};
      if (paymentMethod === "credit_card") {
        details = {
          card_number: card.cardNumber.replace(/\s+/g, ""),
          card_name: card.cardHolder,
          expiry_date: card.expiryDate,
          cvv: card.cvv,
        };
      } else {
        details = { phone_number: promptpay.phoneNumber.trim() };
      }

      const encodedDetails = encodeDetails(details);
      const paymentInfoResponse = await createPaymentInfo({
        payment_method: paymentMethod,
        details: encodedDetails,
      });
      console.log("[order-flow] Created payment info:", paymentInfoResponse);

      const paymentInfoId = paymentInfoResponse?.payment_info?.id;
      if (!paymentInfoId) throw new Error("ไม่พบข้อมูลการชำระเงินที่สร้างขึ้น");
      if (!state.orderId) throw new Error("ไม่พบรหัสคำสั่งซื้อ");

      setStage("creatingAttempt");

      await createPaymentAttempt({
        order_id: state.orderId,
        payment_info_id: paymentInfoId,
      });

      setStatus("PROCESSING");
      setStage("success");
      nextStep();
    } catch (err) {
      console.error("[order-flow] Payment error:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดำเนินการชำระเงิน");
      setStage("error");
    }
  };

  const handleMethodChange = (value: PaymentMethod) => {
    if (stage !== "idle") setStage("idle");
    if (error) setError(null);
    setPaymentMethod(value);
  };

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
          disabled={disabled}
        >
          ดูประวัติการชำระเงิน
        </Button>
      </div>

      {/* สรุปราคา (ใช้รายการที่ดึงมา) */}
      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
        {loadingItems ? (
          <p className="text-sm text-gray-600">กำลังโหลดรายการยา…</p>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>ค่ายา</span>
              <span>{formatCurrency.format(pricing.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ค่าจัดส่ง</span>
              <span>{pricing.deliveryFee ? formatCurrency.format(pricing.deliveryFee) : "ฟรี"}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-900">
              <span>ยอดรวมทั้งหมด</span>
              <span>{formatCurrency.format(pricing.total)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* เลือกวิธีชำระเงิน */}
      <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
        <h3 className="text-sm font-semibold text-gray-800">เลือกวิธีชำระเงิน</h3>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: PaymentMethod) => handleMethodChange(value)}
          className="mt-4 space-y-3"
          disabled={disabled}
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

      {/* ฟอร์ม */}
      {state.payment.method === "credit_card" && (
        <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลบัตรเครดิต</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="card-number" className="text-xs text-gray-600">
                หมายเลขบัตร
              </Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={state.payment.card.cardNumber}
                onChange={(e) => setCardDraft({ cardNumber: e.target.value })}
                className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                maxLength={19}
                inputMode="numeric"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="card-holder" className="text-xs text-gray-600">
                ชื่อบนบัตร
              </Label>
              <Input
                id="card-holder"
                placeholder="ชื่อ - นามสกุล"
                value={state.payment.card.cardHolder}
                onChange={(e) => setCardDraft({ cardHolder: e.target.value })}
                className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                disabled={disabled}
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
                  value={state.payment.card.expiryDate}
                  onChange={(e) => setCardDraft({ expiryDate: e.target.value })}
                  className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                  maxLength={5}
                  inputMode="numeric"
                  disabled={disabled}
                />
              </div>
              <div>
                <Label htmlFor="card-cvv" className="text-xs text-gray-600">
                  CVV
                </Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={state.payment.card.cvv}
                  onChange={(e) => setCardDraft({ cvv: e.target.value })}
                  className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
                  maxLength={3}
                  inputMode="numeric"
                  type="password"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {state.payment.method === "promptpay" && (
        <Card className="rounded-3xl border-none bg-[#BFFFE3] p-5 shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูล PromptPay</h3>
          <div>
            <Label htmlFor="promptpay-phone" className="text-xs text-gray-600">
              เบอร์โทรศัพท์
            </Label>
            <Input
              id="promptpay-phone"
              placeholder="0812345678"
              value={state.payment.promptpay.phoneNumber}
              onChange={(e) =>
                setPromptPayDraft({ phoneNumber: e.target.value.replace(/\D/g, "") })
              }
              className="mt-1 rounded-2xl border-gray-200 bg-white text-sm"
              maxLength={10}
              inputMode="numeric"
              disabled={disabled}
            />
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* แถบสถานะ stage */}
      {stage !== "idle" && (
        <p className="text-xs text-gray-500">
          {stage === "validating" && "กำลังตรวจสอบข้อมูล…"}
          {stage === "creatingInfo" && "กำลังบันทึกข้อมูลการชำระเงิน…"}
          {stage === "creatingAttempt" && "กำลังยืนยันการชำระเงิน…"}
          {stage === "success" && "สำเร็จ! กำลังไปขั้นตอนถัดไป…"}
          {stage === "error" && "เกิดข้อผิดพลาด กรุณาแก้ไขแล้วลองใหม่"}
        </p>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <Button
          variant="outline"
          className="rounded-full border-[#1BC47D] text-[#1BC47D] hover:bg-[#1BC47D]/10 md:flex-1"
          onClick={() => previousStep()}
          disabled={disabled}
        >
          กลับไปตรวจสอบรายการ
        </Button>
        <Button
          className="rounded-full bg-[#1BC47D] text-white hover:bg-[#18a86a] md:flex-[1.5]"
          onClick={handlePayment}
          disabled={disabled}
        >
          {disabled && stage !== "error" ? "กำลังดำเนินการ..." : "ชำระเงิน"}
        </Button>
      </div>
    </div>
  );
}
