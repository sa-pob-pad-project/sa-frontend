"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function CheckRightsPage() {
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
          ประวัติการรักษาครั้งล่าสุด
        </h1>
      </nav>
      <main className="p-6">
        <h1 className="text-L font-bold mb-4 text-green-700">
          การสั่งยาครั้งล่าสุด :</h1>
        <div className="bg-white rounded-xl shadow p-20">
        </div>
        <h1 className="text-L font-bold mb-4 mt-8 text-green-700">
          การพบแพทย์ครั้งล่าสุด :</h1>
        <div className="bg-white rounded-xl shadow p-20">
        </div>
       <div className="mt-4 flex flex-col w-full space-y-2">
          <button
            onClick={() => router.push("/landing_page/book_app/booking")}
            className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
          >
            นัดพบแพทย์
          </button>
          <button
            onClick={() => router.push("/landing_page/history_app")}
            className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
          >
            ประวัติการนัดพบแพทย์
          </button>
          <button
            onClick={() => router.push("/buy_drug")}
            className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition-colors"
          >
            สั่งยา
          </button>
        </div>
      </main>
    </div>
  
);
}