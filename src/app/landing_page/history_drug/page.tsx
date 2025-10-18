"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PrescriptionHistoryPage() {
  const router = useRouter();

  const latestOrder = {
    date: "17 SEP 2568",
    orderId: "123456789",
    status: "กำลังดำเนินการ",
    shipping: "กำลังจัดส่ง",
    price: 250,
    qty: 6,
    image: "/images/ยา.png",
  };

  const pastOrders = [
    {
      date: "17 SEP 2568",
      orderId: "123456789",
      status: "ชำระเงินแล้ว",
      note: "จัดส่งสำเร็จ",
      completedAt: "20 SEP 2568 เวลา 12:12 น.",
      price: 250,
      qty: 6,
      image: "/images/ยา.png",
    },
    {
      date: "17 SEP 2568",
      orderId: "123456789",
      status: "ชำระเงินแล้ว",
      note: "การรับยาเสร็จสิ้น",
      completedAt: "20 SEP 2568 เวลา 12:12 น.",
      price: 250,
      qty: 6,
      image: "/images/ยา.png",
    },
  ];

  return (
    <main className="min-h-screen bg-[#C7FFE4] text-gray-900">
      {/* ✅ Header */}
      <header className="sticky top-0 z-10 bg-white shadow flex items-center px-4 py-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:scale-105 transition-transform"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl font-bold">
          ประวัติการรับยา
        </h1>
      </header>

      {/* ✅ Latest Order */}
      <section className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#00875A] mb-3">
          สถานะล่าสุด
        </h2>

        <article
          className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
          aria-label="รายการล่าสุด"
        >
          <header className="flex justify-between items-start">
            <div>
              <p className="font-medium">{latestOrder.date}</p>
              <p className="text-gray-500 text-sm">{latestOrder.orderId}</p>
            </div>
            <span className="text-yellow-600 font-semibold text-sm">
              {latestOrder.status}
            </span>
          </header>

          <p className="mt-3 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium sm:w-auto w-full text-center">
            {latestOrder.shipping}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
            <figure className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={latestOrder.image}
                alt="รูปภาพยา"
                fill
                className="object-contain rounded-md"
              />
            </figure>

            <div className="flex-1 text-sm">
              <p>ยา........................................12 เม็ด/แผง</p>
              <p className="mt-2">
                {latestOrder.price} บาท × {latestOrder.qty}
              </p>
              <footer className="mt-2 border-t pt-2 text-right font-semibold">
                ทั้งหมด {latestOrder.price} บาท
              </footer>
            </div>
          </div>
        </article>
      </section>

      {/* ✅ Past Orders */}
      <section className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#00875A] mb-3">
          ประวัติการสั่งยาที่ผ่านมา
        </h2>

        <div className="flex flex-col gap-5">
          {pastOrders.map((order, index) => (
            <article
              key={index}
              className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              aria-label={`รายการสั่งยา ${index + 1}`}
            >
              <header className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.date}</p>
                  <p className="text-gray-500 text-sm">{order.orderId}</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">
                  {order.status}
                </span>
              </header>

              <div className="flex items-center gap-2 mt-3 bg-[#C7FFE4] px-3 py-2 rounded-md text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>
                  {order.note} <br />
                  {order.completedAt}
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
                <figure className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={order.image}
                    alt="รูปภาพยา"
                    fill
                    className="object-contain rounded-md"
                  />
                </figure>

                <div className="flex-1 text-sm">
                  <p>ยา........................................12 เม็ด/แผง</p>
                  <p className="mt-2">
                    {order.price} บาท × {order.qty}
                  </p>
                  <footer className="mt-2 border-t pt-2 text-right font-semibold">
                    ทั้งหมด {order.price} บาท
                  </footer>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
