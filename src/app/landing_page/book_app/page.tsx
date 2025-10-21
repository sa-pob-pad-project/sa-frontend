"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { LastestAppointment } from "@/services/appointmentService";
import { latestOrder } from "@/services/apiService";

type OrderItem = {
  medicine_id: string;
  medicine_name: string;
  quantity: number;
};

type LatestOrderData = {
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
};

type LastestAppointmentData = {
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_id: string;
  specialty: string;
  start_time: string;
  end_time: string;
  status: string;
  doctor_image?: string; 
};

export default function CheckRightsPage() {
  const router = useRouter();

  const [latestOrderData, setLatestOrderData] = useState<LatestOrderData | null>(null);
  const [latestAppointment, setLatestAppointment] = useState<LastestAppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const orderRes = await latestOrder();
        setLatestOrderData(orderRes);

        const appointmentRes = await LastestAppointment();
        
        setLatestAppointment({
          ...appointmentRes,
          doctor_image: "/images/หมอ.png",
        });

      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <div className="min-h-screen bg-gradient-to-b from-[#E9FFF2] to-white">
      {/* Navbar */}
      <nav className="bg-white text-black px-6 py-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => router.push("/landing_page")}
          className="flex items-center text-black hover:scale-105 transition-transform"   
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-semibold text-black">
          ประวัติการรักษาครั้งล่าสุด
        </h1>
      </nav>

      <main className="p-6 space-y-10">
        {/* การสั่งยาครั้งล่าสุด */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">การสั่งยาครั้งล่าสุด :</h2>
          {latestOrderData ? (
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6">
              {/* รูป Mockup ยา */}
              <div className="relative w-32 h-32">
                <Image
                  src="/images/ยา.png"
                  alt="รูปยาครั้งล่าสุด"
                  fill
                  className="object-contain rounded-xl"
                />
              </div>

              <div className="flex-1 text-sm">
                <p className="font-medium">Order ID: {latestOrderData.order_id}</p>
                <p className="text-gray-600 mt-1">สถานะ: {latestOrderData.status}</p>
                <p className="text-gray-600 mt-1">การจัดส่ง: {latestOrderData.delivery_status}</p>
                <p className="text-gray-600 mt-1">รวมราคา: {latestOrderData.total_amount} บาท</p>
                <p className="text-gray-600 mt-1">
                  รายการยา: {latestOrderData.order_items.map(i => i.medicine_name).join(", ")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">ไม่มีการสั่งยาครั้งล่าสุด</p>
          )}
        </section>

        {/* ประวัติการนัดล่าสุด */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">ประวัติการนัดล่าสุด :</h2>
          {latestAppointment ? (
            <ul className="space-y-4">
              <li className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
                {/* รูปหมอ Mockup */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src={latestAppointment.doctor_image || "/images/หมอ.png"}
                    alt="รูปหมอ"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 text-sm">
                  <p className="font-medium">
                    นพ.{latestAppointment.doctor_first_name} {latestAppointment.doctor_last_name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">แผนก: {latestAppointment.specialty}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    เวลา: {formatDate(latestAppointment.start_time)} - {formatDate(latestAppointment.end_time)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">สถานะ: {latestAppointment.status}</p>
                </div>

                <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </li>
            </ul>
          ) : (
            <p className="text-gray-600">ไม่มีประวัติการนัดล่าสุด</p>
          )}
        </section>

        {/* Footer ปุ่ม */}
        <footer className="mt-10">
          <div className="flex flex-col w-full space-y-2">
            <button
              onClick={() => router.push("/landing_page/book_app/booking")}
              className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
            >
              นัดพบแพทย์
            </button>
            <button
              onClick={() => router.push("/landing_page/history_app")}
              className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
            >
              ประวัติการนัดพบแพทย์
            </button>
            <button
              onClick={() => router.push("/order")}
              className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
            >
              สั่งยา
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
