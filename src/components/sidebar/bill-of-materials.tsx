'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlanState } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import React from 'react';

interface BillOfMaterialsProps {
  devicesByFloor: PlanState['devicesByFloor'];
  connectionsByFloor: PlanState['connectionsByFloor'];
}

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};

export function BillOfMaterials({ devicesByFloor, connectionsByFloor }: BillOfMaterialsProps) {
  
  const { summary, grandTotal } = React.useMemo(() => {
    const allDevices = Object.values(devicesByFloor).flat();
    const allConnections = Object.values(connectionsByFloor).flat();
    
    let total = 0;
    const lineItems: Record<string, { name: string; count: number; unit?: string; price: number; total: number }> = {};

    // Process devices
    allDevices.forEach(device => {
      const config = DEVICE_CONFIG[device.type];
      if (!lineItems[device.type]) {
        lineItems[device.type] = {
          name: config?.name || device.type,
          count: 0,
          price: device.price || config?.defaults.price || 0,
          total: 0
        };
      }
      lineItems[device.type].count++;
      lineItems[device.type].total += lineItems[device.type].price;
      total += lineItems[device.type].price;
    });

    // Process cables
    allConnections.forEach(conn => {
        const config = DEVICE_CONFIG[conn.cableType];
        const key = `cable-${conn.cableType}`;
        if (!lineItems[key]) {
            lineItems[key] = {
                name: `${config.name} (สาย)`,
                count: 0,
                unit: 'm',
                price: config.defaults.price || 0,
                total: 0
            };
        }
        lineItems[key].count += conn.length || 0;
        lineItems[key].total += conn.price || 0;
        total += conn.price || 0;
    });

    return {
      summary: Object.values(lineItems).sort((a, b) => a.name.localeCompare(b.name)),
      grandTotal: total
    };
  }, [devicesByFloor, connectionsByFloor]);

  if (summary.length === 0) {
    // ... return empty state card
  }

  return (
    <Card>
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-base">สรุปงบประมาณโครงการ</CardTitle>
            <CardDescription>ประเมินราคาตามจริง</CardDescription>
        </div>
        <div className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-48">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead className="text-right">ราคารวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.count.toFixed(item.unit ? 2 : 0)}{item.unit || ''}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
