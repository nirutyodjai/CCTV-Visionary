
import { Button } from '@/components/ui/button';
import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

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

export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
  return (
     <Card>
      <CardHeader className="p-3 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            เครื่องมืออุปกรณ์
        </CardTitle>
      </CardHeader>
       <CardContent className="p-3">
        <TooltipProvider>
            <div className="grid grid-cols-4 gap-2">
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <Tooltip key={type}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-14 flex items-center justify-center [&_svg]:size-7"
                                onClick={() => onSelectDevice(type)}
                                >
                                <Icon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>เพิ่ม {config.name}</p>
                        </TooltipContent>
                    </Tooltip>
                )
            })}
            </div>
        </TooltipProvider>
       </CardContent>
    </Card>
  );
}
