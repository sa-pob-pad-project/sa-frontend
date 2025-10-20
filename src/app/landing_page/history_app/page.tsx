"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, MoreHorizontal } from "lucide-react";
import { LastestAppointment, HistoryAppointment } from "@/services/appointmentService";

type AppointmentData = {
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_id: string;
  specialty: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function AppointmentsPage() {
  const [reminderOn, setReminderOn] = useState(true);
  const [latest, setLatest] = useState<AppointmentData | null>(null);
  const [pastAppointments, setPastAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const latestRes = await LastestAppointment();
        setLatest(latestRes);

        const historyRes = await HistoryAppointment();
        setPastAppointments(historyRes || []);
      } catch (err: any) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลการนัดหมายได้");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString("th-TH");

  return (
    <div className="min-h-screen bg-[#AFFFD5] flex flex-col">
      {/* Navbar */}
      <nav className="bg-white text-black px-4 py-3 flex items-center shadow-md sticky top-0 z-10">
        <button
          onClick={() => router.push("/landing_page")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl font-semibold text-gray-800">
          ประวัติการนัดพบแพทย์
        </h1>
      </nav>

      <main className="flex-1 p-6 space-y-10">
        {/* นัดล่าสุด */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">สถานะล่าสุด :</h2>

          {latest ? (
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-emerald-500 p-4 text-white flex flex-col md:flex-row md:items-center md:justify-between rounded-t-2xl">
                <div>
                  <p className="text-xs opacity-80">เวลานัดหมอ :</p>
                  <p className="font-medium">
                    {formatDate(latest.start_time)} - {formatDate(latest.end_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    ชื่อ : นพ.{latest.doctor_first_name} {latest.doctor_last_name}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">แผนก : {latest.specialty}</p>
                  <p className="text-sm text-gray-700 truncate mt-1">สถานะ : {latest.status}</p>
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              </div>

              <div className="flex gap-3 px-4 pb-4">
                <button
                  onClick={() => setReminderOn(!reminderOn)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-medium transition ${
                    reminderOn
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-600"
                  }`}
                >
                  {reminderOn ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  {reminderOn ? "แจ้งเตือนเปิดอยู่" : "เปิดการแจ้งเตือน"}
                </button>

                <button className="py-2 px-4 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition">
                  ยกเลิกนัด
                </button>

                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </article>
          ) : (
            <p className="text-gray-600">ไม่มีประวัติการนัดล่าสุด</p>
          )}
        </section>

        {/* ประวัติการนัดที่ผ่านมา */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">ประวัติการนัดที่ผ่านมา :</h2>

          {pastAppointments.length > 0 ? (
            <ul className="space-y-4">
              {pastAppointments.map((item, index) => (
                <li
                  key={index}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    No Img
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">
                      นพ.{item.doctor_first_name} {item.doctor_last_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">แผนก : {item.specialty}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      เวลา : {formatDate(item.start_time)} - {formatDate(item.end_time)}
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">ไม่มีประวัติการนัดที่ผ่านมา</p>
          )}
        </section>
      </main>
    </div>
  );
}
