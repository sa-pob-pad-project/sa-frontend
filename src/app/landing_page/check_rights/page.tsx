"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function CheckRightsPage() {
  const router = useRouter();

  const rights = [
    { name: "สิทธิ์ สปสช", img: "/images/สปสช.png", alt: "สปสช Logo" },
    { name: "สิทธิ์ ประกันสังคม", img: "/images/ประกันสังคม.png", alt: "ประกันสังคม Logo" },
    { name: "สิทธิ์ ข้าราชการ", img: "/images/ข้าราชการ.png", alt: "ข้าราชการ Logo" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      <nav className="bg-[#AFFFD5] text-black px-4 sm:px-6 py-4 flex items-center shadow-md">
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

      {/* Main Content */}
      <main className="flex-1 p-6 flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {rights.map((item, index) => (
            <div
              key={index}
              className="bg-[#AFFFD5] rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 mb-4 relative">
                <Image
                  src={item.img}
                  alt={item.alt}
                  fill
                  className="object-contain rounded-xl"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-black">
                {item.name}
              </h2>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
