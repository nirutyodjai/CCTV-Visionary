'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  PenTool, 
  Layers, 
  Camera, 
  Network, 
  Monitor, 
  Settings, 
  Save,
  Download,
  Share2,
  Zap,
  Target,
  Shield,
  Cpu,
  Layout,
  Palette,
  ArrowRight,
  Play,
  Eye,
  Grid3X3,
  Ruler,
  Square,
  Circle,
  Minus,
  Move3D,
  RotateCw,
  Maximize2,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

const designTools = [
  {
    id: 'floor-plan',
    title: 'แบบแปลนชั้น',
    description: 'สร้างและแก้ไขแบบแปลนอาคาร',
    icon: Layout,
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 'camera-placement',
    title: 'การวางกล้อง',
    description: 'วางตำแหน่งกล้อง CCTV อัจฉริยะ',
    icon: Camera,
    color: 'bg-green-500',
    status: 'ready'
  },
  {
    id: 'network-design',
    title: 'ออกแบบเครือข่าย',
    description: 'การออกแบบระบบเครือข่าย',
    icon: Network,
    color: 'bg-purple-500',
    status: 'ready'
  },
  {
    id: 'coverage-analysis',
    title: 'วิเคราะห์การครอบคลุม',
    description: 'ตรวจสอบพื้นที่ครอบคลุม',
    icon: Target,
    color: 'bg-orange-500',
    status: 'pending'
  },
  {
    id: 'security-zones',
    title: 'โซนรักษาความปลอดภัย',
    description: 'กำหนดโซนรักษาความปลอดภัย',
    icon: Shield,
    color: 'bg-red-500',
    status: 'ready'
  },
  {
    id: 'performance-optimization',
    title: 'ปรับประสิทธิภาพ',
    description: 'ปรับแต่งประสิทธิภาพระบบ',
    icon: Cpu,
    color: 'bg-cyan-500',
    status: 'ready'
  }
];

const drawingTools = [
  { id: 'select', title: 'เลือก', icon: Move3D },
  { id: 'rectangle', title: 'สี่เหลี่ยม', icon: Square },
  { id: 'circle', title: 'วงกลม', icon: Circle },
  { id: 'line', title: 'เส้นตรง', icon: Minus },
  { id: 'pen', title: 'ปากกา', icon: PenTool },
  { id: 'ruler', title: 'ไม้บรรทัด', icon: Ruler }
];

const quickActions = [
  { id: 'save', title: 'บันทึก', icon: Save, shortcut: 'Ctrl+S' },
  { id: 'export', title: 'ส่งออก', icon: Download, shortcut: 'Ctrl+E' },
  { id: 'share', title: 'แชร์', icon: Share2, shortcut: 'Ctrl+Shift+S' },
  { id: 'preview', title: 'ดูตัวอย่าง', icon: Eye, shortcut: 'Ctrl+P' },
  { id: 'simulate', title: 'จำลอง', icon: Play, shortcut: 'F5' },
  { id: 'analyze', title: 'วิเคราะห์', icon: Zap, shortcut: 'F6' }
];

const projectStats = [
  { label: 'กล้อง CCTV', value: 24, total: 50, color: 'bg-blue-500' },
  { label: 'โซนครอบคลุม', value: 85, total: 100, color: 'bg-green-500', unit: '%' },
  { label: 'เครือข่าย', value: 92, total: 100, color: 'bg-purple-500', unit: '%' },
  { label: 'ความปลอดภัย', value: 98, total: 100, color: 'bg-red-500', unit: '%' }
];

export default function DesignPage() {
  const [activeDesignTool, setActiveDesignTool] = useState('floor-plan');
  const [activeDrawingTool, setActiveDrawingTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isGridVisible, setIsGridVisible] = useState(true);
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PenTool className="h-6 w-6 text-primary" />
              ออกแบบ CCTV
            </h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>โปรเจ็กต์:</span>
              <Badge variant="secondary">ห้างสรรพสินค้า ABC</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title={`${action.title} (${action.shortcut})`}
              >
                <action.icon className="h-4 w-4" />
                <span className="hidden md:inline">{action.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Design Tools */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Project Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  สถานะโปรเจ็กต์
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stat.label}</span>
                      <span className="font-medium">
                        {stat.value}{stat.unit} {stat.total && !stat.unit && `/ ${stat.total}`}
                      </span>
                    </div>
                    <Progress 
                      value={(stat.value / stat.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Design Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">เครื่องมือออกแบบ</CardTitle>
                <CardDescription>เลือกเครื่องมือสำหรับการออกแบบ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {designTools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeDesignTool === tool.id ? "default" : "ghost"}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => setActiveDesignTool(tool.id)}
                  >
                    <div className={`w-3 h-3 rounded-full ${tool.color} mr-3`} />
                    <div className="text-left">
                      <div className="font-medium">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Drawing Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">เครื่องมือวาด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {drawingTools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={activeDrawingTool === tool.id ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col gap-1 h-16"
                      onClick={() => setActiveDrawingTool(tool.id)}
                    >
                      <tool.icon className="h-5 w-5" />
                      <span className="text-xs">{tool.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Canvas Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">การควบคุมผืนผ้าใบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ระดับการซูม</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                    >
                      -
                    </Button>
                    <span className="min-w-16 text-center text-sm">{zoomLevel}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">แสดงกริด</label>
                  <Button
                    variant={isGridVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsGridVisible(!isGridVisible)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    พอดีหน้าจอ
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    รีเซ็ต
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ชั้น 1 - ห้องโถงหลัก
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  ขนาด: 50m × 30m
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center max-w-md">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Layout className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">เริ่มต้นออกแบบ</h3>
                  <p className="text-muted-foreground">
                    เลือกเครื่องมือจากแถบด้านซ้ายเพื่อเริ่มออกแบบแปลนผัง CCTV ของคุณ
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => setActiveDesignTool('floor-plan')}>
                      สร้างแปลนผัง
                    </Button>
                    <Button variant="outline" onClick={() => setActiveDesignTool('camera-placement')}>
                      วางกล้อง
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Canvas Grid (if enabled) */}
            {isGridVisible && (
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle, #666 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties & Layers */}
        <div className="w-80 border-l bg-card overflow-y-auto">
          <Tabs defaultValue="properties" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="properties">คุณสมบัติ</TabsTrigger>
              <TabsTrigger value="layers">เลเยอร์</TabsTrigger>
              <TabsTrigger value="history">ประวัติ</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="properties" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">คุณสมบัติออบเจ็กต์</CardTitle>
                    <CardDescription>ไม่มีออบเจ็กต์ที่เลือก</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>เลือกออบเจ็กต์เพื่อแสดงคุณสมบัติ</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="layers" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">จัดการเลเยอร์</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: 'พื้นฐานสถาปัตยกรรม', visible: true, locked: false },
                      { name: 'กล้อง CCTV', visible: true, locked: false },
                      { name: 'ระบบเครือข่าย', visible: true, locked: false },
                      { name: 'โซนรักษาความปลอดภัย', visible: false, locked: false },
                      { name: 'การเดินสายไฟ', visible: false, locked: true }
                    ].map((layer, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Eye className={`h-4 w-4 ${layer.visible ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="flex-1 text-sm">{layer.name}</span>
                        <Button variant="ghost" size="sm">
                          {layer.locked ? '🔒' : '🔓'}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ประวัติการแก้ไข</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      'เพิ่มกล้อง CCTV #24',
                      'ย้ายกล้อง CCTV #23',
                      'สร้างห้องใหม่',
                      'เปลี่ยนการตั้งค่าเครือข่าย',
                      'ลบประตูเก่า'
                    ].map((action, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="flex-1">{action}</span>
                        <span className="text-xs text-muted-foreground">
                          {index + 1}m ที่แล้ว
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}