'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  BarChart, 
  PieChart, 
  Activity, 
  AlertCircle,
  Zap,
  CheckCircle,
  FileBarChart,
  FileCheck,
  FileCog
} from 'lucide-react';
import type { ProjectState, Floor } from '@/lib/types';

interface SimulationReportsProps {
  projectState: ProjectState;
  activeFloor: Floor;
}

interface SimulationReport {
  id: string;
  title: string;
  date: string;
  type: 'system' | 'network' | 'camera' | 'coverage';
  status: 'success' | 'warning' | 'error';
  findings: number;
  recommendations: number;
  icon: React.ReactNode;
}

export function SimulationReports({ projectState, activeFloor }: SimulationReportsProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Sample simulation reports
  const simulationReports: SimulationReport[] = [
    {
      id: 'sim-1',
      title: 'System Performance Validation',
      date: '9 Jul 2025',
      type: 'system',
      status: 'success',
      findings: 2,
      recommendations: 3,
      icon: <FileBarChart className="w-5 h-5 text-green-500" />
    },
    {
      id: 'sim-2',
      title: 'Network Load Analysis',
      date: '8 Jul 2025',
      type: 'network',
      status: 'warning',
      findings: 5,
      recommendations: 4,
      icon: <FileCog className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'sim-3',
      title: 'Camera Coverage Test',
      date: '7 Jul 2025',
      type: 'camera',
      status: 'error',
      findings: 8,
      recommendations: 6,
      icon: <FileCheck className="w-5 h-5 text-red-500" />
    },
    {
      id: 'sim-4',
      title: 'Environmental Impact',
      date: '6 Jul 2025',
      type: 'camera',
      status: 'success',
      findings: 1,
      recommendations: 2,
      icon: <FileBarChart className="w-5 h-5 text-green-500" />
    }
  ];
  
  const selectedReportData = selectedReport 
    ? simulationReports.find(r => r.id === selectedReport)
    : simulationReports[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            รายงานผลการจำลอง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Card className="h-full">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">รายงานการจำลอง</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {simulationReports.map((report) => (
                        <div 
                          key={report.id} 
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedReport === report.id 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                          }`}
                          onClick={() => setSelectedReport(report.id)}
                        >
                          <div className="flex items-center gap-3">
                            {report.icon}
                            <div>
                              <div className="font-medium">{report.title}</div>
                              <div className="text-xs text-muted-foreground">{report.date}</div>
                            </div>
                            <div className="ml-auto">
                              <Badge variant={
                                report.status === 'success' ? 'default' :
                                report.status === 'warning' ? 'secondary' : 'destructive'
                              }>
                                {report.findings} findings
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{selectedReportData?.title}</CardTitle>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <PieChart className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <div className="text-2xl font-bold">{selectedReportData?.findings}</div>
                        <div className="text-xs text-muted-foreground">ข้อค้นพบ</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                        <div className="text-2xl font-bold">
                          {selectedReportData?.status === 'success' ? 0 :
                           selectedReportData?.status === 'warning' ? 1 : 3}
                        </div>
                        <div className="text-xs text-muted-foreground">ปัญหาสำคัญ</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Activity className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <div className="text-2xl font-bold">{selectedReportData?.recommendations}</div>
                        <div className="text-xs text-muted-foreground">ข้อเสนอแนะ</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Tabs defaultValue="summary">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">สรุปผล</TabsTrigger>
                      <TabsTrigger value="findings">ข้อค้นพบ</TabsTrigger>
                      <TabsTrigger value="recommendations">ข้อเสนอแนะ</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary">
                      <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold">ผลการจำลองระบบ</h3>
                        
                        {selectedReportData?.type === 'system' && (
                          <>
                            <p>การจำลองสถานการณ์ระบบ CCTV ในอาคารนี้แสดงให้เห็นว่าระบบมีความเสถียรในระดับดีเยี่ยม โดยมีข้อสังเกตเพียงเล็กน้อย ต้องการการปรับแต่งเพียงเล็กน้อยเพื่อเพิ่มประสิทธิภาพ</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>ระบบรองรับกล้องทั้งหมดได้อย่างมีประสิทธิภาพ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>การเชื่อมต่อระหว่างอุปกรณ์มีความเสถียร</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span>พบการใช้แบนด์วิธสูงในบางช่วงเวลา</span>
                              </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                <BarChart className="w-12 h-12 text-slate-400" />
                              </div>
                              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                <PieChart className="w-12 h-12 text-slate-400" />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {selectedReportData?.type === 'network' && (
                          <>
                            <p>การจำลองเครือข่ายพบว่ามีคอขวดในบางตำแหน่งของระบบ โดยเฉพาะช่วงเวลาที่มีการใช้งานสูง ซึ่งอาจส่งผลต่อคุณภาพของภาพและการบันทึก ระบบต้องการการอัพเกรดบางส่วน</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span>Switch ที่ชั้น 1 มีการใช้งานเกิน 90% ในชั่วโมงเร่งด่วน</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span>NVR มีความจุไม่เพียงพอสำหรับการบันทึกคุณภาพสูง</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>การเชื่อมต่อ Backbone มีประสิทธิภาพดี</span>
                              </div>
                            </div>
                            
                            <div className="mt-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Network Utilization</h4>
                              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                            </div>
                          </>
                        )}
                        
                        {selectedReportData?.type === 'camera' && (
                          <>
                            <p>การจำลองกล้องวงจรปิดพบปัญหาสำคัญเกี่ยวกับการครอบคลุมพื้นที่และประสิทธิภาพในสภาพแสงน้อย มีจุดบอดหลายจุดที่ต้องการการแก้ไข และควรพิจารณาปรับเปลี่ยนตำแหน่งหรือเพิ่มกล้อง</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span>พบจุดบอดบริเวณทางเข้าอาคารและโถงลิฟต์</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span>กล้องในบริเวณจอดรถมีประสิทธิภาพต่ำในเวลากลางคืน</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span>การเชื่อมต่อกล้องบางจุดไม่เสถียรในช่วงฝนตก</span>
                              </div>
                            </div>
                            
                            <div className="mt-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Coverage Heatmap</h4>
                              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="findings">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-4">
                          <h3 className="text-lg font-semibold">รายละเอียดข้อค้นพบ</h3>
                          
                          {selectedReportData?.type === 'system' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                                <div className="flex gap-2 items-start">
                                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ระบบ NVR มีประสิทธิภาพดี</h4>
                                    <p className="text-sm">NVR สามารถรองรับกล้อง 32 ตัวได้อย่างมีประสิทธิภาพ การบันทึกที่ความละเอียด 1080p ไม่พบปัญหาในการจัดเก็บข้อมูล</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">การใช้แบนด์วิธสูงในชั่วโมงเร่งด่วน</h4>
                                    <p className="text-sm">ช่วงเวลา 8:00-9:00 และ 17:00-18:00 มีการใช้แบนด์วิธสูงถึง 80% ซึ่งอาจส่งผลต่อคุณภาพการสตรีมมิ่ง</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedReportData?.type === 'network' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">Switch POE ชั้น 1 ทำงานเกินกำลัง</h4>
                                    <p className="text-sm">PoE Switch ที่ชั้น 1 มีการใช้งานเกิน 90% ในชั่วโมงเร่งด่วน เนื่องจากมีการเชื่อมต่อกล้องมากเกินไป</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">NVR มีความจุไม่เพียงพอ</h4>
                                    <p className="text-sm">พื้นที่จัดเก็บของ NVR จะเต็มภายใน 14 วันที่การตั้งค่าปัจจุบัน ซึ่งน้อยกว่าข้อกำหนด 30 วัน</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ระบบสำรองไฟทำงานได้ดี</h4>
                                    <p className="text-sm">การทดสอบ UPS พบว่าสามารถรองรับระบบได้นาน 4 ชั่วโมงในกรณีไฟดับ</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">Backbone เครือข่ายมีประสิทธิภาพดี</h4>
                                    <p className="text-sm">การเชื่อมต่อระหว่างชั้นใช้ไฟเบอร์ 10G ซึ่งรองรับการขยายตัวของระบบได้ในอนาคต</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedReportData?.type === 'camera' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">จุดบอดทางเข้าหลัก</h4>
                                    <p className="text-sm">พบจุดบอดบริเวณทางเข้าหลักและโถงลิฟต์ เนื่องจากตำแหน่งกล้องไม่เหมาะสม</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ประสิทธิภาพต่ำในเวลากลางคืน</h4>
                                    <p className="text-sm">กล้องในบริเวณจอดรถมีประสิทธิภาพต่ำในเวลากลางคืน เนื่องจากแสงไม่เพียงพอ</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
                                <div className="flex gap-2 items-start">
                                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">สัญญาณไม่เสถียรในช่วงฝนตก</h4>
                                    <p className="text-sm">กล้องภายนอกบางตัวมีปัญหาในการส่งสัญญาณเมื่อมีฝนตกหนัก</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="recommendations">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-4">
                          <h3 className="text-lg font-semibold">ข้อเสนอแนะและการปรับปรุง</h3>
                          
                          {selectedReportData?.type === 'system' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">เพิ่มการบีบอัดวิดีโอ</h4>
                                    <p className="text-sm">ปรับการตั้งค่า H.265 เพื่อลดการใช้แบนด์วิธลง 30% โดยไม่กระทบคุณภาพวิดีโอ</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ปานกลาง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ตารางการบันทึกอัจฉริยะ</h4>
                                    <p className="text-sm">ตั้งค่า NVR ให้บันทึกเฉพาะเมื่อตรวจจับการเคลื่อนไหวในช่วงเวลากลางคืน</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ต่ำ</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ตรวจสอบระบบอัตโนมัติ</h4>
                                    <p className="text-sm">ติดตั้งระบบตรวจสอบอัตโนมัติเพื่อแจ้งเตือนเมื่อพบปัญหาในระบบ</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: สูง</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedReportData?.type === 'network' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">เพิ่ม Switch PoE ที่ชั้น 1</h4>
                                    <p className="text-sm">แนะนำให้เพิ่ม Switch PoE อีกหนึ่งตัวและแบ่งโหลดให้สมดุลกัน</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: สูงมาก</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">อัพเกรด NVR Storage</h4>
                                    <p className="text-sm">เพิ่ม HDD ขนาด 8TB อีก 2 ลูกเพื่อให้สามารถเก็บวิดีโอได้นาน 30 วัน</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: สูง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ปรับการตั้งค่า QoS</h4>
                                    <p className="text-sm">ตั้งค่า QoS บน Switch เพื่อให้ความสำคัญกับทราฟฟิกวิดีโอ</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ปานกลาง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ติดตั้งระบบ Network Monitoring</h4>
                                    <p className="text-sm">ติดตั้ง SNMP Monitoring เพื่อตรวจสอบสถานะอุปกรณ์เครือข่ายแบบเรียลไทม์</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ปานกลาง</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedReportData?.type === 'camera' && (
                            <div className="space-y-4">
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">เพิ่มกล้องบริเวณทางเข้า</h4>
                                    <p className="text-sm">ติดตั้งกล้อง Dome เพิ่มอีก 2 ตัวบริเวณทางเข้าหลักและโถงลิฟต์</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: สูงมาก</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ติดตั้งไฟส่องสว่างเพิ่ม</h4>
                                    <p className="text-sm">เพิ่มไฟ IR หรือไฟส่องสว่างบริเวณลานจอดรถ</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: สูง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">ปรับตำแหน่งกล้อง</h4>
                                    <p className="text-sm">ปรับมุมกล้องในบริเวณทางเดินหลักเพื่อให้ครอบคลุมพื้นที่มากขึ้น</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ปานกลาง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">อัพเกรดกล้องภายนอก</h4>
                                    <p className="text-sm">เปลี่ยนกล้องภายนอกเป็นรุ่นที่มีคุณสมบัติกันน้ำดีขึ้น (IP67)</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ปานกลาง</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">เพิ่มกล้อง PTZ</h4>
                                    <p className="text-sm">ติดตั้งกล้อง PTZ บริเวณลานจอดรถเพื่อเพิ่มความสามารถในการซูมและติดตาม</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ต่ำ</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex gap-2 items-start">
                                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium">เพิ่มฟีเจอร์ AI Analytics</h4>
                                    <p className="text-sm">ติดตั้งระบบวิเคราะห์ภาพอัจฉริยะเพื่อตรวจจับบุคคลและยานพาหนะ</p>
                                    <Badge className="mt-2" variant="outline">ความสำคัญ: ต่ำ</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
