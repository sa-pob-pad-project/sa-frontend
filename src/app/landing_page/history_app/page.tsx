"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/services/apiService";
import { IncomingAppointment } from "@/services/appointmentService";
import { ArrowLeft, MoreHorizontal } from "lucide-react";

type Profile = {
  firstName: string;
  lastName: string;
};

type Appointment = {
  doctor_first_name: string;
  doctor_last_name: string;
  specialty: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function LandingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await getProfile();
        if (userData?.first_name && userData?.last_name) {
          setProfile({
            firstName: userData.first_name,
            lastName: userData.last_name,
          });
        } else {
          throw new Error("ไม่พบข้อมูลผู้ใช้");
        }

        const data = await IncomingAppointment();
        setAppointments(data || []);
      } catch (err: any) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");

        if (err.message?.includes("Unauthorized")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const goTo = (path: string) => router.push(path);
  const formatDate = (d: string) => new Date(d).toLocaleString("th-TH");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#AFFFD5] flex flex-col">
      {/* Navbar */}
      <nav className="bg-white text-black px-4 py-3 flex items-center shadow-md sticky top-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl font-semibold text-gray-800">
          ระบบนัดหมอ
        </h1>
      </nav>

      <main className="flex-1 p-6 space-y-10">
        {/* ข้อมูลผู้ใช้ */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">โปรไฟล์ของฉัน :</h2>
          {profile ? (
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-1">ผู้ใช้ระบบนัดหมอ</p>
              </div>
              <button
                onClick={() => goTo("/profile")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
              >
                ดูโปรไฟล์
              </button>
            </div>
          ) : (
            <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้</p>
          )}
        </section>

        {/* เมนูหลัก */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">เมนูหลัก :</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <MenuCard label="จองคิว" onClick={() => goTo("/landing_page/book_app")} />
            <MenuCard label="ประวัติการนัด" onClick={() => goTo("/landing_page/history_app")} />
            <MenuCard label="ประวัติการสั่งยา" onClick={() => goTo("/landing_page/history_drug")} />
            <MenuCard label="เช็คสิทธิ์รักษา" onClick={() => goTo("/landing_page/check_rights")} />
          </div>
        </section>

        {/* นัดหมายที่จะมาถึง */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-black">นัดหมายที่จะมาถึง :</h2>
          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((item, index) => (
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
                    <p className="text-xs text-gray-600 mt-1">สถานะ : {item.status}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">ไม่มีนัดหมายที่จะมาถึง</p>
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- เมนูการ์ด ---------- */
function MenuCard({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white text-green-900 text-lg font-medium py-8 rounded-3xl text-center shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-1 hover:bg-green-100 transition-all duration-200"
    >
      {label}
    </div>
  );
}
