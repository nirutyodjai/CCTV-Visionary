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
    DraftingCompass,
    Camera,
    Wifi,
    Monitor
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';


const featureList = [
    {
        icon: Map,
        title: "เครื่องมือออกแบบบนแปลนอาคาร",
        description: "ลากและวางกล้องวงจรปิด อุปกรณ์เครือข่าย และส่วนประกอบสถาปัตยกรรมลงบนแปลนอาคาร พร้อมปรับแต่งคุณสมบัติ มุมมอง ระยะการทำงาน และการหมุนของอุปกรณ์",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20"
    },
    {
        icon: Bot,
        title: "ผู้ช่วย AI อัจฉริยะ",
        description: "ใช้พลัง Google Genkit AI ช่วยแนะนำตำแหน่งติดตั้งที่เหมาะสม วิเคราะห์แผนงาน ค้นหาเส้นทางเดินสายที่มีประสิทธิภาพ และระบุปัญหาที่อาจเกิดขึ้น",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20"
    },
    {
        icon: Server,
        title: "มุมมอง 3D และตู้แร็ค",
        description: "จำลองการติดตั้งในมุมมอง 3 มิติ ออกแบบการจัดวางอุปกรณ์ในตู้แร็คเซิร์ฟเวอร์ จัดการ U-Space และวางแผนการระบายความร้อน",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20"
    },
    {
        icon: Network,
        title: "ผังเครือข่ายแบบอัตโนมัติ",
        description: "สร้างผังเครือข่ายเชิงตรรกะแบบเรียลไทม์ ตามการเชื่อมต่ออุปกรณ์ แสดงการไหลของข้อมูล และตรวจสอบการเชื่อมต่อที่ซับซ้อน",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/20"
    },
    {
        icon: Monitor,
        title: "ระบบจำลองสถานการณ์",
        description: "จำลองการทำงานของระบบในสถานการณ์ต่างๆ ทดสอบประสิทธิภาพเครือข่าย ดูภาพจากกล้องในสภาพแวดล้อมจำลอง และวิเคราะห์การแจ้งเตือนอัจฉริยะ",
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/20"
    },
    {
        icon: ListChecks,
        title: "รายการวัสดุอัจฉริยะ (BOM)",
        description: "คำนวณและสร้างรายการอุปกรณ์ที่จำเป็นโดยอัตโนมัติ พร้อมจำนวน ราคาประเมิน สเปกทางเทคนิค และข้อมูลผู้จำหน่าย",
        color: "text-amber-400",
        bgColor: "bg-amber-500/20"
    },
    {
        icon: FileText,
        title: "รายงานมืออาชีพ",
        description: "ส่งออกรายงาน PDF ระดับมืออาชีพ CAD files Excel BOM และเอกสารทางเทคนิคสำหรับนำเสนอลูกค้าและทีมติดตั้ง",
        color: "text-rose-400",
        bgColor: "bg-rose-500/20"
    }
];

const workflowSteps = [
    {
        icon: DraftingCompass,
        title: "1. ออกแบบพื้นที่และโครงสร้าง",
        description: "อัปโหลดแปลนอาคารที่มีอยู่ หรือใช้เครื่องมือวาดสถาปัตยกรรมเพื่อสร้างกำแพง ประตู หน้าต่าง และกำหนดโครงสร้างพื้นที่อย่างละเอียด",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20"
    },
    {
        icon: MousePointerClick,
        title: "2. วางอุปกรณ์และเชื่อมต่อ",
        description: "ลากและวางกล้องวงจรปิด NVR Switch และอุปกรณ์เครือข่าย ใช้ AI แนะนำตำแหน่งที่เหมาะสม และให้ระบบหาเส้นทางเดินสายที่มีประสิทธิภาพ",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20"
    },
    {
        icon: Settings,
        title: "3. ปรับแต่งและจัดการระบบ",
        description: "กำหนดค่าคุณสมบัติของอุปกรณ์ จัดวางในตู้แร็ค ดูผังเครือข่ายแบบเรียลไทม์ และตรวจสอบการทำงานของระบบด้วย AI Diagnostics",
        color: "text-purple-400",
        bgColor: "bg-purple-500/20"
    },
    {
        icon: ClipboardCheck,
        title: "4. วิเคราะห์และส่งออกผลงาน",
        description: "รันการวินิจฉัยด้วย AI สร้าง BOM อัตโนมัติ ส่งออกรายงาน PDF CAD files และเอกสารทางเทคนิคสำหรับการนำเสนอและติดตั้งจริง",
        color: "text-rose-400",
        bgColor: "bg-rose-500/20"
    }
]


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark-gradient">
      <header className="sticky top-0 glass-card z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center pulse shadow-lg shadow-blue-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="21 21l-4.35-4.35"/>
              <circle cx="11" cy="11" r="3"/>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent glow-text">CCTV Visionary</h1>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/planner" className="hidden sm:inline-flex px-4 py-2 text-blue-300 hover:text-white font-medium rounded-md transition-colors hover:bg-blue-500/20">เปิดโปรแกรมวางแผน</a>
          <a href="/planner" className="btn-glow px-5 py-2 rounded-md font-medium shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">เริ่มต้นใช้งาน</a>
          <ThemeToggle />
        </nav>
        </div>
      </header>

      <main className="flex-1">
      <section className="hero-gradient py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight glow-text cyber-line">
            ออกแบบ วางแผน และติดตั้ง<br className="hidden sm:block" />ระบบ CCTV อัจฉริยะ
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-blue-200/90 leading-relaxed">
            เครื่องมือที่ขับเคลื่อนด้วย <span className="text-purple-300 font-semibold">Google Genkit AI</span> ช่วยให้คุณสร้างแผนโครงสร้างพื้นฐานของ CCTV และเครือข่ายที่มีประสิทธิภาพและคุ้มค่า 
            ตั้งแต่การวางอุปกรณ์ไปจนถึงการเดินสาย เราจัดการให้คุณได้ทั้งหมด
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/planner" className="btn-glow px-8 py-3 rounded-md font-medium text-lg shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">เริ่มต้นใช้งานฟรี</a>
            <a href="#features" className="px-8 py-3 bg-transparent text-blue-300 border border-blue-500 rounded-md font-medium text-lg hover:bg-blue-900/30 transition-colors neon-border">ดูคุณสมบัติ</a>
          </div>
          
          <div className="mt-16 relative scanner">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent bottom-0 h-20 z-10"></div>
            <div className="glass-card rounded-xl p-4 neon-border floating border border-blue-500/30">
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg p-8 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="cyber-grid h-full w-full"></div>
                </div>
                
                {/* Mockup Interface */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-blue-300 text-sm">CCTV Visionary - Planning Interface</span>
                  </div>
                  
                  {/* Floor Plan Area */}
                  <div className="bg-slate-800/50 rounded-lg border border-blue-500/20 p-6 mb-4">
                    <div className="grid grid-cols-12 gap-2 h-64">
                      {/* Room Layout */}
                      <div className="col-span-8 border-2 border-blue-400/50 rounded relative bg-slate-700/20">
                        {/* Cameras */}
                        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-red-400 pulse"></div>
                        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-red-400 pulse" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-4 left-1/2 w-3 h-3 rounded-full bg-red-400 pulse" style={{animationDelay: '1s'}}></div>
                        
                        {/* Connections */}
                        <svg className="absolute inset-0 w-full h-full">
                          <path d="M 16 16 Q 50 30 80 16" stroke="#3b82f6" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.7"/>
                          <path d="M 80 16 Q 120 100 50% 90%" stroke="#3b82f6" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.7"/>
                        </svg>
                        
                        <div className="absolute bottom-2 left-2 text-xs text-blue-300">Conference Room</div>
                      </div>
                      
                      {/* Sidebar */}
                      <div className="col-span-4 space-y-2">
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded p-2">
                          <div className="text-xs text-blue-300 mb-1">NVR</div>
                          <div className="w-full h-2 bg-blue-600/30 rounded"></div>
                        </div>
                        <div className="bg-emerald-500/20 border border-emerald-400/30 rounded p-2">
                          <div className="text-xs text-emerald-300 mb-1">Switch</div>
                          <div className="w-full h-2 bg-emerald-600/30 rounded"></div>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-400/30 rounded p-2">
                          <div className="text-xs text-purple-300 mb-1">AI Analysis</div>
                          <div className="text-xs text-purple-200">95% Coverage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <div className="flex gap-4">
                      <span>📹 3 Cameras</span>
                      <span>🔗 2 Switches</span>
                      <span>📊 1 NVR</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-400">● Connected</span>
                      <span className="text-purple-400">🤖 AI Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-blue-500 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-blue-500 opacity-50"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">1000+</div>
              <div className="text-blue-200/70 mt-1">โปรเจ็กต์ที่สำเร็จ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">50K+</div>
              <div className="text-blue-200/70 mt-1">อุปกรณ์ที่วางแผน</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">95%</div>
              <div className="text-blue-200/70 mt-1">ความแม่นยำ AI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-blue-200/70 mt-1">การสนับสนุน</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 tech-dots opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent glow-text cyber-line">คุณสมบัติที่ทรงพลัง</h2>
            <p className="mt-4 text-lg text-blue-200/90 max-w-2xl mx-auto">เครื่องมือที่ครบครันและล้ำสมัย สำหรับการวางแผนและออกแบบระบบ CCTV และเครือข่ายระดับมืออาชีพ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map((feature, index) => (
                <div key={index} className={`feature-card rounded-xl p-6 shimmer border border-white/10 ${feature.bgColor} hover:border-white/30 transition-all duration-300`}>
                  <div className={`icon-container p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 pulse ${feature.bgColor} border border-white/20`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 cyber-line">{feature.title}</h3>
                  <p className="text-blue-200/90 leading-relaxed">{feature.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hexagon-bg opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent glow-text cyber-line">ขั้นตอนการทำงาน</h2>
            <p className="mt-4 text-lg text-blue-200/90 max-w-3xl mx-auto">กระบวนการที่เรียบง่ายและมีประสิทธิภาพ สำหรับการสร้างแผนการติดตั้งระบบ CCTV ที่สมบูรณ์แบบ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
                <div key={index} className={`workflow-step glass-card rounded-xl p-6 neon-border shimmer border ${step.bgColor} hover:border-white/30 transition-all duration-300`}>
                  <div className={`icon-container p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4 pulse ${step.bgColor} border border-white/20`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 cyber-line">{step.title}</h3>
                  <p className="text-blue-200/90 leading-relaxed">{step.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            พร้อมที่จะเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-lg text-blue-200/90 max-w-2xl mx-auto mb-8">
            เริ่มต้นสร้างระบบ CCTV ที่สมบูรณ์แบบด้วย AI Assistant ที่จะช่วยให้คุณประหยัดเวลาและได้ผลลัพธ์ที่มีประสิทธิภาพสูงสุด
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/planner" className="btn-glow px-8 py-3 rounded-md font-medium text-lg shimmer bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              เริ่มใช้งานเลย - ฟรี!
            </a>
            <a href="/simulation" className="px-8 py-3 bg-transparent text-indigo-300 border border-indigo-500 rounded-md font-medium text-lg hover:bg-indigo-900/30 transition-colors neon-border">
              ระบบจำลองสถานการณ์
            </a>
            <a href="#features" className="px-8 py-3 bg-transparent text-blue-300 border border-blue-500 rounded-md font-medium text-lg hover:bg-blue-900/30 transition-colors neon-border">
              ดูตัวอย่างการใช้งาน
            </a>
          </div>
        </div>
      </section>
      </main>

      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 border-t border-blue-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <circle cx="11" cy="11" r="3"/>
                  </svg>
                </div>
                <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CCTV Visionary</span>
              </div>
              <p className="text-blue-200/70 text-sm">ระบบวางแผน CCTV อัจฉริยะที่ขับเคลื่อนด้วย AI</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">คุณสมบัติ</h4>
              <ul className="space-y-2 text-blue-200/70 text-sm">
                <li>• AI Planning Assistant</li>
                <li>• 3D Visualization</li>
                <li>• Network Topology</li>
                <li>• Simulation System</li>
                <li>• Auto BOM Generation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">เทคโนโลยี</h4>
              <ul className="space-y-2 text-blue-200/70 text-sm">
                <li>• Google Genkit AI</li>
                <li>• Next.js 15</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">การสนับสนุน</h4>
              <ul className="space-y-2 text-blue-200/70 text-sm">
                <li>• เอกสารการใช้งาน</li>
                <li>• วิดีโอสอนใช้งาน</li>
                <li>• ฝึกอบรมออนไลน์</li>
                <li>• ติดต่อทีมงาน</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-500/30 mt-8 pt-6 text-center">
            <p className="text-blue-200/70 text-sm">
              &copy; 2025 CCTV Visionary - พัฒนาด้วย ❤️ เพื่อวิศวกรและนักออกแบบระบบ CCTV
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}