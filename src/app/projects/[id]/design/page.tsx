'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Download, 
  Share2, 
  Play, 
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Settings,
  Brain,
  Calculator,
  FileText,
  ArrowLeft,
  Grid,
  Move,
  MousePointer
} from 'lucide-react';

// Import components
import { DevicesToolbar } from '@/components/sidebar/devices-toolbar';
import { AiAssistant } from '@/components/sidebar/ai-assistant';
import { PropertiesPanel } from '@/components/sidebar/properties-panel';
import { LayersPanel } from '@/components/sidebar/layers-panel';
import { CostCalculator } from '@/components/sidebar/cost-calculator';

// Import types
import type { ProjectState, AnyDevice, Connection } from '@/lib/types';

interface DesignTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  position: 'left' | 'right';
}

const DESIGN_TOOLS: DesignTool[] = [
  {
    id: 'devices',
    name: 'อุปกรณ์',
    icon: <Grid className="w-5 h-5" />,
    component: DevicesToolbar,
    position: 'left'
  },
  {
    id: 'ai-assistant',
    name: 'ผู้ช่วย AI',
    icon: <Brain className="w-5 h-5" />,
    component: AiAssistant,
    position: 'left'
  },
  {
    id: 'layers',
    name: 'เลเยอร์',
    icon: <Layers className="w-5 h-5" />,
    component: LayersPanel,
    position: 'right'
  },
  {
    id: 'properties',
    name: 'คุณสมบัติ',
    icon: <Settings className="w-5 h-5" />,
    component: PropertiesPanel,
    position: 'right'
  },
  {
    id: 'calculator',
    name: 'คำนวณค่าใช้จ่าย',
    icon: <Calculator className="w-5 h-5" />,
    component: CostCalculator,
    position: 'right'
  }
];

export default function ProjectDesignPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Project state
  const [projectState, setProjectState] = useState<ProjectState>({
    id: params.id as string,
    projectName: 'โปรเจ็กต์ใหม่',
    buildings: [{
      id: 'building-1',
      name: 'อาคารหลัก',
      floors: [{
        id: 'floor-1',
        name: 'ชั้น 1',
        devices: [],
        connections: [],
        architecturalElements: []
      }]
    }]
  });

  // UI States
  const [activeLeftTool, setActiveLeftTool] = useState<string>('devices');
  const [activeRightTool, setActiveRightTool] = useState<string>('properties');
  const [selectedDevice, setSelectedDevice] = useState<AnyDevice | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [canvasMode, setCanvasMode] = useState<'select' | 'move' | 'draw'>('select');
  const [isSaving, setIsSaving] = useState(false);

  // Canvas interactions
  const handleDeviceAdd = useCallback((deviceType: string, position: { x: number; y: number }) => {
    // Add device logic
    console.log('Adding device:', deviceType, position);
  }, []);

  const handleDeviceSelect = useCallback((device: AnyDevice) => {
    setSelectedDevice(device);
    setActiveRightTool('properties');
  }, []);

  const handleDeviceMove = useCallback((deviceId: string, newPosition: { x: number; y: number }) => {
    // Move device logic
    console.log('Moving device:', deviceId, newPosition);
  }, []);

  // Project actions
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      // Save project logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: '✅ บันทึกโปรเจ็กต์สำเร็จ',
        description: 'ข้อมูลโปรเจ็กต์ได้รับการบันทึกแล้ว'
      });
    } catch (error) {
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกโปรเจ็กต์ได้',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportProject = () => {
    toast({
      title: '📄 กำลังส่งออกโปรเจ็กต์',
      description: 'กรุณารอสักครู่...'
    });
  };

  const handleSimulation = () => {
    setIsSimulating(!isSimulating);
    toast({
      title: isSimulating ? '⏸️ หยุดการจำลอง' : '▶️ เริ่มการจำลอง',
      description: isSimulating ? 'การจำลองถูกหยุดแล้ว' : 'เริ่มการจำลองระบบ'
    });
  };

  const renderLeftPanel = () => {
    const tool = DESIGN_TOOLS.find(t => t.id === activeLeftTool && t.position === 'left');
    if (!tool) return null;

    const Component = tool.component;
    return (
      <div className="h-full">
        <Component
          projectState={projectState}
          onDeviceAdd={handleDeviceAdd}
          selectedDevice={selectedDevice}
        />
      </div>
    );
  };

  const renderRightPanel = () => {
    const tool = DESIGN_TOOLS.find(t => t.id === activeRightTool && t.position === 'right');
    if (!tool) return null;

    const Component = tool.component;
    return (
      <div className="h-full">
        <Component
          projectState={projectState}
          selectedDevice={selectedDevice}
          onDeviceSelect={handleDeviceSelect}
        />
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div>
            <h1 className="font-semibold text-lg">{projectState.projectName}</h1>
            <p className="text-sm text-gray-500">โหมดออกแบบ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Canvas Mode */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={canvasMode === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCanvasMode('select')}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              variant={canvasMode === 'move' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCanvasMode('move')}
            >
              <Move className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[3rem] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulation}
          >
            {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isSimulating ? 'หยุดจำลอง' : 'จำลองระบบ'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveProject}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProject}
          >
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Tool Tabs */}
          <div className="flex border-b">
            {DESIGN_TOOLS.filter(tool => tool.position === 'left').map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveLeftTool(tool.id)}
                className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeLeftTool === tool.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tool.icon}
                <span className="hidden sm:inline">{tool.name}</span>
              </button>
            ))}
          </div>
          
          {/* Tool Content */}
          <div className="flex-1 overflow-auto">
            {renderLeftPanel()}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-100">
          {/* Canvas Grid */}
          <div 
            ref={canvasRef}
            className="w-full h-full relative overflow-auto canvas-grid"
            data-zoom={zoom}
          >
            {/* Floor Plan Area */}
            <div className="absolute inset-0 bg-white/90 m-8 rounded-lg shadow-sm border-2 border-dashed border-gray-300">
              <div className="w-full h-full relative">
                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">พื้นที่ออกแบบ</p>
                    <p className="text-sm">เลือกอุปกรณ์จากแถบเครื่องมือด้านซ้ายเพื่อเริ่มออกแบบ</p>
                  </div>
                </div>

                {/* Device rendering area */}
                {projectState.buildings[0]?.floors[0]?.devices.map((device) => (
                  <div
                    key={device.id}
                    className="absolute w-8 h-8 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 device-marker"
                    data-x={device.x}
                    data-y={device.y}
                    onClick={() => handleDeviceSelect(device)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Status */}
          <div className="absolute bottom-4 left-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>พร้อมใช้งาน</span>
                  </div>
                  <div>โหมด: {canvasMode}</div>
                  <div>ซูม: {zoom}%</div>
                  {selectedDevice && (
                    <div>เลือก: {selectedDevice.label}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Tool Tabs */}
          <div className="flex border-b">
            {DESIGN_TOOLS.filter(tool => tool.position === 'right').map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveRightTool(tool.id)}
                className={`flex-1 p-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeRightTool === tool.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tool.icon}
                <span className="hidden sm:inline text-xs">{tool.name}</span>
              </button>
            ))}
          </div>
          
          {/* Tool Content */}
          <div className="flex-1 overflow-auto">
            {renderRightPanel()}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-gray-100 border-t flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>อุปกรณ์: {projectState.buildings[0]?.floors[0]?.devices.length || 0}</span>
          <span>การเชื่อมต่อ: {projectState.buildings[0]?.floors[0]?.connections.length || 0}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>บันทึกล่าสุด: เมื่อสักครู่</span>
          {isSimulating && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>กำลังจำลอง</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
