"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, X } from "lucide-react";

export default function CheckRightsPage() {
  const router = useRouter();
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const rights = [
    { 
      name: "สิทธิ์ สปสช", 
      img: "/images/สปสช.png", 
      alt: "สปสช Logo", 
      status: "✅ ใช้สิทธิ์ได้ที่โรงพยาบาลต้นสังกัดตามทะเบียนบ้าน" 
    },
    { 
      name: "สิทธิ์ ประกันสังคม", 
      img: "/images/ประกันสังคม.png", 
      alt: "ประกันสังคม Logo", 
      status: "✅ ใช้สิทธิ์ได้ที่โรงพยาบาลตามที่เลือกไว้ในระบบประกันสังคม" 
    },
    { 
      name: "สิทธิ์ ข้าราชการ", 
      img: "/images/ข้าราชการ.png", 
      alt: "ข้าราชการ Logo", 
      status: "✅ ใช้สิทธิ์ได้ทุกโรงพยาบาลของรัฐที่เข้าร่วมโครงการ" 
    },
  ];

  const closePopup = () => setSelectedRight(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9FFF2] to-white flex flex-col">

      <nav className="bg-white text-black px-4 sm:px-6 py-4 flex items-center shadow-md">
        <button
          onClick={() => router.push("/landing_page")}
          className="flex items-center text-black hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
        </button>
        <h1 className="flex-1 text-center text-xl sm:text-2xl font-bold text-black">
          เช็คสิทธิ์รักษา
        </h1>
      </nav>

 
      <main className="flex-1 p-6 flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {rights.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedRight(item.name)}
              className="bg-[#AFFFD5] rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 mb-4 relative">
                <Image
                  src={item.img}
                  alt={item.alt}
                  fill
                  className="object-contain rounded-xl"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-green-900">
                {item.name}
              </h2>
            </button>
          ))}
        </div>
      </main>


      {selectedRight && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-11/12 max-w-md p-6 relative text-center">
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {rights
              .filter((r) => r.name === selectedRight)
              .map((r, i) => (
                <div key={i}>
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <Image
                      src={r.img}
                      alt={r.alt}
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-green-700 mb-3">{r.name}</h2>
                  <p className="text-gray-700 text-base leading-relaxed">{r.status}</p>
                  <button
                    onClick={closePopup}
                    className="mt-6 px-6 py-2 bg-[#AFFFD5] text-black font-semibold rounded-full hover:bg-green-300 transition"
                  >
                    ปิด
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
