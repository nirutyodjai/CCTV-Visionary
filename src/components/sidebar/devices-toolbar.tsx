
import { Button } from '@/components/ui/button';
import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ReactionButtons from './reaction-buttons';

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
       <CardContent className="p-3 space-y-3">
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
                                className="h-16 flex flex-col items-center justify-center space-y-1 p-1"
                                onClick={() => onSelectDevice(type)}
                                >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] text-center leading-tight">{config.name}</span>
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
        <Separator/>
        <div className="flex justify-center pt-2">
            <ReactionButtons />
        </div>
       </CardContent>
    </Card>
  );
}
