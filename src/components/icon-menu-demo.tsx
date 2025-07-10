'use client';

import React, { useState } from 'react';
import { IconMenuSidebar } from './sidebar/icon-menu-sidebar';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { DeviceCategories } from './sidebar/device-categories';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ProjectNavigator } from './sidebar/project-navigator';
import { ProjectManager } from './sidebar/project-manager';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { PropertiesPanel } from './sidebar/properties-panel';
import { PlannerCanvas } from './canvas/planner-canvas';
import { AppSettings } from './sidebar/app-settings';
import { NetworkSettings } from './sidebar/network-settings';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Floor, AnyDevice, ArchitecturalElement } from '@/lib/types';

export function IconMenuDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ข้อมูลเริ่มต้นสำหรับการแสดงผล
  const defaultFloor: Floor = {
    id: 'demo-floor-1',
    name: 'ชั้น 1',
    devices: [
      {
        id: 'demo-camera-1',
        type: 'cctv-dome',
        label: 'กล้อง Dome 1',
        x: 0.3,
        y: 0.3,
        rotation: 0,
        resolution: '4K',
        fov: 90,
        range: 50
      } as AnyDevice,
      {
        id: 'demo-nvr-1',
        type: 'nvr',
        label: 'NVR หลัก',
        x: 0.7,
        y: 0.7,
        rotation: 0,
        ports: 16,
        channels: 16
      } as AnyDevice
    ],
    connections: [],
    architecturalElements: []
  };

  const defaultCablingMode = { enabled: false, fromDeviceId: null };

  // Default data for network settings
  const defaultVlans = [
    { id: '1', name: 'CCTV Network', color: 'hsl(221, 83%, 53%)' },
    { id: '2', name: 'Management', color: 'hsl(142, 71%, 45%)' }
  ];

  const defaultSubnets = [
    { id: '1', cidr: '192.168.1.0/24' },
    { id: '2', cidr: '10.0.0.0/8' }
  ];

  const handleDeviceClick = (device: AnyDevice) => {
    console.log('Device clicked:', device);
  };

  const handleArchElementClick = (element: ArchitecturalElement) => {
    console.log('Architectural element clicked:', element);
  };

  const handleCanvasClick = () => {
    console.log('Canvas clicked');
  };

  const handleDeviceMove = (deviceId: string, pos: { x: number; y: number }) => {
    console.log('Device moved:', deviceId, pos);
  };

  const handleDeviceUpdate = (device: AnyDevice) => {
    console.log('Device updated:', device);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 แดشบอร์ด CCTV Planner
                  <Badge variant="secondary">v2.0</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* สถิติโครงการ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        📷 อุปกรณ์ CCTV
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">กล้องทั้งหมด</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        🌐 เครือข่าย
                      </h3>
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-sm text-green-700 dark:text-green-300">การเชื่อมต่อ</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        ⚡ ประสิทธิภาพ
                      </h3>
                      <p className="text-2xl font-bold text-purple-600">95%</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">ระบบทำงาน</p>
                    </div>
                  </div>

                  {/* ขั้นตอนการทำงาน */}
                  <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
                    <CardHeader>
                      <CardTitle className="text-lg">🔄 ขั้นตอนการออกแบบ CCTV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors" onClick={() => setActiveTab('project')}>
                          <div className="text-2xl mb-2">📋</div>
                          <div className="font-medium text-sm">1. วางแผน</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">โปรเจ็กต์ • ไฟล์</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-colors" onClick={() => setActiveTab('devices')}>
                          <div className="text-2xl mb-2">🏗️</div>
                          <div className="font-medium text-sm">2. ออกแบบ</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">สถาปัตยกรรม • อุปกรณ์</div>
                        </div>
                        <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors" onClick={() => setActiveTab('ai')}>
                          <div className="text-2xl mb-2">🤖</div>
                          <div className="font-medium text-sm">3. วิเคราะห์</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">AI • การวินิจฉัย</div>
                        </div>
                        <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors" onClick={() => setActiveTab('analytics')}>
                          <div className="text-2xl mb-2">✅</div>
                          <div className="font-medium text-sm">4. ตรวจสอบ</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">3D • จำลอง</div>
                        </div>
                        <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 transition-colors" onClick={() => setActiveTab('export')}>
                          <div className="text-2xl mb-2">📤</div>
                          <div className="font-medium text-sm">5. ส่งมอบ</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">รายงาน • ส่งออก</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            <PlannerCanvas
              floor={defaultFloor}
              cablingMode={defaultCablingMode}
              onDeviceClick={handleDeviceClick}
              onArchElementClick={handleArchElementClick}
              onCanvasClick={handleCanvasClick}
              onDeviceMove={handleDeviceMove}
              onDeviceUpdate={handleDeviceUpdate}
            />
          </div>
        );
        
      case 'devices':
        return (
          <div className="space-y-4">
            <DevicesToolbar onSelectDevice={(device) => console.log('Selected device:', device)} />
            <DeviceCategories onSelectDevice={(device) => console.log('Selected device from categories:', device)} />
          </div>
        );
        
      case 'architecture':
        return <ArchitectureToolbar 
          selectedTool={null} 
          onSelectTool={(tool) => console.log('Selected tool:', tool)} 
        />;
        
      case 'ai':
        return <AiAssistant 
          onAnalyze={() => console.log('Analyzing...')}
          onSuggest={() => console.log('Suggesting...')}
          onFindCablePaths={() => console.log('Finding cable paths...')}
          isAnalyzing={false}
          isSuggesting={false}
          isFindingPaths={false}
        />;
        
      case 'diagnostics':
        return <DiagnosticsPanel 
          diagnostics={[]}
          onRunDiagnostics={() => console.log('Running diagnostics...')}
          isLoading={false}
        />;
        
      case 'project':
        return (
          <div className="space-y-4">
            <ProjectNavigator 
              buildings={[{
                id: 'demo-building',
                name: 'อาคารตัวอย่าง',
                floors: [defaultFloor]
              }]}
              activeBuildingId="demo-building"
              activeFloorId="demo-floor-1"
              onFloorSelect={(buildingId, floorId) => console.log('Floor selected:', buildingId, floorId)}
              onAddFloor={() => console.log('Adding floor...')}
              onUpdateBuildingName={(buildingId, name) => console.log('Update building name:', buildingId, name)}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">จัดการโครงการ</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => console.log('Opening project manager...')}
                >
                  เปิดตัวจัดการโครงการ
                </Button>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'report':
        return <BillOfMaterials 
          project={{
            id: 'demo-project',
            projectName: 'โครงการตัวอย่าง',
            buildings: [{
              id: 'demo-building',
              name: 'อาคารตัวอย่าง',
              floors: [defaultFloor]
            }]
          }}
        />;
        
      case 'settings':
        return (
          <AppSettings 
            onImportDemo={() => console.log('Importing demo...')}
            onExportSettings={() => console.log('Exporting settings...')}
            onImportSettings={() => console.log('Importing settings...')}
            onResetSettings={() => console.log('Resetting settings...')}
          />
        );
        
      case 'files':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📁 จัดการไฟล์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>จัดการไฟล์โครงการ แบบแปลน และเอกสารต่างๆ</p>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📄 แบบแปลนชั้น 1.dwg
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📷 รูปภาพสำรวจ.jpg
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📊 รายงานโครงการ.pdf
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📋 เอกสารข้อกำหนด.docx
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'network':
        return (
          <NetworkSettings 
            vlans={defaultVlans}
            subnets={defaultSubnets}
            onAddVlan={(vlan) => console.log('Adding VLAN:', vlan)}
            onAddSubnet={(subnet) => console.log('Adding subnet:', subnet)}
            onDeleteVlan={(id) => console.log('Deleting VLAN:', id)}
            onDeleteSubnet={(id) => console.log('Deleting subnet:', id)}
            onTestConnection={() => Promise.resolve(true)}
          />
        );
        
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 การวิเคราะห์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>รายงานและการวิเคราะห์ประสิทธิภาพของระบบ CCTV</p>
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-sm font-medium">อัตราการใช้งาน</div>
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-sm font-medium">ประสิทธิภาพระบบ</div>
                  <div className="text-2xl font-bold text-green-600">92%</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-sm font-medium">การครอบคลุม</div>
                  <div className="text-2xl font-bold text-purple-600">88%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔒 ความปลอดภัย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>การจัดการความปลอดภัยและการเข้าถึงระบบ</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="text-sm">ระบบรักษาความปลอดภัย</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">ทำงานปกติ</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <span className="text-sm">การเข้ารหัสข้อมูล</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">กำลังปรับปรุง</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <span className="text-sm">การสำรองข้อมูล</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">อัตโนมัติ</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'export':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📤 ส่งออกข้อมูล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>ส่งออกข้อมูลเป็น PDF, Excel, CAD และรูปแบบอื่นๆ</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full" variant="outline">
                  📄 ส่งออก PDF Report
                </Button>
                <Button className="w-full" variant="outline">
                  📊 ส่งออก Excel BOM
                </Button>
                <Button className="w-full" variant="outline">
                  📐 ส่งออก AutoCAD DWG
                </Button>
                <Button className="w-full" variant="outline">
                  🖼️ ส่งออกรูปภาพ PNG/JPG
                </Button>
                <Button className="w-full" variant="outline">
                  💾 ส่งออกข้อมูลโครงการ JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'connect':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 แชร์โปรเจ็กต์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>แชร์โปรเจ็กต์ให้ทีมงานและลูกค้า</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full" variant="outline">
                  📧 ส่งทางอีเมล
                </Button>
                <Button className="w-full" variant="outline">
                  🔗 สร้างลิงก์แชร์
                </Button>
                <Button className="w-full" variant="outline">
                  👥 เชิญทีมงาน
                </Button>
                <Button className="w-full" variant="outline">
                  💼 ส่งให้ลูกค้า
                </Button>
                <Button className="w-full" variant="outline">
                  🌐 เผยแพร่ออนไลน์
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'layers':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗂️ จัดการเลเยอร์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>จัดการเลเยอร์การแสดงผลและการมองเห็น</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">เลเยอร์กล้อง CCTV</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">เลเยอร์เครือข่าย</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">เลเยอร์สถาปัตยกรรม</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">เลเยอร์การเดินสาย</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'help':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ❓ ความช่วยเหลือ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>คู่มือการใช้งานและข้อมูลการสนับสนุน</p>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📖 คู่มือการใช้งาน
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎥 วิดีโอสอนการใช้งาน
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💬 ติดต่อฝ่ายสนับสนุน
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🆕 ข่าวสารและการอัปเดต
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>เมนู: {activeTab}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>เนื้อหาของเมนู {activeTab}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <IconMenuSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
