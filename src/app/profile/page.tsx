"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Edit, Save, X } from "lucide-react";
import { getProfile, updateProfile, calculateAge } from "@/services/apiService";

interface Profile {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  age: number | null;
  birthDate: string;
  bloodType: string;
  citizenId: string;
  hospitalId: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        const formattedProfile: Profile = {
          firstName: data.first_name,
          lastName: data.last_name,
          gender: data.gender,
          phone: data.phone_number,
          age: calculateAge(data.birth_date),
          birthDate: data.birth_date,
          bloodType: data.blood_type,
          citizenId: data.id_card_number,
          hospitalId: data.hospital_id,
        };
        setProfile(formattedProfile);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // ✅ กด Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ✅ กด Save แก้ไขข้อมูล
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await updateProfile({
        address: "",
        allergies: "",
        birth_date: profile.birthDate,
        blood_type: profile.bloodType,
        emergency_contact: "",
        first_name: profile.firstName,
        id_card_number: profile.citizenId,
        last_name: profile.lastName,
        phone_number: profile.phone,
      });
      alert("บันทึกข้อมูลสำเร็จ ✅");
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "ไม่สามารถบันทึกข้อมูลได้ ❌");
    } finally {
      setSaving(false);
    }
  };

  // ✅ เมื่อแก้ไขฟิลด์ในฟอร์ม
  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) return <StatusMessage text="กำลังโหลดข้อมูล..." color="text-gray-500" />;
  if (error) return <StatusMessage text={error} color="text-red-500" />;
  if (!profile) return <StatusMessage text="ไม่สามารถโหลดข้อมูลได้" color="text-gray-600" />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="bg-green-300 text-white rounded-2xl p-6 shadow-md relative">
        <button
          onClick={() => router.push("/landing_page")}
          className="absolute top-5 left-5 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="flex flex-col items-center mt-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl">
            👤
          </div>
          <h1 className="mt-3 text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
          <div className="flex gap-3 mt-3 flex-wrap justify-center">
            <Tag label={`🎂 ${profile.age} ปี`} />
            <Tag label={profile.gender === "ชาย" ? "♂ ชาย" : "♀ หญิง"} />
            <Tag label={`🩸 ${profile.bloodType}`} />
          </div>
        </div>
      </header>

      {/* ข้อมูลส่วนตัว */}
      <section className="bg-white mt-6 p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-600">ข้อมูลส่วนตัว</h2>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
              >
                <Save size={16} /> {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-lg"
              >
                <X size={16} /> ยกเลิก
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
              >
                <Edit size={16} /> แก้ไข
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            Object.keys(profile) as (keyof Profile)[]
          ).map((key) => (
            <div
              key={key}
              className="flex flex-col bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-sm text-gray-500">{key}</span>
              {isEditing ? (
                <input
                  className="mt-1 p-2 rounded border border-gray-300 text-gray-700"
                  value={profile[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              ) : (
                <span className="font-medium text-gray-800">{profile[key]}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm shadow">
      {label}
    </span>
  );
}

function StatusMessage({ text, color }: { text: string; color: string }) {
  return <p className={`text-center mt-20 font-medium ${color}`}>{text}</p>;
}
