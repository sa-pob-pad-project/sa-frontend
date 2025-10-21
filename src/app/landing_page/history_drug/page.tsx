"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, MoreHorizontal } from "lucide-react";
import { HistoryOrder } from "@/services/apiorder";


type OrderItem = {
  medicine_id: string;
  medicine_name: string;
  quantity: number;
};

type OrderData = {
  created_at: string;
  delivery_at: string;
  delivery_status: string;
  doctor_id: string;
  note: string;
  order_id: string;
  order_items: OrderItem[];
  patient_id: string;
  reviewed_at: string;
  status: string;
  submitted_at: string;
  total_amount: number;
  updated_at: string;
};

export default function PrescriptionHistoryPage() {
  const router = useRouter();
  const [latestOrder, setLatestOrder] = useState<OrderData | null>(null);
  const [pastOrders, setPastOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await HistoryOrder();
        const orders: OrderData[] = res.orders || [];

        if (orders.length > 0) {
          setLatestOrder(orders[0]);
          setPastOrders(orders.slice(1));
        }
      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลการสั่งยาได้");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9FFF2] to-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white text-black px-4 py-3 flex items-center shadow-md sticky top-0 z-10">
        <button
          onClick={() => router.push("/landing_page")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl font-semibold text-gray-800">
          ประวัติการรับยา
        </h1>
      </nav>

      <main className="flex-1 p-6 space-y-10">
        {/* Latest Order */}
        {latestOrder && (
          <section>
            <h2 className="text-lg font-bold mb-3 text-black">สถานะล่าสุด</h2>

            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-yellow-400 p-4 text-white flex flex-col md:flex-row md:items-center md:justify-between rounded-t-2xl">
                <div>
                  <p className="text-xs opacity-80">วันที่สั่ง :</p>
                  <p className="font-medium">{formatDate(latestOrder.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => router.push(`/order/${latestOrder.order_id}/summary`)}>
                <div className="flex-1 text-sm">
                  <p className="font-medium">Order ID: {latestOrder.order_id}</p>
                  <p className="mt-1">สถานะ: {latestOrder.status}</p>
                  <p className="mt-1">การจัดส่ง: {latestOrder.delivery_status}</p>
                  <p className="mt-1">
                    รวมราคา: {latestOrder.total_amount} บาท
                  </p>
                  <p className="mt-1">
                    รายการยา: {latestOrder.order_items.map(i => i.medicine_name).join(", ")}
                  </p>
                </div>
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src="/images/ยา.png"
                    alt="ยาครั้งล่าสุด"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-3 px-4 pb-4">
                <button className="py-2 px-4 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition">
                  ยกเลิกคำสั่ง
                </button>

                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </article>
          </section>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3 text-black">ประวัติการสั่งยาที่ผ่านมา</h2>

            <ul className="space-y-4">
              {pastOrders.map((order, index) => (
                <li
                  key={index}
                  className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm hover:shadow-md transition cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/order/${order.order_id}/summary`)}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    No Img
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">Order ID: {order.order_id}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      วันที่สั่ง: {formatDate(order.created_at)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">สถานะ: {order.status}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      รวมราคา: {order.total_amount} บาท
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      รายการยา: {order.order_items.map(i => i.medicine_name).join(", ")}
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
