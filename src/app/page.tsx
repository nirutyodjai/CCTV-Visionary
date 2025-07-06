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
import { UserNav } from '@/components/ui/user-nav';
import { useAuth } from '@/contexts/AuthContext';


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
    const { user, loading } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <Map className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">โปรแกรมวางแผน CCTV</h1>
        </div>
        <nav className="flex items-center gap-4">
           {loading ? (
             <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
           ) : user ? (
              <UserNav />
           ) : (
             <>
               <Link href="/login" passHref>
                 <Button variant="ghost">เปิดโปรแกรมวางแผน</Button>
               </Link>
               <Link href="/login" passHref>
                 <Button>เริ่มต้นใช้งาน</Button>
               </Link>
             </>
           )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white">
            ออกแบบ วางแผน และติดตั้งระบบของคุณอย่างชาญฉลาด
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            เครื่องมือที่ขับเคลื่อนด้วย Genkit AI ของเรา ช่วยให้คุณสร้างแผนโครงสร้างพื้นฐานของ CCTV และเครือข่ายที่มีประสิทธิภาพและคุ้มค่า ตั้งแต่การวางอุปกรณ์ไปจนถึงการเดินสาย เราจัดการให้คุณได้ทั้งหมด
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/planner" passHref>
              <Button size="lg" className="gap-2">
                เริ่มต้นใช้งาน <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
        </section>

        <section id="features" className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">ชุดเครื่องมือที่ครอบคลุมสำหรับการออกแบบระบบที่ทันสมัย</h3>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">ทุกสิ่งที่คุณต้องการเพื่อนำโปรเจกต์จากแนวคิดไปสู่การปฏิบัติจริง</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureList.map((feature, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800/50 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">จากแนวคิดสู่การปฏิบัติใน 4 ขั้นตอนง่ายๆ</h3>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">ขั้นตอนการทำงานที่คล่องตัวเพื่อเร่งกระบวนการออกแบบของคุณ</p>
                </div>
                <div className="relative">
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-700" style={{top: '3rem'}}></div>
                    
                    <div className="grid md:grid-cols-4 gap-12 relative">
                        {workflowSteps.map((step) => (
                            <div key={step.title} className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center mx-auto">
                                        <step.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-semibold mt-6 text-gray-900 dark:text-white">{step.title}</h4>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 โปรแกรมวางแผน CCTV และเครือข่าย สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  );
}
