'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Device } from '@/lib/types';

interface BillOfMaterialsProps {
  devicesByFloor: Record<number, Device[]>;
}

export function BillOfMaterials({ devicesByFloor }: BillOfMaterialsProps) {
  const allDevices = Object.values(devicesByFloor).flat();

  const bom = allDevices.reduce((acc, device) => {
    let key = device.type;
    if (device.resolution) key += ` (${device.resolution})`;
    else if (device.ports) key += ` (${device.ports} พอร์ต)`;
    else if (device.channels) key += ` (${device.channels} ช่อง, ${device.storage})`;
    else if (device.size) key += ` (${device.size})`;
    else if (device.length) key += ` (${device.length} ม.)`;
    
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="flex-grow flex flex-col">
      <CardHeader className="p-4">
        <CardTitle className="text-base">รายการวัสดุ (รวมทุกชั้น)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <ScrollArea className="h-48">
          {Object.keys(bom).length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีอุปกรณ์</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-1">
              {Object.entries(bom).map(([key, count]) => (
                <li key={key}>
                  {count}x {key}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
