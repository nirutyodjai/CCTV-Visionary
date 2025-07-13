
'use client';

import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolsIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
import { cn } from '@/lib/utils';

// อินเทอร์เฟซสำหรับคุณสมบัติของแถบเครื่องมืออุปกรณ์
interface DevicesToolbarProps {
  onSelectDevice: (type: DeviceType) => void; // ฟังก์ชันเมื่อเลือกอุปกรณ์
}

// รายการอุปกรณ์ที่แสดงในแถบเครื่องมือ
const TOOLBAR_DEVICES: DeviceType[] = [
    'cctv-dome',      // กล้องโดม
    'cctv-bullet',    // กล้องแบบกระสุน
    'cctv-ptz',       // กล้อง PTZ
    'wifi-ap',        // จุดเชื่อมต่อไวไฟ
    'nvr',           // เครื่องบันทึก
    'switch',        // สวิตช์
    'rack',          // แร็ค
    'monitor',       // จอแสดงผล
    'utp-cat6',      // สาย UTP
    'fiber-optic',   // สายใยแก้วนำแสง
];

// คอมโพเนนต์แถบเครื่องมืออุปกรณ์
export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
    // ใช้สำหรับ force update คอมโพเนนต์
    const [key, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
     <Card key={key} className="border-blue-200 dark:border-blue-800 shadow-md">
      <CardHeader className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-700">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <ToolsIcon className="w-5 h-5" />
            เครื่องมือด่วน
        </CardTitle>
      </CardHeader>
       <CardContent className="p-3 bg-white dark:bg-gray-900/50">
            {/* กริดแสดงอุปกรณ์ต่างๆ */}
            <div className="grid grid-cols-5 gap-2">
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <TooltipProvider key={type}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        onSelectDevice(type);
                                        forceUpdate(); // อัพเดทคอมโพเนนต์
                                    }}
                                    title={config.label}
                                    aria-label={`เลือก${config.label}`}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <Icon className={cn("w-7 h-7 transition-colors", config.colorClass)} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-gray-800 text-white border-gray-700">
                                <p>{config.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            })}
            </div>
       </CardContent>
    </Card>
  );
}
