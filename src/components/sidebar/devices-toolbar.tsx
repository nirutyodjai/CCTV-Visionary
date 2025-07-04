'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DeviceType } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';

interface DevicesToolbarProps {
  selectedDeviceToAdd: DeviceType | null;
  onSelectDevice: (type: DeviceType) => void;
}

const deviceTypes = Object.keys(DEVICE_CONFIG) as DeviceType[];

export function DevicesToolbar({ selectedDeviceToAdd, onSelectDevice }: DevicesToolbarProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">เพิ่มอุปกรณ์</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-2">
          {deviceTypes.map((type) => {
            const config = DEVICE_CONFIG[type];
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant="outline"
                onClick={() => onSelectDevice(type)}
                className={cn(
                  'h-auto flex flex-col items-center justify-center p-2 aspect-square',
                  selectedDeviceToAdd === type && 'ring-2 ring-primary bg-accent'
                )}
                title={config.name}
              >
                <Icon className="w-6 h-6 text-foreground/80" />
                <span className="text-xs mt-1 text-center leading-tight">{config.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
