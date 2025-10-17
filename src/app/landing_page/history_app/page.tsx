"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
export default function AppointmentsPage() {
  const [reminderOn, setReminderOn] = useState(true);
  const router = useRouter();

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
          ประวัติการนัดพบแพทย์ครั้งล่าสุด
        </h1>
      </nav>
    <main className="p-6">
    
      <section className="mb-8">
        <h1 className="text-L font-bold mb-4 text-green-700">สถานะล่าสุด :</h1>

        <article className="bg-white rounded-2xl p-4 shadow-sm overflow-hidden">
          <div className="bg-emerald-500 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                </svg>
                <div className="text-sm leading-tight">
                  <div className="text-xs opacity-90">เวลานัดหมอ :</div>
                  <div className="font-medium">วันที่ 13 สิงหาคม , 10.00 - 10.30 น.</div>
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-0 text-sm opacity-90">&nbsp;</div>
          </div>

          <div className="flex items-center gap-4 p-4 -mt-6">
            <div className="flex-1">
              <h1 className="text-xs text-gray-600 mt-1">ชื่อ : นพ.เก่ง เกิน</h1>
              <p className="text-xs text-gray-600 mt-1">แผนก : หมอแผนกทั่วไป</p>
              <p className="text-xs text-gray-600 truncate mt-1">สังกัด : โรงพยาบาลวิควะคอมเกษต...</p>
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200">
        
            </div>
          </div>

          <div className="flex gap-3 mt-1 p-4">
            <button
              onClick={() => setReminderOn(!reminderOn)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full border border-emerald-600 bg-emerald-50 text-emerald-800 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              แจ้งเตือนฉัน
            </button>

            <button className="py-2 px-4 rounded-full bg-red-600 text-white font-medium">ยกเลิกนัด</button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
              </svg>
            </button>
          </div>
        </article>
      </section>

      <section>
        <h1 className="text-L font-bold mb-4 text-green-700">ประวัติการนัดหมอที่ผ่านมา :</h1>

        <ul className="space-y-4">
          <li>
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full overflow-hidden border">
              </div>

              <div className="flex-1 text-sm">
                <div className="font-medium">ชื่อ : Dr.John wick</div>
                <div className="text-xs text-gray-600 mt-1">แผนก : หมอกระดูก</div>
                <div className="text-xs text-gray-600 truncate">สังกัด : โรงพยาบาลวิควะคอ...</div>
              </div>

              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
                </svg>
              </button>
            </div>
          </li>

          {/* duplicate item as example */}
          <li>
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full overflow-hidden border">
              </div>

              <div className="flex-1 text-sm">
                <div className="font-medium">ชื่อ : พญ.เมตตา ใจดี</div>
                <div className="text-xs text-gray-600 mt-1">แผนก : สูติ-นรีเวช</div>
                <div className="text-xs text-gray-600 truncate">สังกัด : โรงพยาบาลเอกชน...</div>
              </div>

              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </section>
    </main>
     </div>
  );
}
