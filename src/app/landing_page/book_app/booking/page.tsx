"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css";
import { AllDoctors } from "@/services/apiService";
import { AppointmentSlots, BookAppointment } from "@/services/appointmentService";

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


  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const doctorsRes = await AllDoctors();
        setDoctors(doctorsRes);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);


  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (!selectedDoctor) return;

    setLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split("T")[0];
      const slots: Slot[] = await AppointmentSlots({
        doctorId: selectedDoctor.id,
        date: dateStr,
      });

      const formattedSlots = slots.map(slot => {
        const start = new Date(slot.start_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
        const end = new Date(slot.end_time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
        return `${start} - ${end}`;
      });

      setTimeSlots(formattedSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

 
  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("กรุณาเลือกหมอ วันที่ และเวลาให้ครบ");
      return;
    }

    try {
  
      const startTimeISO = `${selectedDate.toISOString().split("T")[0]}T${selectedTime.split(" - ")[0]}:00`;

      await BookAppointment({
        doctor_id: selectedDoctor.id,
        start_time: startTimeISO,
      });

      alert(`จองนัดสำเร็จ!\nหมอ: ${selectedDoctor.first_name} ${selectedDoctor.last_name}\nวันที่: ${selectedDate.toDateString()}\nเวลา: ${selectedTime}`);
      router.push("/landing_page/history_app");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("เกิดข้อผิดพลาดในการจองนัด กรุณาลองใหม่");
    }
  };


  const formatDate = (date: Date) => {
    const thaiMonths = [
      "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
      "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
    ];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  return (
    <main className="min-h-screen bg-[#F9FFFB] flex flex-col items-center py-6 px-4 sm:px-6">
  
      <header className="fixed top-0 left-0 w-full bg-white shadow-md px-4 py-3 flex items-center z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-black">นัดหมายคุณหมอ</h1>
      </header>
      <div className="pt-[70px]" />

  
      <section className="bg-[#D1FAE5] w-full rounded-2xl shadow p-6 flex flex-col sm:flex-row gap-5 items-center">
        <div className="flex-1 text-gray-800 w-full">
          <label className="font-semibold text-lg block mb-2">เลือกคุณหมอ</label>
          {loadingDoctors ? (
            <p>กำลังโหลดรายชื่อคุณหมอ...</p>
          ) : (
            <select
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
                const doctor = doctors.find(d => d.id === e.target.value) || null;
                setSelectedDoctor(doctor);
                setSelectedDate(null);
                setSelectedTime(null);
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

      {selectedDoctor && (
        <section className="bg-white w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">เลือกวันที่ต้องการ</h2>
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value as Date)}
              value={selectedDate}
              minDate={new Date()}
              locale="th-TH"
              className="rounded-lg border-0 text-gray-700 text-base"
            />
          </div>
        </section>
      )}


      {selectedDate && (
        <section className="bg-white w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">เลือกเวลาที่สะดวก</h2>
          {loadingSlots ? (
            <p>กำลังโหลดเวลาว่าง...</p>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map(time => (
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
          ) : (
            <p className="text-gray-600 text-sm">ไม่มีช่วงเวลาว่างในวันนี้</p>
          )}
        </section>
      )}

  
      {selectedDoctor && selectedDate && selectedTime && (
        <section className="bg-[#D1FAE5] w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">สรุปการนัดหมาย</h2>
          <div className="bg-white rounded-md p-4 text-gray-700 text-sm sm:text-base leading-relaxed">
            <p>
              พบนายแพทย์ <span className="font-semibold">{selectedDoctor.first_name} {selectedDoctor.last_name}</span> ({selectedDoctor.specialty})
              <br />
              วันที่ {formatDate(selectedDate)} เวลา {selectedTime} น.
              <br />
              โรงพยาบาลวิศวะคอมเกษตรศาสตร์
            </p>
          </div>
        </section>
      )}


      <button
        onClick={handleConfirm}
        className="mt-6 w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold py-3 rounded-lg transition shadow-md"
      >
        ยืนยันการนัดหมาย
      </button>
    </main>
  );
}
