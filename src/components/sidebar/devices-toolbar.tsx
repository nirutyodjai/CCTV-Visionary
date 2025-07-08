
'use client';

import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
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
            <Wrench className="w-4 h-4" />
            เครื่องมืออุปกรณ์
        </CardTitle>
      </CardHeader>
       <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2">
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <ToolCard
                        key={type}
                        icon={<Icon className="w-6 h-6" />}
                        title={config.label}
                        onClick={() => {
                            onSelectDevice(type);
                            forceUpdate();
                        }}
                    />
                )
            })}
            </div>
       </CardContent>
    </Card>
  );
}
