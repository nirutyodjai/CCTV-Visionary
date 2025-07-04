
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, DoorOpen, PanelTop, Armchair, RectangleVertical, ShieldAlert, Layers, TreeDeciduous, Car, Bike, CarFront, RectangleHorizontal } from 'lucide-react';
import type { ArchitecturalElementType } from '@/lib/types';
import { TableIcon } from '@/components/icons/table-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioTileGroup, RadioTileItem } from '@/components/ui/radio-tile-group';
import { Separator } from '@/components/ui/separator';

const buttonTools: { type: ArchitecturalElementType, name: string; icon: React.ReactNode }[] = [
  { type: 'wall', name: 'กำแพง', icon: <Minus size={24} /> },
  { type: 'door', name: 'ประตู', icon: <DoorOpen size={20} /> },
  { type: 'window', name: 'หน้าต่าง', icon: <PanelTop size={20} /> },
  { type: 'table', name: 'โต๊ะ', icon: <TableIcon className="w-5 h-5" /> },
  { type: 'chair', name: 'เก้าอี้', icon: <Armchair size={20} /> },
  { type: 'elevator', name: 'ลิฟท์', icon: <RectangleVertical size={20} /> },
  { type: 'fire-escape', name: 'ทางหนีไฟ', icon: <ShieldAlert size={20} /> },
  { type: 'shaft', name: 'ช่องชาร์ป', icon: <Layers size={20} /> },
  { type: 'area', name: 'พื้นที่', icon: <RectangleHorizontal size={20} /> },
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
        <TooltipProvider>
            <div className="grid grid-cols-4 gap-2">
                {buttonTools.map((tool) => (
                <Tooltip key={tool.type}>
                    <TooltipTrigger asChild>
                        <Button
                            variant={selectedTool === tool.type ? 'secondary' : 'outline'}
                            className="h-14 flex items-center justify-center"
                            onClick={() => handleToolClick(tool.type)}
                        >
                            {tool.icon}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>เพิ่ม {tool.name}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </div>
        </TooltipProvider>

        <Separator />
        
        <RadioTileGroup 
            className="grid-cols-4"
            value={selectedTool || ''}
            onValueChange={(value) => onSelectTool(value as ArchitecturalElementType)}
        >
            {radioTools.map((tool) => (
                <RadioTileItem 
                    key={tool.type}
                    value={tool.type}
                    label={tool.name}
                    icon={tool.icon}
                />
            ))}
        </RadioTileGroup>
        
      </CardContent>
    </Card>
  );
}
