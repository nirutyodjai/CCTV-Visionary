'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minus, DoorOpen, PanelTop, Armchair, RectangleVertical, ShieldAlert, Layers, TreeDeciduous, Car, Bike, CarFront, RectangleHorizontal } from 'lucide-react';
import type { ArchitecturalElementType } from '@/lib/types';
import { TableIcon } from '@/components/icons/table-icon';
import { Separator } from '@/components/ui/separator';
import ReactionButtons from './reaction-buttons';

const tools: { type: ArchitecturalElementType, name: string; icon: React.ReactNode }[] = [
  { type: 'wall', name: 'กำแพง', icon: <Minus size={24} /> },
  { type: 'door', name: 'ประตู', icon: <DoorOpen size={20} /> },
  { type: 'window', name: 'หน้าต่าง', icon: <PanelTop size={20} /> },
  { type: 'table', name: 'โต๊ะ', icon: <TableIcon className="w-5 h-5" /> },
  { type: 'chair', name: 'เก้าอี้', icon: <Armchair size={20} /> },
  { type: 'elevator', name: 'ลิฟท์', icon: <RectangleVertical size={20} /> },
  { type: 'fire-escape', name: 'ทางหนีไฟ', icon: <ShieldAlert size={20} /> },
  { type: 'shaft', name: 'ช่องชาร์ป', icon: <Layers size={20} /> },
  { type: 'tree', name: 'ต้นไม้', icon: <TreeDeciduous size={20} /> },
  { type: 'car', name: 'รถยนต์', icon: <Car size={20} /> },
  { type: 'motorcycle', name: 'มอเตอร์ไซค์', icon: <Bike size={20} /> },
  { type: 'supercar', name: 'ซุปเปอร์คาร์', icon: <CarFront size={20} /> },
  { type: 'area', name: 'พื้นที่', icon: <RectangleHorizontal size={20} /> },
];

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
        <div className="grid grid-cols-4 gap-2">
            {tools.map((tool) => (
            <Button
                key={tool.type}
                variant={selectedTool === tool.type ? 'secondary' : 'outline'}
                className="h-16 flex flex-col items-center justify-center space-y-1"
                onClick={() => handleToolClick(tool.type)}
            >
                {tool.icon}
                <span className="text-xs">{tool.name}</span>
            </Button>
            ))}
        </div>
        <Separator />
        <div className="flex justify-center pt-2">
            <ReactionButtons />
        </div>
      </CardContent>
    </Card>
  );
}
