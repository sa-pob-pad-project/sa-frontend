"use client";

import { useEffect, useState, useCallback } from "react"; // <-- เพิ่ม useCallback
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css";
import { AllDoctors } from "@/services/apiService";
import { AppointmentSlots, BookAppointment } from "@/services/appointmentService";

// Interface ไม่มีการเปลี่ยนแปลง
interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
}

interface Slot {
  start_time: string;
  end_time: string;
}

export default function BookingPage() {
  const router = useRouter();

  // --- STATES (ปรับปรุง) ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Slot[]>([]); // <-- แก้ไข: เก็บ Object Slot ทั้งหมด ไม่ใช่แค่ String
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null); // <-- แก้ไข: เปลี่ยนชื่อและประเภทข้อมูล

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- เพิ่ม: State สำหรับตอนกดปุ่มยืนยัน

  // ------------------- FETCH ALL DOCTORS -------------------
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const doctorsRes = await AllDoctors();
        setDoctors(doctorsRes.data || []); // ปรับให้ปลอดภัยขึ้น
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // ------------------- FETCH SLOTS (สร้างเป็น Function แยก) -------------------
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot(null); // Reset เวลาที่เลือกไว้เมื่อวันที่หรือหมอเปลี่ยน
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const slotsRes: Slot[] = await AppointmentSlots({
        doctorId: selectedDoctor.id,
        date: dateStr,
      });
      setTimeSlots(slotsRes || []); // <-- แก้ไข: เก็บ Object ทั้งหมดที่ได้จาก API
    } catch (error) {
      console.error("Error fetching slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]); // <-- Function นี้จะถูกสร้างใหม่เมื่อ doctor หรือ date เปลี่ยน

  // ------------------- EFFECT สำหรับเรียก fetchSlots -------------------
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);


  // ------------------- HANDLE BOOKING -------------------
  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) { // <-- แก้ไข: เช็ค selectedSlot
      alert("กรุณาเลือกหมอ วันที่ และเวลาให้ครบ");
      return;
    }

    setIsSubmitting(true);
    try {
      // <-- แก้ไข: ใช้ข้อมูล start_time จาก selectedSlot โดยตรง ไม่ต้องสร้างใหม่
      await BookAppointment({
        doctor_id: selectedDoctor.id,
        start_time: selectedSlot.start_time,
      });

      alert(`จองนัดสำเร็จ!\nหมอ: ${selectedDoctor.first_name} ${selectedDoctor.last_name}\nวันที่: ${formatDate(selectedDate)}\nเวลา: ${formatTime(selectedSlot)} น.`);
      router.push("/landing_page/history_app");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("เกิดข้อผิดพลาดในการจองนัด กรุณาลองใหม่");
    } finally {
        setIsSubmitting(false);
    }
  };

  // ------------------- FORMATTERS (แยกเป็น Function เพื่อความสะอาด) -------------------
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Bangkok',
    });
  };

  const formatTime = (slot: Slot) => {
    const start = new Date(slot.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const end = new Date(slot.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${start} - ${end}`;
  };

  const isBookingDisabled = !selectedDoctor || !selectedDate || !selectedSlot || isSubmitting;

  return (
    <main className="min-h-screen bg-[#F9FFFB] flex flex-col items-center py-6 px-4 sm:px-6">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md px-4 py-3 flex items-center z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-black">นัดหมายคุณหมอ</h1>
      </header>
      <div className="pt-[70px]" />

      {/* SELECT DOCTOR */}
      <section className="bg-[#D1FAE5] w-full rounded-2xl shadow p-6">
        <div className="text-gray-800 w-full">
          <label className="font-semibold text-lg block mb-2">เลือกคุณหมอ</label>
          {loadingDoctors ? (
            <p>กำลังโหลดรายชื่อคุณหมอ...</p>
          ) : (
            <select
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
                const doctor = doctors.find(d => d.id === e.target.value) || null;
                setSelectedDoctor(doctor);
                setSelectedDate(null); // Reset วันที่เมื่อเปลี่ยนหมอ
                setSelectedSlot(null);
                setTimeSlots([]);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">-- กรุณาเลือกหมอ --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {`นพ.${d.first_name} ${d.last_name} (${d.specialty})`}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {/* CALENDAR */}
      {selectedDoctor && (
        <section className="bg-white w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">เลือกวันที่ต้องการ</h2>
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)} // <-- ทำให้สั้นลง
              value={selectedDate}
              minDate={new Date()}
              locale="th-TH"
            />
          </div>
        </section>
      )}

      {/* TIME SLOTS */}
      {selectedDate && (
        <section className="bg-white w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">เลือกเวลาที่สะดวก</h2>
          {loadingSlots ? (
            <p>กำลังโหลดเวลาว่าง...</p>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map(slot => ( // <-- แก้ไข: วนลูปจาก Object
                <button
                  key={slot.start_time} // <-- ใช้ key ที่ไม่ซ้ำกัน
                  onClick={() => setSelectedSlot(slot)} // <-- แก้ไข: เก็บ Object ทั้งหมด
                  className={`py-2 rounded-lg text-sm font-medium transition ${
                    selectedSlot?.start_time === slot.start_time // <-- แก้ไข: เช็คจาก property ของ Object
                      ? "bg-[#16A34A] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-green-100"
                  }`}
                >
                  {formatTime(slot)} {/* <-- แก้ไข: แสดงผลด้วย function */}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">ไม่มีช่วงเวลาว่างในวันนี้</p>
          )}
        </section>
      )}

      {/* SUMMARY */}
      {selectedDoctor && selectedDate && selectedSlot && ( // <-- แก้ไข: เช็ค selectedSlot
        <section className="bg-[#D1FAE5] w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">สรุปการนัดหมาย</h2>
          <div className="bg-white rounded-md p-4 text-gray-700 text-sm sm:text-base leading-relaxed">
            <p>
              พบนายแพทย์ <span className="font-semibold">{selectedDoctor.first_name} {selectedDoctor.last_name}</span> ({selectedDoctor.specialty})
              <br />
              วันที่ {formatDate(selectedDate)} เวลา {formatTime(selectedSlot)} น.
              <br />
              โรงพยาบาลวิศวะคอมเกษตรศาสตร์
            </p>
          </div>
        </section>
      )}

      {/* CONFIRM BUTTON */}
      <button
        onClick={handleConfirm}
        disabled={isBookingDisabled} // <-- แก้ไข: เพิ่ม disabled
        className={`mt-6 w-full text-white font-semibold py-3 rounded-lg transition shadow-md ${
            isBookingDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#16A34A] hover:bg-[#15803D]'
        }`}
      >
        {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการนัดหมาย'}
      </button>
    </main>
  );
}