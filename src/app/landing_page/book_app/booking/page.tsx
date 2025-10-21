"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css";
import { AllDoctors } from "@/services/apiService";
import { AppointmentSlots, BookAppointment } from "@/services/appointmentService";
import { DateTime } from "luxon";

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
}

interface AppointmentSlotResponse {
  [key: string]: {
    doctor_id: string;
    end_time: string;
    start_time: string;
    status: string;
  }[];
}

interface SlotDetail {
  doctor_id: string;
  end_time: string;
  start_time: string;
  status: string;
}

const sanitizeSlotTime = (time: string) => time.replace("Z00:00", "").trim();

const formatSlotRange = (slot: SlotDetail) => {
  const start = DateTime.fromFormat(sanitizeSlotTime(slot.start_time), "HH:mm").toFormat("HH:mm");
  const end = DateTime.fromFormat(sanitizeSlotTime(slot.end_time), "HH:mm").toFormat("HH:mm");
  return `${start} - ${end}`;
};

export default function BookingPage() {
  const router = useRouter();


  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<SlotDetail[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotDetail | null>(null);
  const [slotMap, setSlotMap] = useState<Map<string, SlotDetail[]>>(new Map());
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  
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


  const fetchDoctorSlots = async (doctorId: string) => {
    setLoadingSlots(true);
    try {
      const slots: AppointmentSlotResponse = await AppointmentSlots(doctorId);
      
      // Convert object keys (date strings) to a Map for easier lookup
      const slotsKeys = Object.keys(slots);
      const newSlotMap = new Map<string, SlotDetail[]>();
      const normalizedDates: string[] = [];

      slotsKeys.forEach((key) => {
        try {
          // Parse the ISO date with timezone and extract just the date part
          const dt = DateTime.fromISO(key);
          const normalizedKey = dt.toISODate();
          
          if (normalizedKey) {
            newSlotMap.set(normalizedKey, slots[key]);
            normalizedDates.push(normalizedKey);
          } else {
            console.warn("Invalid slot date key:", key);
          }
        } catch (err) {
          console.warn("Error parsing slot date key:", key, err);
        }
      });
      
      setSlotMap(newSlotMap);
      setAvailableDates(Array.from(new Set(normalizedDates)));
      setSelectedDate(null);
      setSelectedSlot(null);
      setTimeSlots([]);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlotMap(new Map<string, SlotDetail[]>());
      setAvailableDates([]);
      setSelectedDate(null);
      setSelectedSlot(null);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    const dateStr = DateTime.fromJSDate(date).toISODate();
    if (!dateStr) {
      setTimeSlots([]);
      return;
    }

    const slotsForDate = slotMap.get(dateStr) || [];
    setTimeSlots(slotsForDate);
  };

 
  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      alert("กรุณาเลือกหมอ วันที่ และเวลาให้ครบ");
      return;
    }

    if (selectedSlot.status !== "available") {
      alert("ช่วงเวลานี้ไม่พร้อมให้บริการ กรุณาเลือกช่วงเวลาอื่น");
      return;
    }

    try {
      const appointmentDate = DateTime.fromJSDate(selectedDate).toISODate();
      if (!appointmentDate) {
        throw new Error("Invalid appointment date");
      }

      const startTimeISO = `${appointmentDate}T${sanitizeSlotTime(selectedSlot.start_time)}:00.000Z`;

      await BookAppointment(selectedDoctor.id, startTimeISO);

      alert(`จองนัดสำเร็จ!\nหมอ: ${selectedDoctor.first_name} ${selectedDoctor.last_name}\nวันที่: ${selectedDate.toDateString()}\nเวลา: ${formatSlotRange(selectedSlot)}`);
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

  
      <section className="bg-[#D1FAE5] w-full rounded-2xl shadow p-6 flex flex-col sm:flex-row gap-5 items-center relative z-10">
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
                setSelectedSlot(null);
                setTimeSlots([]);
                if (doctor) {
                  fetchDoctorSlots(doctor.id);
                } else {
                  setSlotMap(new Map<string, SlotDetail[]>());
                  setAvailableDates([]);
                  setTimeSlots([]);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-700 cursor-pointer hover:border-green-400 transition"
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
              value={selectedDate ?? undefined}
              minDate={new Date()}
              locale="th-TH"
              tileDisabled={({ date, view }) => {
                if (view !== "month") {
                  return false;
                }
                const targetDate = DateTime.fromJSDate(date).toISODate();
                return !targetDate || !availableDateSet.has(targetDate);
              }}
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
              {timeSlots.map(slot => {
                const isAvailable = slot.status !== "scheduled" && slot.status !== "unavailable";
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={`${slot.start_time}-${slot.end_time}`}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSlot(slot);
                      }
                    }}
                    disabled={!isAvailable}
                    title={isAvailable ? "Select this slot" : "Slot unavailable"}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? "bg-[#16A34A] text-white shadow-md"
                        : isAvailable
                          ? "bg-gray-100 text-gray-700 hover:bg-green-100"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {formatSlotRange(slot)}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">ไม่มีช่วงเวลาว่างในวันนี้</p>
          )}
        </section>
      )}

  
      {selectedDoctor && selectedDate && selectedSlot && (
        <section className="bg-[#D1FAE5] w-full mt-6 rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-[#16A34A]">สรุปการนัดหมาย</h2>
          <div className="bg-white rounded-md p-4 text-gray-700 text-sm sm:text-base leading-relaxed">
            <p>
              พบนายแพทย์ <span className="font-semibold">{selectedDoctor.first_name} {selectedDoctor.last_name}</span> ({selectedDoctor.specialty})
              <br />
              วันที่ {formatDate(selectedDate)} เวลา {formatSlotRange(selectedSlot)} น.
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
