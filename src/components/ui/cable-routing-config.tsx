'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Cable, 
  ArrowUp, 
  ArrowDown, 
  Settings,
  Calculator,
  Save,
  RotateCcw
} from 'lucide-react';
import type { AnyDevice, Connection } from '@/lib/types';
import type { CableRoutingDetails, CalibrationSettings } from '@/lib/calibration';
import { createCableRoutingDetails, DEFAULT_CALIBRATION_SETTINGS } from '@/lib/calibration';

interface CableRoutingConfigProps {
  connection: Connection;
  fromDevice: AnyDevice;
  toDevice: AnyDevice;
  routingDetails?: CableRoutingDetails;
  onRoutingUpdate: (routingDetails: CableRoutingDetails) => void;
  calibrationSettings?: CalibrationSettings;
}

export function CableRoutingConfig({
  connection,
  fromDevice,
  toDevice,
  routingDetails,
  onRoutingUpdate,
  calibrationSettings = DEFAULT_CALIBRATION_SETTINGS
}: CableRoutingConfigProps) {
  const [localRouting, setLocalRouting] = useState<CableRoutingDetails>(
    routingDetails || createCableRoutingDetails(connection, fromDevice, toDevice)
  );

  const updateRouting = (updates: Partial<CableRoutingDetails>) => {
    const updated = { ...localRouting, ...updates };
    setLocalRouting(updated);
    onRoutingUpdate(updated);
  };

  const updateSourceInfo = (updates: Partial<CableRoutingDetails['sourceInfo']>) => {
    updateRouting({
      sourceInfo: { ...localRouting.sourceInfo, ...updates }
    });
  };

  const updateDestinationInfo = (updates: Partial<CableRoutingDetails['destinationInfo']>) => {
    updateRouting({
      destinationInfo: { ...localRouting.destinationInfo, ...updates }
    });
  };

  const updateCustomLengths = (updates: Partial<CableRoutingDetails['customLengths']>) => {
    updateRouting({
      customLengths: { ...localRouting.customLengths, ...updates }
    });
  };

  const resetToDefaults = () => {
    const defaultRouting = createCableRoutingDetails(connection, fromDevice, toDevice);
    setLocalRouting(defaultRouting);
    onRoutingUpdate(defaultRouting);
  };

  const getTotalEstimatedLength = () => {
    const horizontal = localRouting.customLengths.horizontalLength || 0;
    const sourceDrops = localRouting.sourceInfo.dropLength;
    const destDrops = localRouting.destinationInfo.dropLength;
    const riser = calibrationSettings.verticalCabling.riserAllowance;
    const custom = localRouting.customLengths.totalCustomLength || 0;
    
    return horizontal + sourceDrops + destDrops + riser + custom;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cable className="w-5 h-5" />
          Cable Routing Configuration
        </CardTitle>
        <CardDescription>
          {fromDevice.label} → {toDevice.label}
        </CardDescription>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{connection.cableType}</Badge>
          <Badge variant="secondary">
            {getTotalEstimatedLength().toFixed(1)}m total
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Source Device Configuration */}
          <AccordionItem value="source">
            <AccordionTrigger className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              ต้นทาง: {fromDevice.label}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source-drop">ระยะสายต้นทาง (เมตร)</Label>
                  <Input
                    id="source-drop"
                    type="number"
                    step="0.1"
                    min="0"
                    value={localRouting.sourceInfo.dropLength}
                    onChange={(e) => updateSourceInfo({ 
                      dropLength: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ระยะสายที่ลงจากเพดานหรือขึ้นจากพื้น
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="source-height">ความสูงติดตั้ง (เมตร)</Label>
                  <Input
                    id="source-height"
                    type="number"
                    step="0.1"
                    min="0"
                    value={localRouting.sourceInfo.mountingHeight}
                    onChange={(e) => updateSourceInfo({ 
                      mountingHeight: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ความสูงจากพื้นถึงอุปกรณ์
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-entry">ทิศทางเข้าสาย</Label>
                <Select
                  value={localRouting.sourceInfo.cableEntry}
                  onValueChange={(value: 'top' | 'bottom' | 'side') => 
                    updateSourceInfo({ cableEntry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">ด้านบน (Top)</SelectItem>
                    <SelectItem value="bottom">ด้านล่าง (Bottom)</SelectItem>
                    <SelectItem value="side">ด้านข้าง (Side)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Destination Device Configuration */}
          <AccordionItem value="destination">
            <AccordionTrigger className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4" />
              ปลายทาง: {toDevice.label}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dest-drop">ระยะสายปลายทาง (เมตร)</Label>
                  <Input
                    id="dest-drop"
                    type="number"
                    step="0.1"
                    min="0"
                    value={localRouting.destinationInfo.dropLength}
                    onChange={(e) => updateDestinationInfo({ 
                      dropLength: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ระยะสายที่ลงจากเพดานหรือขึ้นจากพื้น
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dest-height">ความสูงติดตั้ง (เมตร)</Label>
                  <Input
                    id="dest-height"
                    type="number"
                    step="0.1"
                    min="0"
                    value={localRouting.destinationInfo.mountingHeight}
                    onChange={(e) => updateDestinationInfo({ 
                      mountingHeight: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ความสูงจากพื้นถึงอุปกรณ์
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dest-entry">ทิศทางเข้าสาย</Label>
                <Select
                  value={localRouting.destinationInfo.cableEntry}
                  onValueChange={(value: 'top' | 'bottom' | 'side') => 
                    updateDestinationInfo({ cableEntry: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">ด้านบน (Top)</SelectItem>
                    <SelectItem value="bottom">ด้านล่าง (Bottom)</SelectItem>
                    <SelectItem value="side">ด้านข้าง (Side)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Path Configuration */}
          <AccordionItem value="path">
            <AccordionTrigger className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              เส้นทางและความยาวกำหนดเอง
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="path-type">ประเภทเส้นทาง</Label>
                <Select
                  value={localRouting.routingPath.pathType}
                  onValueChange={(value: any) => 
                    updateRouting({
                      routingPath: { ...localRouting.routingPath, pathType: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceiling">เพดาน (Ceiling)</SelectItem>
                    <SelectItem value="wall">ผนัง (Wall)</SelectItem>
                    <SelectItem value="underground">ใต้ดิน (Underground)</SelectItem>
                    <SelectItem value="cable-tray">รางเคเบิล (Cable Tray)</SelectItem>
                    <SelectItem value="conduit">ท่อร้อยสาย (Conduit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horizontal-length">ระยะแนวนอน (เมตร)</Label>
                  <Input
                    id="horizontal-length"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="คำนวณอัตโนมัติ"
                    value={localRouting.customLengths.horizontalLength || ''}
                    onChange={(e) => updateCustomLengths({ 
                      horizontalLength: parseFloat(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    เว้นว่างเพื่อคำนวณอัตโนมัติ
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vertical-length">ระยะแนวตั้ง (เมตร)</Label>
                  <Input
                    id="vertical-length"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="คำนวณอัตโนมัติ"
                    value={localRouting.customLengths.verticalLength || ''}
                    onChange={(e) => updateCustomLengths({ 
                      verticalLength: parseFloat(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    เว้นว่างเพื่อคำนวณอัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-custom">ระยะสายรวมทั้งหมด (เมตร)</Label>
                <Input
                  id="total-custom"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="เว้นว่างเพื่อคำนวณอัตโนมัติ"
                  value={localRouting.customLengths.totalCustomLength || ''}
                  onChange={(e) => updateCustomLengths({ 
                    totalCustomLength: parseFloat(e.target.value) || 0 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  กรอกถ้าต้องการกำหนดความยาวเองทั้งหมด
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Summary */}
          <AccordionItem value="summary">
            <AccordionTrigger className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              สรุปการคำนวณ
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">ระยะสายต้นทาง</div>
                  <div className="text-muted-foreground">
                    {localRouting.sourceInfo.dropLength.toFixed(1)}m
                  </div>
                </div>
                <div>
                  <div className="font-medium">ระยะสายปลายทาง</div>
                  <div className="text-muted-foreground">
                    {localRouting.destinationInfo.dropLength.toFixed(1)}m
                  </div>
                </div>
                <div>
                  <div className="font-medium">เส้นทาง</div>
                  <div className="text-muted-foreground">
                    {localRouting.routingPath.pathType}
                  </div>
                </div>
                <div>
                  <div className="font-medium">ความยาวรวม</div>
                  <div className="text-muted-foreground font-semibold">
                    {getTotalEstimatedLength().toFixed(1)}m
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
