'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Import all icons
import {
  // CCTV / Surveillance
  CctvBulletIcon,
  CctvDomeIcon,
  CctvPtzIcon,
  MonitorIcon,
  NvrIcon,
  
  // Network / Communication
  SwitchIcon,
  WifiApIcon,
  UtpCat6Icon,
  FiberOpticIcon,
  RackIcon,
  DataCenterIcon,
  NetworkIcon,
  CommunicationIcon,
  
  // Electrical / MEP
  ElectricalPanelIcon,
  BmsIcon,
  FireAlarmPanelIcon,
  
  // Security Systems
  AccessControlIcon,
  PaSystemIcon,
  AudioSystemIcon,
  MatvIcon,
  SatelliteIcon,
  NurseCallIcon,
  
  // Architectural
  TableIcon,
  ElevatorIcon,
} from '@/components/icons';

// Import types from project types
import type { DeviceType } from '@/lib/types';

interface CategoryIcon {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  type: DeviceType;
}

const SURVEILLANCE_ICONS: CategoryIcon[] = [
  { icon: CctvDomeIcon, label: 'กล้องวงจรปิดแบบโดม', type: 'cctv-dome' },
  { icon: CctvBulletIcon, label: 'กล้องวงจรปิดแบบบูลเล็ต', type: 'cctv-bullet' },
  { icon: CctvPtzIcon, label: 'กล้องวงจรปิดแบบ PTZ', type: 'cctv-ptz' },
  { icon: NvrIcon, label: 'เครื่องบันทึก NVR', type: 'nvr' },
  { icon: MonitorIcon, label: 'จอแสดงผล', type: 'monitor' },
];

const NETWORK_ICONS: CategoryIcon[] = [
  { icon: SwitchIcon, label: 'สวิตช์เครือข่าย', type: 'switch' },
  { icon: WifiApIcon, label: 'จุดกระจายสัญญาณไวไฟ', type: 'wifi-ap' },
  { icon: UtpCat6Icon, label: 'สาย UTP CAT6', type: 'utp-cat6' },
  { icon: FiberOpticIcon, label: 'สาย Fiber Optic', type: 'fiber-optic' },
  { icon: RackIcon, label: 'ตู้แร็ค', type: 'rack' },
  { icon: DataCenterIcon, label: 'ศูนย์ข้อมูล', type: 'datacenter' },
  { icon: NetworkIcon, label: 'อุปกรณ์เน็ตเวิร์ค', type: 'network' },
  { icon: CommunicationIcon, label: 'ระบบสื่อสาร', type: 'communication' },
];

const ELECTRICAL_ICONS: CategoryIcon[] = [
  { icon: ElectricalPanelIcon, label: 'แผงไฟฟ้า', type: 'electrical-panel' },
  { icon: BmsIcon, label: 'ระบบจัดการอาคาร', type: 'bms' },
  { icon: FireAlarmPanelIcon, label: 'แผงสัญญาณเตือนไฟไหม้', type: 'fire-alarm' },
];

const SECURITY_ICONS: CategoryIcon[] = [
  { icon: AccessControlIcon, label: 'ระบบควบคุมการเข้าออก', type: 'access-control' },
  { icon: PaSystemIcon, label: 'ระบบประกาศ', type: 'pa-system' },
  { icon: AudioSystemIcon, label: 'ระบบเสียง', type: 'audio-system' },
  { icon: MatvIcon, label: 'ระบบเสาอากาศรวม', type: 'matv' },
  { icon: SatelliteIcon, label: 'ระบบดาวเทียม', type: 'satellite' },
  { icon: NurseCallIcon, label: 'ระบบเรียกพยาบาล', type: 'nursecall' },
];

const ARCHITECTURAL_ICONS: CategoryIcon[] = [
  { icon: TableIcon, label: 'โต๊ะ', type: 'table' },
  { icon: ElevatorIcon, label: 'ลิฟท์', type: 'elevator' },
];

interface DeviceCategoriesProps {
  onSelectDevice: (type: DeviceType) => void;
}

export function DeviceCategories({ onSelectDevice }: DeviceCategoriesProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('surveillance');
  
  return (
    <Card className="border-blue-200 dark:border-blue-800 shadow-md">
      <CardHeader className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-700">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
          อุปกรณ์ตามหมวดหมู่
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="w-full grid grid-cols-5 rounded-none h-auto p-0 bg-gray-100 dark:bg-gray-800/50">
            <TabsTrigger 
              value="surveillance" 
              className={cn(
                "rounded-none border-b-2 py-2 text-xs font-medium",
                activeCategory === "surveillance" 
                  ? "border-blue-500 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400" 
                  : "border-transparent text-gray-500 hover:border-gray-300"
              )}
            >
              กล้องวงจรปิด
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className={cn(
                "rounded-none border-b-2 py-2 text-xs font-medium",
                activeCategory === "network" 
                  ? "border-green-500 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400" 
                  : "border-transparent text-gray-500 hover:border-gray-300"
              )}
            >
              เน็ตเวิร์ค
            </TabsTrigger>
            <TabsTrigger 
              value="electrical" 
              className={cn(
                "rounded-none border-b-2 py-2 text-xs font-medium",
                activeCategory === "electrical" 
                  ? "border-amber-500 bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400" 
                  : "border-transparent text-gray-500 hover:border-gray-300"
              )}
            >
              ไฟฟ้า/เครื่องกล
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className={cn(
                "rounded-none border-b-2 py-2 text-xs font-medium",
                activeCategory === "security" 
                  ? "border-purple-500 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400" 
                  : "border-transparent text-gray-500 hover:border-gray-300"
              )}
            >
              ระบบรักษาความปลอดภัย
            </TabsTrigger>
            <TabsTrigger 
              value="architectural" 
              className={cn(
                "rounded-none border-b-2 py-2 text-xs font-medium",
                activeCategory === "architectural" 
                  ? "border-indigo-500 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-gray-500 hover:border-gray-300"
              )}
            >
              สถาปัตยกรรม
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="surveillance" className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {SURVEILLANCE_ICONS.map((item) => (
                <TooltipProvider key={item.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectDevice(item.type)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                      >
                        <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="network" className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {NETWORK_ICONS.map((item) => (
                <TooltipProvider key={item.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectDevice(item.type)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group border border-transparent hover:border-green-200 dark:hover:border-green-700"
                      >
                        <item.icon className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="electrical" className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {ELECTRICAL_ICONS.map((item) => (
                <TooltipProvider key={item.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectDevice(item.type)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 group border border-transparent hover:border-amber-200 dark:hover:border-amber-700"
                      >
                        <item.icon className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {SECURITY_ICONS.map((item) => (
                <TooltipProvider key={item.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectDevice(item.type)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                      >
                        <item.icon className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="architectural" className="p-3">
            <div className="grid grid-cols-5 gap-2">
              {ARCHITECTURAL_ICONS.map((item) => (
                <TooltipProvider key={item.type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectDevice(item.type)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700"
                      >
                        <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
