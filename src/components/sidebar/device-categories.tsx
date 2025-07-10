'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, MonitorIcon, NvrIcon,
  SwitchIcon, WifiApIcon, UtpCat6Icon, FiberOpticIcon, RackIcon, DataCenterIcon, NetworkIcon, CommunicationIcon,
  ElectricalPanelIcon, BmsIcon, FireAlarmPanelIcon,
  AccessControlIcon, PaSystemIcon, AudioSystemIcon, MatvIcon, SatelliteIcon, NurseCallIcon,
  TableIcon, ElevatorIcon, DevicesIcon,
} from '@/components/icons';
import type { DeviceType } from '@/lib/types';

interface Category {
  value: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  items: {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    type: DeviceType;
  }[];
}

const CATEGORIES: Category[] = [
  {
    value: 'surveillance',
    label: 'กล้องวงจรปิด',
    icon: CctvDomeIcon,
    color: 'blue',
    items: [
      { icon: CctvDomeIcon, label: 'กล้องวงจรปิดแบบโดม', type: 'cctv-dome' },
      { icon: CctvBulletIcon, label: 'กล้องวงจรปิดแบบบูลเล็ต', type: 'cctv-bullet' },
      { icon: CctvPtzIcon, label: 'กล้องวงจรปิดแบบ PTZ', type: 'cctv-ptz' },
      { icon: NvrIcon, label: 'เครื่องบันทึก NVR', type: 'nvr' },
      { icon: MonitorIcon, label: 'จอแสดงผล', type: 'monitor' },
    ],
  },
  {
    value: 'network',
    label: 'เน็ตเวิร์ค',
    icon: NetworkIcon,
    color: 'green',
    items: [
      { icon: SwitchIcon, label: 'สวิตช์เครือข่าย', type: 'switch' },
      { icon: WifiApIcon, label: 'จุดกระจายสัญญาณไวไฟ', type: 'wifi-ap' },
      { icon: UtpCat6Icon, label: 'สาย UTP CAT6', type: 'utp-cat6' },
      { icon: FiberOpticIcon, label: 'สาย Fiber Optic', type: 'fiber-optic' },
      { icon: RackIcon, label: 'ตู้แร็ค', type: 'rack' },
      { icon: DataCenterIcon, label: 'ศูนย์ข้อมูล', type: 'datacenter' },
    ],
  },
  {
    value: 'electrical',
    label: 'ไฟฟ้า/เครื่องกล',
    icon: ElectricalPanelIcon,
    color: 'amber',
    items: [
      { icon: ElectricalPanelIcon, label: 'แผงไฟฟ้า', type: 'electrical-panel' },
      { icon: BmsIcon, label: 'ระบบจัดการอาคาร', type: 'bms' },
      { icon: FireAlarmPanelIcon, label: 'แผงสัญญาณเตือนไฟไหม้', type: 'fire-alarm' },
    ],
  },
  {
    value: 'security',
    label: 'ระบบรักษาความปลอดภัย',
    icon: AccessControlIcon,
    color: 'purple',
    items: [
      { icon: AccessControlIcon, label: 'ระบบควบคุมการเข้าออก', type: 'access-control' },
      { icon: PaSystemIcon, label: 'ระบบประกาศ', type: 'pa-system' },
      { icon: AudioSystemIcon, label: 'ระบบเสียง', type: 'audio-system' },
      { icon: MatvIcon, label: 'ระบบเสาอากาศรวม', type: 'matv' },
      { icon: SatelliteIcon, label: 'ระบบดาวเทียม', type: 'satellite' },
      { icon: NurseCallIcon, label: 'ระบบเรียกพยาบาล', type: 'nursecall' },
    ],
  },
    {
    value: 'architectural',
    label: 'สถาปัตยกรรม',
    icon: ElevatorIcon,
    color: 'indigo',
    items: [
      { icon: TableIcon, label: 'โต๊ะ', type: 'table' },
      { icon: ElevatorIcon, label: 'ลิฟท์', type: 'elevator' },
    ],
  },
];

interface DeviceCategoriesProps {
  onSelectDevice: (type: DeviceType) => void;
}

export function DeviceCategories({ onSelectDevice }: DeviceCategoriesProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('surveillance');

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="p-2 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <DevicesIcon className="w-5 h-5" />
          <span>Device Categories</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full flex">
          <TabsList className="flex flex-col h-auto p-1 bg-gray-50 dark:bg-gray-900/50 rounded-none">
            {CATEGORIES.map((cat) => (
              <TooltipProvider key={cat.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={cat.value}
                      className={cn(
                        "w-12 h-12 rounded-md flex items-center justify-center data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400",
                        `text-${cat.color}-500`
                      )}
                    >
                      <cat.icon className="w-6 h-6" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{cat.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </TabsList>

          <div className="flex-1 p-2">
            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="m-0">
                <div className="grid grid-cols-4 gap-2">
                  {cat.items.map((item) => (
                    <TooltipProvider key={item.type}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onSelectDevice(item.type)}
                            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                          >
                            <item.icon className={cn("w-7 h-7 transition-colors", `text-${cat.color}-500 group-hover:text-${cat.color}-600 dark:text-${cat.color}-400 dark:group-hover:text-${cat.color}-300`)} />
                             <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">{item.label}</span>
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
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
