"use client";

import { useRouter } from "next/navigation";
import { useState  , useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {  MoreHorizontal } from "lucide-react";
import { LastestAppointment } from "@/services/appointmentService";
import { latestOrder } from "@/services/apiService";

type LatestOrderData =  {
  "delivery_at": "string",
  "delivery_status": "string",
  "doctor_id": "string",
  "note": "string",
  "order_id": "string",
  "order_items": [
    {
      "medicine_id": "string",
      "medicine_name": "string",
      "quantity": 0
    }
  ],
  "patient_id": "string",
  "reviewed_at": "string",
  "status": "string",
  "submitted_at": "string",
  "total_amount": 0
}

type LastestAppointmentData = {
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_id: string;
  specialty: string;
  start_time: string;
  end_time: string;
  status: string;
};


export default function CheckRightsPage() {
  const router = useRouter();

  const [reminderOn, setReminderOn] = useState(true);
  const [latest, setLatest] = useState<LastestAppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const latestRes = await LastestAppointment();
        setLatest(latestRes);

      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลการนัดหมายได้");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("th-TH");

return (
  <div className="min-h-screen bg-[#AFFFD5]">
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
      <main className="p-6">

        <h1 className="text-L font-bold mb-4 text-green-700">
          การสั่งยาครั้งล่าสุด :</h1>
        <div className="bg-white rounded-xl shadow p-20">
        </div>


         <section>
          <h2 className="text-lg font-bold mb-3 text-green-700">ประวัติการนัดที่ผ่านมา :</h2>
          <ul className="space-y-4">  
            {latest ?  (
              <li
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No Img
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">
                    นพ.{latest.doctor_first_name} {latest.doctor_last_name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">แผนก : {latest.specialty}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    เวลา : {formatDate(latest.start_time)} - {formatDate(latest.end_time)}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </li>
              
            ) : (<p className="text-gray-600">ไม่มีประวัติการนัดที่ผ่านมา</p>
            )
      }</ul>
      </section>
      
       <div className="mt-4 flex flex-col w-full space-y-2">
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
            onClick={() => router.push("/landing_page/book_app/buy_drug")}
            className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
          >
            สั่งยา
          </button>
        </div>
      </main>
    </div>
  
);
}