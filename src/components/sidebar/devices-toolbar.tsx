
'use client';

import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DevicesIcon } from '@/components/icons';
import { ToolCard } from '@/components/ui/tool-card';
import React from 'react';

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
     <Card key={key}>
      <CardHeader className="p-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DevicesIcon className="w-4 h-4" />
            เครื่องมืออุปกรณ์
        </CardTitle>
      </CardHeader>
       <CardContent className="p-3">
            <div className="grid grid-cols-5 gap-2">
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <button
                        key={type}
                        onClick={() => {
                            onSelectDevice(type);
                            forceUpdate();
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                        title={config.label}
                    >
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                    </button>
                )
            })}
            </div>
       </CardContent>
    </Card>
  );
}
