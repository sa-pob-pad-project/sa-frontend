"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function CheckRightsPage() {
  const router = useRouter();
return (
  <div className="min-h-screen bg-white">
      
      <nav className="bg-[#AFFFD5] text-black px-6 py-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => router.push("/landing_page")}
          className="flex items-center text-black hover:scale-105 transition-transform"   
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-black">

          เช็คสิทธ์รักษา
        </h1>
      </nav>
      <main className="p-6 items-center text-center">
        <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#AFFFD5] rounded-4xl  items-center text-center shadow p-15 mt-6">
          <Image
            src="/images/สปสช.png"  
            alt="สปสช Logo"
            width={128}
            height={128}
            className="object-contain w-full h-full rounded-xl"
          />
          <h1 className="text-2xl font-medium mb-4 text-black mt-4">สิทธิ์ สปสช</h1>
        </div>
        <div className="bg-[#AFFFD5] rounded-4xl  items-center text-center shadow p-15 mt-6">
          <Image
            src="/images/ประกันสังคม.png"  
            alt="ประกันสังคม Logo"
            width={128}
            height={128}
            className="object-contain w-full h-full rounded-xl"
          />
          <h1 className="text-2xl font-medium mb-4 text-black mt-4">สิทธิ์ ประกันสังคม</h1>
        </div>

        <div className="bg-[#AFFFD5] rounded-4xl  items-center text-center shadow p-15 mt-6">
            <Image
            src="/images/ข้าราชการ.png"  
            alt="ข้าราชการ Logo"
            width={128}
            height={128}
            className="object-contain w-full h-full rounded-xl"
          />
          <h1 className="text-2xl font-medium mb-4 text-black mt-4">สิทธิ์ ข้าราชการ</h1>
        </div>
        </div>
      </main>
    </div>
  
);
}