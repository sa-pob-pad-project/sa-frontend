"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/services/apiService";
import { IncomingAppointment } from "@/services/appointmentService";

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
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);


  const [profileError, setProfileError] = useState<string | null>(null);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

    
      try {
        const userData = await getProfile();
        if (userData?.first_name && userData?.last_name) {
          setProfile({
            firstName: userData.first_name,
            lastName: userData.last_name,
          });
        } else {
          setProfileError("ไม่พบข้อมูลผู้ใช้");
        }
      } catch (err: any) {
        console.error("Profile API Error:", err);
        setProfileError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
       
        if (err.message?.includes("Unauthorized")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }

  
      try {
        const incoming = await IncomingAppointment();
        setAppointments(incoming || []);
      } catch (err: any) {
        console.error("Appointments API Error:", err);
        setAppointmentsError("ไม่สามารถโหลดนัดหมายได้");
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const goTo = (path: string) => router.push(path);
  const formatDate = (d: string) => new Date(d).toString()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9FFF2] to-white text-gray-800">
 
      <nav className="bg-[#AFFFD5]/90 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-md sticky top-0  z-10">
        <h1
          onClick={() => goTo("/landing_page")}
          className="text-black text-2xl font-medium cursor-pointer tracking-tight"
        >
          Appointment System
        </h1>

        {profile ? (
          <div
            onClick={() => goTo("/profile")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <div className="flex flex-col text-right">
              <span className="text-base font-semibold text-green-900">
                {profile.firstName} {profile.lastName}
              </span>
              <span className="text-sm text-gray-600">โปรไฟล์ของฉัน</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-green-200 flex items-center justify-center text-xl shadow-inner">
              👤
            </div>
          </div>
        ) : (
          <span className="text-sm text-red-600">{profileError}</span>
        )}
      </nav>

  
      <header className="text-center mt-10 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
          ยินดีต้อนรับ
        </h2>
        <p className="text-gray-600 text-lg">
          จัดการการนัดหมายกับแพทย์ของคุณได้ง่าย ๆ ในที่เดียว
        </p>
      </header>

   
      <section className="max-w-5xl mx-auto px-6 mb-14">
        <h3 className="text-black text-xl font-semibold mb-5">เมนูหลัก</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <MenuCard label="จองคิว" onClick={() => goTo("/landing_page/book_app")} />
          <MenuCard label="ประวัติการนัด" onClick={() => goTo("/landing_page/history_app")} />
          <MenuCard label="ประวัติการสั่งยา" onClick={() => goTo("/landing_page/history_drug")} />
          <MenuCard label="เช็คสิทธิ์รักษา" onClick={() => goTo("/landing_page/check_rights")} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h3 className="text-black text-xl font-semibold mb-4">นัดหมายที่จะมาถึง</h3>

        {appointmentsError && (
          <p className="text-red-600 mb-2">{appointmentsError}</p>
        )}

        {appointments.length > 0 ? (
          <ul className="space-y-4">
            {appointments.map((item, index) => (
              <li
                key={index}
                className="bg-white border border-green-100 p-5 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="text-green-900 font-semibold">
                    นพ.{item.doctor_first_name} {item.doctor_last_name}
                  </p>
                  <p className="text-gray-600 text-sm">แผนก: {item.specialty}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    เวลา: {formatDate(item.start_time)} - {formatDate(item.end_time)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">
            {appointmentsError ? "" : ""}
          </p>
        )}
      </section>


      <footer className="text-center text-sm text-gray-500 pb-6">
        © 2025 ระบบนัดหมอ | พัฒนาโดยทีมงานคุณภาพวิศวะคอมสุดหล่อ :3
      </footer>
    </div>
  );
}


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
      className="bg-white border border-green-100 text-green-900 py-8 rounded-3xl text-center text-lg font-medium shadow-sm hover:shadow-lg cursor-pointer hover:-translate-y-1 hover:bg-green-200 transition-all duration-200"
    >
      {label}
    </div>
  );
}
