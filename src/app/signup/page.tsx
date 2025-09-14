"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerPatient } from "@/services/apiService";

export default function SignupPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    hospital_id: "",
    id_card_number: "",
    password: "",
    phone_number: "",
    emergency_contact: "",
    address: "",
    allergies: "",
    blood_type: "",
    birth_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      alert("กรุณายอมรับข้อตกลงก่อนนะครับ ❗");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerPatient(formData);
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const placeholders: Record<string, string> = {
    password: "Password อย่างน้อย 6 ตัวอักษร",
    id_card_number: "กรอกเลขบัตรประชาชน 13 หลัก",
    phone_number: "เบอร์โทรศัพท์ (เช่น 0812345678)",
    emergency_contact: "เบอร์โทรฉุกเฉิน",
    birth_date: "เลือกวันเกิด",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-[#AFFFD5] p-8 rounded-3xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Sign Up
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {Object.entries(formData).map(([key, value]) => {
            if (key === "gender") {
              return (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-black font-medium mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id={key}
                    value={value}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">male</option>
                    <option value="female">female</option>
                  </select>
                </div>
              );
            }

            if (key === "blood_type") {
              return (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-black font-medium mb-1"
                  >
                    Blood Type
                  </label>
                  <select
                    id={key}
                    value={value}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              );
            }

            return (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-black font-medium mb-1"
                >
                  {key
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  id={key}
                  value={value}
                  onChange={handleChange}
                  type={
                    key.includes("password")
                      ? "password"
                      : key.includes("date")
                      ? "date"
                      : "text"
                  }
                  placeholder={placeholders[key] || key.replace("_", " ")} // ✅ ใช้ custom placeholder
                  className="input-field"
                />
              </div>
            );
          })}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agree"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="agree" className="text-gray-700 cursor-pointer">
              <Link href="/termservice" className="text-blue-600 underline">
                ฉันยอมรับเงื่อนไขและข้อตกลงการใช้งาน
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white p-3 rounded-lg font-semibold hover:bg-green-800 transition mt-4"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          background-color: white;
          color: black;
          outline: none;
          transition: ring 0.2s;
        }
        .input-field:focus {
          border-color: #34d399;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.3);
        }
      `}</style>
    </div>
  );
}
