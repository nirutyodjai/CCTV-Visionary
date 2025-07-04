
import { Button } from '@/components/ui/button';
import { DEVICE_CONFIG } from '@/lib/device-config';
import type { DeviceType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DevicesToolbarProps {
  onSelectDevice: (type: DeviceType) => void;
}

const TOOLBAR_DEVICES: DeviceType[] = [
    'cctv-dome',
    'cctv-bullet',
    'nvr',
    'switch',
    'rack-indoor',
    'wifi-ap',
];

export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
         <h4 className="font-semibold mr-4 text-sm">Add Device</h4>
         <TooltipProvider>
            {TOOLBAR_DEVICES.map(type => {
                const config = DEVICE_CONFIG[type];
                if (!config) return null;
                const Icon = config.icon;
                return (
                    <Tooltip key={type}>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => onSelectDevice(type)}>
                                <Icon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{config.name}</p>
                        </TooltipContent>
                    </Tooltip>
                )
            })}
        </TooltipProvider>
    </div>
  );
}
