
import type { ProjectState, AnyDevice, RackDevice, RackContainer } from '@/lib/types';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DEVICE_CONFIG } from '@/lib/device-config';

interface BillOfMaterialsProps {
  project: ProjectState;
}

export function BillOfMaterials({ project }: BillOfMaterialsProps) {
  const bom = useMemo(() => {
    const allDevices: (AnyDevice | RackDevice)[] = [];
    project.buildings.forEach(building => {
        building.floors.forEach(floor => {
            floor.devices.forEach(device => {
                allDevices.push(device);
                if (device.type.startsWith('rack') && (device as RackContainer).devices) {
                    (device as RackContainer).devices.forEach(rackDevice => {
                        allDevices.push(rackDevice);
                    });
                }
            });
        });
    });

    const summary = allDevices.reduce((acc, device) => {
      const config = DEVICE_CONFIG[device.type];
      if (!config) return acc;

      if (!acc[device.type]) {
        acc[device.type] = { count: 0, total_price: 0, name: config.name };
      }
      acc[device.type].count++;
      acc[device.type].total_price += device.price || 0;
      return acc;
    }, {} as Record<string, { count: number; total_price: number; name: string }>);

    return Object.entries(summary).map(([type, data]) => ({
      type,
      ...data
    }));
  }, [project]);

  const grandTotal = useMemo(() => {
    return bom.reduce((total, item) => total + item.total_price, 0);
  }, [bom]);

  return (
    <div className="p-2">
       <Accordion type="single" collapsible>
        <AccordionItem value="bom">
            <AccordionTrigger className="text-lg font-semibold px-2">Bill of Materials</AccordionTrigger>
            <AccordionContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bom.map(item => (
                        <TableRow key={item.type}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right">{item.total_price.toLocaleString()} THB</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="text-right font-bold text-lg pr-4 mt-4">
                    Grand Total: {grandTotal.toLocaleString()} THB
                </div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
