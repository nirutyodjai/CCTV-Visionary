
'use client';

import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToolsIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
import { cn } from '@/lib/utils';

interface DevicesToolbarProps {
  onSelectDevice: (type: DeviceType) => void;
}

const TOOLBAR_DEVICES: DeviceType[] = [
    'cctv-dome',
    'cctv-bullet',
    'cctv-ptz',
    'wifi-ap',
    'nvr',
    'switch',
    'rack',
    'monitor',
    'utp-cat6',
    'fiber-optic',
];

export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
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
                                        forceUpdate();
                                    }}
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
