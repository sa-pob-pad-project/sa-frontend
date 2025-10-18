"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css"; // 🔹 เพิ่ม custom style

export default function BookingPage() {
  const router = useRouter();

  // 🔹 Mock ข้อมูลหมอ (ต่อ API ได้ภายหลัง)
  const doctor = {
    name: "นพ.เก่ง เกิน",
    specialty: "หมอแผนกทั่วไป",
    hospital: "โรงพยาบาลวิศวะคอมเกษตรศาสตร์",
   // image: "/images/doctor.png",
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const timeSlots = [
    "9:00–9:30",
    "10:00–10:30",
    "11:00–11:30",
    "13:00–13:30",
    "14:00–14:30",
    "15:00–15:30",
  ];

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      alert("กรุณาเลือกวันที่และเวลา");
      return;
    }

    try {
      await axios.post("/api/booking", {
        doctorId: 1,
        date: selectedDate,
        time: selectedTime,
      });
      alert("จองนัดสำเร็จ!");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการจอง");
    }
  };

  const formatDate = (date: Date) => {
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  return (
    <main className="min-h-screen bg-[#F9FFFB] flex flex-col items-center py-6 px-4 sm:px-6">
      {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-white shadow-md px-4 py-3 flex items-center z-20">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-black">
            นัดหมายคุณหมอ
          </h1>
        </header>
      <div className="pt-[70px]" /> {/* เพิ่มช่องว่างกัน header ทับเนื้อหา */}


      {/* Doctor Info */}
      <section className="bg-[#D1FAE5] w-full max-w-full mt-6 rounded-2xl shadow p-6 flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#16A34A]">
      <Image 
        src={"/images/หมอ.png"} 
        alt="Doctor Image"
        fill
        className="object-cover" /> 
      </div>
        
        <div className="text-gray-800">
          <p className="font-semibold text-lg">{doctor.name}</p>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <p className="text-sm text-gray-600">{doctor.hospital}</p>
        </div>
      </section>

      {/* Calendar */}
      <section className="bg-white w-full max-w-full mt-6 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">
          เลือกวันที่ต้องการ
        </h2>
        <div className="flex justify-center">
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            minDate={new Date()}
            locale="th-TH"
            className="rounded-lg border-0 text-gray-700 text-base"
          />
        </div>
      </section>

      {/* Time Selection */}
      <section className="bg-white w-full max-w-full mt-6 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">
          เลือกเวลาที่สะดวก
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2 rounded-lg text-sm font-medium transition ${
                selectedTime === time
                  ? "bg-[#16A34A] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="bg-[#D1FAE5] w-full max-w-full mt-6 rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">
          สรุปการนัดหมาย
        </h2>
        {selectedDate && selectedTime ? (
          <div className="bg-white rounded-md p-4 text-gray-700 text-sm sm:text-base leading-relaxed">
            <p>
              พบนายแพทย์ <span className="font-semibold">{doctor.name}</span> ({doctor.specialty})
              <br />
              วันที่ {formatDate(selectedDate)} เวลา {selectedTime} น.
              <br />
              {doctor.hospital}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">ยังไม่ได้เลือกวันและเวลา</p>
        )}
      </section>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        className="mt-6 w-full max-w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 rounded-lg transition shadow-md"
      >
        ยืนยันการนัดหมาย
      </button>
    </main>
  );
}
