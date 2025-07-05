'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, DoorOpen, PanelTop, Armchair, RectangleVertical, ShieldAlert, Layers, TreeDeciduous, Car, Bike, CarFront, RectangleHorizontal } from 'lucide-react';
import type { ArchitecturalElementType } from '@/lib/types';
import { TableIcon } from '@/components/icons/table-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioTileGroup, RadioTileItem } from '@/components/ui/radio-tile-group';
import { Separator } from '@/components/ui/separator';
import { ToolCard } from '@/components/ui/tool-card';


const buttonTools: { type: ArchitecturalElementType, name: string; subtitle: string; icon: React.ReactNode, color: string }[] = [
  { type: 'wall', name: 'กำแพง', subtitle: 'โครงสร้างหลัก', icon: <Minus size={40} />, color: 'hsl(221, 83%, 53%)' },
  { type: 'door', name: 'ประตู', subtitle: 'ทางเข้า-ออก', icon: <DoorOpen size={40} />, color: 'hsl(24, 95%, 53%)' },
  { type: 'window', name: 'หน้าต่าง', subtitle: 'รับแสง/อากาศ', icon: <PanelTop size={40} />, color: 'hsl(142, 71%, 45%)' },
  { type: 'area', name: 'พื้นที่', subtitle: 'กำหนดขอบเขต', icon: <RectangleHorizontal size={40} />, color: 'hsl(262, 84%, 58%)' },
  { type: 'table', name: 'โต๊ะ', subtitle: 'สำหรับวางของ', icon: <TableIcon className="w-10 h-10" />, color: 'hsl(32, 79%, 50%)' },
  { type: 'chair', name: 'เก้าอี้', subtitle: 'สำหรับนั่ง', icon: <Armchair size={40} />, color: 'hsl(322, 80%, 55%)' },
  { type: 'elevator', name: 'ลิฟท์', subtitle: 'ขึ้น-ลง', icon: <RectangleVertical size={40} />, color: 'hsl(215, 20%, 65%)' },
  { type: 'shaft', name: 'ช่องชาร์ป', subtitle: 'งานระบบ', icon: <Layers size={40} />, color: 'hsl(210, 24%, 34%)' },
  { type: 'fire-escape', name: 'ทางหนีไฟ', subtitle: 'ฉุกเฉิน', icon: <ShieldAlert size={40} />, color: 'hsl(0, 84%, 60%)' },
];

const radioTools: { type: ArchitecturalElementType, name: string; icon: React.ReactNode }[] = [
    { type: 'tree', name: 'ต้นไม้', icon: <TreeDeciduous /> },
    { type: 'motorcycle', name: 'มอเตอร์ไซค์', icon: <Bike /> },
    { type: 'car', name: 'รถยนต์', icon: <Car /> },
    { type: 'supercar', name: 'ซุปเปอร์คาร์', icon: <CarFront /> },
]

interface ArchitectureToolbarProps {
  selectedTool: ArchitecturalElementType | null;
  onSelectTool: (type: ArchitecturalElementType | null) => void;
}

export function ArchitectureToolbar({ selectedTool, onSelectTool }: ArchitectureToolbarProps) {
  const handleToolClick = (type: ArchitecturalElementType) => {
    onSelectTool(selectedTool === type ? null : type);
  };
  
  return (
    <Card>
      <CardHeader className="p-3 border-b">
        <CardTitle className="text-sm font-semibold">ส่วนประกอบห้อง</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
              {buttonTools.map((tool) => (
              <ToolCard
                  key={tool.type}
                  icon={tool.icon}
                  title={tool.name}
                  subtitle={tool.subtitle}
                  color={tool.color}
                  checked={selectedTool === tool.type}
                  onChange={() => handleToolClick(tool.type)}
              />
              ))}
          </div>
      
          <Separator />
            
          <RadioTileGroup 
              className="grid-cols-4"
              value={selectedTool || ''}
              onValueChange={(value) => onSelectTool(value as ArchitecturalElementType)}
          >
              {radioTools.map((tool) => (
                  <TooltipProvider key={tool.type}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <RadioTileItem 
                                  value={tool.type}
                                  icon={tool.icon}
                              />
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>เพิ่ม {tool.name}</p>
                          </TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
              ))}
          </RadioTileGroup>
      </CardContent>
    </Card>
  );
}
