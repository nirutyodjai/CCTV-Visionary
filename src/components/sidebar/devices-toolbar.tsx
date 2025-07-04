
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
    'rack-indoor',
    'rack-outdoor',
];

// Assign consistent colors for better UX
const deviceToolColors: { [key in DeviceType]?: string } = {
    'cctv-dome': 'hsl(221, 83%, 53%)',
    'cctv-bullet': 'hsl(221, 83%, 53%)',
    'cctv-ptz': 'hsl(221, 83%, 53%)',
    'wifi-ap': 'hsl(142, 71%, 45%)',
    'nvr': 'hsl(24, 95%, 53%)',
    'switch': 'hsl(24, 95%, 53%)',
    'rack-indoor': 'hsl(215, 20%, 65%)',
    'rack-outdoor': 'hsl(215, 20%, 65%)',
};


export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
    // We use a reducer to force a re-render after clicking a tool.
    // This is because these tools are actions, not toggles, and shouldn't stay "checked".
    // The re-render will ensure the `checked={false}` prop is re-applied.
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
            <div className="grid grid-cols-2 gap-3">
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <ToolCard
                        key={type}
                        icon={<Icon />}
                        title={config.name}
                        subtitle="เพิ่มลงในแผน"
                        color={deviceToolColors[type] || 'hsl(var(--primary))'}
                        checked={false}
                        onChange={() => {
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
