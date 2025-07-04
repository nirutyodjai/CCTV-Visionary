
import { Button } from '@/components/ui/button';
import { CctvDomeIcon, NvrIcon, SwitchIcon, UtpCat6Icon } from '@/components/icons';
import type { DeviceType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface DevicesToolbarProps {
  onSelectDevice: (type: DeviceType) => void;
}

const tools: { type: DeviceType; name: string; icon: React.ReactNode }[] = [
    { type: 'cctv-dome', name: 'CCTV Dome', icon: <CctvDomeIcon className="h-6 w-6" /> },
    { type: 'nvr', name: 'NVR', icon: <NvrIcon className="h-6 w-6" /> },
    { type: 'switch', name: 'Switch', icon: <SwitchIcon className="h-6 w-6" /> },
];

export function DevicesToolbar({ onSelectDevice }: DevicesToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
         <h4 className="font-semibold mr-4">Devices</h4>
         <TooltipProvider>
            {tools.map(tool => (
                <Tooltip key={tool.type}>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onSelectDevice(tool.type)}>
                            {tool.icon}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tool.name}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </TooltipProvider>
    </div>
  );
}
