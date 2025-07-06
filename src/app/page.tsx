'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowRight, 
    Bot, 
    Network, 
    FileText,
    ListChecks,
    Server,
    Map,
    MousePointerClick,
    Settings,
    ClipboardCheck,
    DraftingCompass
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';


const featureList = [
    {
        icon: Map,
        title: "เครื่องมือออกแบบบนแปลนอาคาร",
        description: "ลากและวางกล้อง, อุปกรณ์เครือข่าย, และส่วนประกอบสถาปัตยกรรมลงบนแปลนอาคาร ปรับแต่งคุณสมบัติอุปกรณ์ เช่น มุมมอง, ระยะ, และการหมุน"
    },
    {
        icon: Bot,
        title: "ผู้ช่วย AI อัจฉริยะ",
        description: "ใช้ประโยชน์จาก Genkit AI flows สำหรับการแนะนำตำแหน่งติดตั้ง, ค้นหาเส้นทางเดินสาย, และการวิเคราะห์แผนเพื่อระบุปัญหาที่อาจเกิดขึ้น"
    },
    {
        icon: Server,
        title: "มุมมองตู้แร็ค",
        description: "ออกแบบและจำลองการจัดวางอุปกรณ์ภายในตู้แร็คเซิร์ฟเวอร์ จัดการยูนิตในตู้แร็คและการวางอุปกรณ์เพื่อความเป็นระเบียบสูงสุด"
    },
    {
        icon: Network,
        title: "มุมมองผังเครือข่าย",
        description: "สร้างและแสดงภาพผังเครือข่ายเชิงตรรกะโดยอัตโนมัติตามการเชื่อมต่ออุปกรณ์ ช่วยให้คุณเข้าใจการไหลของข้อมูล"
    },
    {
        icon: ListChecks,
        title: "สร้างรายการวัสดุ (BOM)",
        description: "รวบรวมรายการอุปกรณ์ที่จำเป็นทั้งหมดโดยอัตโนมัติ พร้อมจำนวนและราคาประเมิน"
    },
    {
        icon: FileText,
        title: "สร้างรายงาน PDF",
        description: "สร้างรายงาน PDF ระดับมืออาชีพของแผนโครงการทั้งหมดของคุณ รวมถึงแปลนอาคาร, ผังเครือข่าย, และ BOM เพื่อการแบ่งปันที่ง่ายดาย"
    }
];

const workflowSteps = [
    {
        icon: DraftingCompass,
        title: "1. ออกแบบพื้นที่ของคุณ",
        description: "อัปโหลดภาพแปลนอาคารที่มีอยู่ หรือใช้เครื่องมือสถาปัตยกรรมเพื่อวาดกำแพงและกำหนดแผนผังของพื้นที่ของคุณ"
    },
    {
        icon: MousePointerClick,
        title: "2. วางและเชื่อมต่อ",
        description: "ลากและวางอุปกรณ์ลงบนผืนผ้าใบ ใช้คำแนะนำจาก AI เพื่อการวางตำแหน่งที่ดีที่สุด และให้ระบบค้นหาเส้นทางเดินสายที่ดีที่สุดโดยอัตโนมัติ"
    },
    {
        icon: Settings,
        title: "3. จัดการและกำหนดค่า",
        description: "ปรับแต่งคุณสมบัติของทุกอุปกรณ์, จัดระเบียบอุปกรณ์ในมุมมองตู้แร็ค, และดูการอัปเดตผังเครือข่ายแบบเรียลไทม์"
    },
    {
        icon: ClipboardCheck,
        title: "4. วิเคราะห์และรายงาน",
        description: "รันการวินิจฉัยเพื่อตรวจสอบการออกแบบของคุณ, สร้างรายการวัสดุที่สมบูรณ์, และส่งออกรายงาน PDF ระดับมืออาชีพสำหรับผู้มีส่วนได้ส่วนเสีย"
    }
]


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark-gradient">
      <header className="sticky top-0 glass-card z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" y1="3" x2="9" y2="18"></line>
              <line x1="15" y1="6" x2="15" y2="21"></line>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white glow-text">CCTV Visionary</h1>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/planner" className="hidden sm:inline-flex px-4 py-2 text-blue-300 hover:text-white font-medium rounded-md transition-colors">เปิดโปรแกรมวางแผน</a>
          <a href="/planner" className="btn-glow px-5 py-2 rounded-md font-medium shimmer">เริ่มต้นใช้งาน</a>
          <ThemeToggle />
        </nav>
        </div>
      </header>

      <main className="flex-1">
      <section className="hero-gradient py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight glow-text cyber-line">
            ออกแบบ วางแผน และติดตั้ง<br className="hidden sm:block" />ระบบของคุณอย่างชาญฉลาด
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-blue-200">
            เครื่องมือที่ขับเคลื่อนด้วย Genkit AI ของเรา ช่วยให้คุณสร้างแผนโครงสร้างพื้นฐานของ CCTV และเครือข่ายที่มีประสิทธิภาพและคุ้มค่า ตั้งแต่การวางอุปกรณ์ไปจนถึงการเดินสาย เราจัดการให้คุณได้ทั้งหมด
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/planner" className="btn-glow px-8 py-3 rounded-md font-medium text-lg shimmer">เริ่มต้นใช้งานฟรี</a>
            <a href="#features" className="px-8 py-3 bg-transparent text-blue-300 border border-blue-500 rounded-md font-medium text-lg hover:bg-blue-900/30 transition-colors neon-border">ดูคุณสมบัติ</a>
          </div>
          
          <div className="mt-16 relative scanner">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent bottom-0 h-20 z-10"></div>
            <div className="glass-card rounded-xl p-4 neon-border floating">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230f172a'/%3E%3Cpath d='M50 50 L750 50 L750 400 L50 400 Z' fill='%231e293b' stroke='%233b82f6' strokeWidth='2' strokeOpacity='0.5'/%3E%3Cpath d='M100 100 L300 100 L300 200 L100 200 Z' fill='%23172554' stroke='%233b82f6' strokeWidth='1' strokeOpacity='0.5'/%3E%3Cpath d='M350 100 L700 100 L700 350 L350 350 Z' fill='%23172554' stroke='%233b82f6' strokeWidth='1' strokeOpacity='0.5'/%3E%3Ccircle cx='150' cy='150' r='15' fill='%233b82f6'/%3E%3Ccircle cx='250' cy='150' r='15' fill='%233b82f6'/%3E%3Ccircle cx='400' cy='200' r='15' fill='%233b82f6'/%3E%3Ccircle cx='500' cy='150' r='15' fill='%233b82f6'/%3E%3Ccircle cx='600' cy='250' r='15' fill='%233b82f6'/%3E%3Cpath d='M150 150 L250 150 L400 200 L500 150 L600 250' stroke='%233b82f6' strokeWidth='2' fill='none' strokeDasharray='5,5'/%3E%3Crect x='100' y='250' width='200' height='100' fill='%23172554' stroke='%233b82f6' strokeWidth='1' strokeOpacity='0.5'/%3E%3Ctext x='150' y='300' fontFamily='Arial' fontSize='12' fill='%2393c5fd'%3ECCTV Layout%3C/text%3E%3C/svg%3E" alt="CCTV Planning Software Interface" className="mx-auto rounded-lg max-w-full h-auto" style={{maxHeight: '500px'}}/>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-blue-500 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-blue-500 opacity-50"></div>
      </section>

      <section id="features" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 tech-dots opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white glow-text cyber-line">คุณสมบัติหลัก</h2>
            <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">เครื่องมือที่ครบครันสำหรับการวางแผนและออกแบบระบบ CCTV และเครือข่ายของคุณ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map((feature, index) => (
                <div key={index} className="feature-card rounded-xl p-6 shimmer">
                  <div className="icon-container p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 pulse">
                    <feature.icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 cyber-line">{feature.title}</h3>
                  <p className="text-blue-200">{feature.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hexagon-bg opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white glow-text cyber-line">ขั้นตอนการทำงาน</h2>
            <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">กระบวนการที่เรียบง่ายสำหรับการสร้างแผนการติดตั้งที่สมบูรณ์แบบ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
                <div key={index} className="workflow-step glass-card rounded-xl p-6 neon-border shimmer">
                  <div className="icon-container p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 pulse">
                    <step.icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 cyber-line">{step.title}</h3>
                  <p className="text-blue-200">{step.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      <footer className="bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; 2024 CCTV Visionary สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  );
}