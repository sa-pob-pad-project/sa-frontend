"use client";

import { getProfile } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ✅ ใช้ type แทน interface (เหมาะกับโค้ดฟังก์ชันสมัยใหม่)
type Profile = {
  firstName: string;
  lastName: string;
};

export default function LandingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ โหลดข้อมูลโปรไฟล์
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        // ตรวจสอบข้อมูลที่ได้ก่อนนำมาใช้
        if (data?.first_name && data?.last_name) {
          setProfile({
            firstName: data.first_name,
            lastName: data.last_name,
          });
        } else {
          throw new Error("ไม่พบข้อมูลผู้ใช้");
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");

        // ถ้า token หมดอายุ → กลับหน้า login
        if (err.message?.includes("Unauthorized")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ✅ ฟังก์ชันนำทางแบบ reusable
  const goTo = (path: string) => router.push(path);

  return (
    <div className="bg-white min-h-screen p-4">
      {/* ---------- Navigation ---------- */}
      <nav className="bg-[#AFFFD5] text-black p-4 flex justify-end items-center rounded-2xl shadow-sm">
        {loading ? (
          <span className="text-sm text-gray-600 animate-pulse">
            กำลังโหลดข้อมูล...
          </span>
        ) : error ? (
          <span className="text-sm text-red-600">{error}</span>
        ) : profile ? (
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => goTo("/profile")}
          >
            <span className="font-semibold">
              {profile.firstName} {profile.lastName}
            </span>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">
              👤
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-600">ไม่พบข้อมูลผู้ใช้</span>
        )}
      </nav>

      {/* ---------- Welcome Header ---------- */}
      <h1 className="text-green-800 text-center text-3xl font-bold my-6">
        ยินดีต้อนรับสู่ระบบนัดหมอ
      </h1>

      {/* ---------- Menu Section ---------- */}
      <section>
        <h2 className="text-green-800 text-lg font-medium mb-4">เมนู :</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <MenuCard label="จองคิว" onClick={() => goTo("/landing_page/book_app")} />
          <MenuCard
            label="ประวัติการนัดหมอ"
            onClick={() => goTo("/landing_page/history_app")}
          />
          <MenuCard
            label="ประวัติการสั่งยา"
            onClick={() => goTo("/landing_page/history_drug")}
          />
          <MenuCard
            label="เช็คสิทธิ์รักษา"
            onClick={() => goTo("/landing_page/check_rights")}
          />
        </div>
      </section>

      {/* ---------- Upcoming Appointments ---------- */}
      <section>
        <h2 className="text-green-800 text-lg font-medium mb-4">
          นัดหมายที่จะมาถึง :
        </h2>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <UpcomingAppointmentCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ✅ Component ย่อย: การ์ดเมนู
function MenuCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#AFFFD5] text-black p-6 rounded-3xl text-center shadow-md cursor-pointer hover:scale-95 hover:bg-green-300 transition-transform font-medium"
    >
      {label}
    </div>
  );
}

// ✅ Component ย่อย: การ์ดนัดหมาย
function UpcomingAppointmentCard() {
  return (
    <div className="bg-[#AFFFD5] text-white p-4 rounded-3xl flex justify-between items-center shadow-md">
      <div>
        <p className="text-black font-semibold">ชื่อ นามสกุล</p>
        <p className="text-black text-sm">วัน เดือน ปี เวลา</p>
      </div>
      <button className="bg-green-100 px-4 py-2 rounded-2xl hover:bg-green-300 transition-colors">
        <p className="text-black font-medium">รายละเอียด</p>
      </button>
    </div>
  );
}
