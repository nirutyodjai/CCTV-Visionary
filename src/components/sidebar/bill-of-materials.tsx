'use client';

import type { ProjectState, AnyDevice, RackDevice, RackContainer, Connection } from '@/lib/types';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { DEVICE_CONFIG } from '@/lib/device-config';

interface BillOfMaterialsProps {
  project: ProjectState;
}

export function BillOfMaterials({ project }: BillOfMaterialsProps) {
  const { deviceSummary, cableSummary, grandTotal } = useMemo(() => {
    const allDevices: (AnyDevice | RackDevice)[] = [];
    const allConnections: Connection[] = [];

    project.buildings.forEach(building => {
        building.floors.forEach(floor => {
            allConnections.push(...floor.connections);
            floor.devices.forEach(device => {
                allDevices.push(device);
                if (device.type.startsWith('rack') && (device as RackContainer).devices) {
                    allDevices.push(...(device as RackContainer).devices);
                }
            });
        });
    });

    const deviceSummaryMap = allDevices.reduce((acc, device) => {
      const config = DEVICE_CONFIG[device.type];
      if (!config) return acc;
      if (!acc[device.type]) {
        acc[device.type] = { count: 0, total_price: 0, name: config.name };
      }
      acc[device.type].count++;
      acc[device.type].total_price += device.price || 0;
      return acc;
    }, {} as Record<string, { count: number; total_price: number; name: string }>);

    const cableSummaryMap = allConnections.reduce((acc, conn) => {
        const config = DEVICE_CONFIG[conn.cableType];
        if (!config) return acc;
        if (!acc[conn.cableType]) {
            acc[conn.cableType] = { length: 0, total_price: 0, name: config.name };
        }
        acc[conn.cableType].length += conn.length || 0;
        acc[conn.cableType].total_price += conn.price || 0;
        return acc;
    }, {} as Record<string, { length: number; total_price: number; name: string }>);
    
    const deviceList = Object.values(deviceSummaryMap);
    const cableList = Object.values(cableSummaryMap);

    const totalDevicePrice = deviceList.reduce((sum, item) => sum + item.total_price, 0);
    const totalCablePrice = cableList.reduce((sum, item) => sum + item.total_price, 0);
    const grandTotal = totalDevicePrice + totalCablePrice;

    return { 
        deviceSummary: deviceList, 
        cableSummary: cableList, 
        grandTotal 
    };
  }, [project]);


  return (
    <Card>
        <CardHeader className="p-3 border-b">
            <CardTitle className="text-sm font-semibold">Bill of Materials</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
             <Accordion type="single" collapsible defaultValue="devices">
                <AccordionItem value="devices">
                    <AccordionTrigger className="px-3 text-sm font-medium">Devices</AccordionTrigger>
                    <AccordionContent className="text-xs">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deviceSummary.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-center">{item.count}</TableCell>
                                    <TableCell className="text-right">{item.total_price.toLocaleString()} THB</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cabling">
                    <AccordionTrigger className="px-3 text-sm font-medium">Cabling</AccordionTrigger>
                    <AccordionContent className="text-xs">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cable Type</TableHead>
                                    <TableHead className="text-center">Length</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cableSummary.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-center">{item.length.toLocaleString()} m</TableCell>
                                    <TableCell className="text-right">{item.total_price.toLocaleString()} THB</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
        <CardFooter className="p-3 mt-2 border-t">
            <div className="w-full flex justify-between items-center">
                <span className="text-sm font-semibold">Grand Total:</span>
                <span className="text-lg font-bold">{grandTotal.toLocaleString()} THB</span>
            </div>
        </CardFooter>
    </Card>
  );
}
