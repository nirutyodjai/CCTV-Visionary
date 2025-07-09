'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, DoorOpen, PanelTop, Armchair, RectangleVertical, ShieldAlert, Layers, TreeDeciduous, Car, Bike, CarFront, RectangleHorizontal } from 'lucide-react';
import type { ArchitecturalElementType } from '@/lib/types';
import { TableIcon, ArchitectureIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioTileGroup, RadioTileItem } from '@/components/ui/radio-tile-group';
import { Separator } from '@/components/ui/separator';
import { ToolCard } from '@/components/ui/tool-card';


const buttonTools: { type: ArchitecturalElementType, name: string; subtitle: string; icon: React.ReactNode, color: string }[] = [
  { type: 'wall', name: 'กำแพง', subtitle: 'โครงสร้างหลัก', icon: <Minus size={32} />, color: 'hsl(221, 83%, 53%)' },
  { type: 'door', name: 'ประตู', subtitle: 'ทางเข้า-ออก', icon: <DoorOpen size={32} />, color: 'hsl(24, 95%, 53%)' },
  { type: 'window', name: 'หน้าต่าง', subtitle: 'รับแสง/อากาศ', icon: <PanelTop size={32} />, color: 'hsl(142, 71%, 45%)' },
];

const decorativeTools: { type: string, name: string; icon: React.ReactNode }[] = [
    { type: 'table', name: 'โต๊ะ', icon: <TableIcon className="w-6 h-6" /> },
    { type: 'chair', name: 'เก้าอี้', icon: <Armchair size={24} /> },
    { type: 'elevator', name: 'ลิฟท์', icon: <RectangleVertical size={24} /> },
    { type: 'tree', name: 'ต้นไม้', icon: <TreeDeciduous size={24} /> },
    { type: 'car', name: 'รถยนต์', icon: <Car size={24} /> },
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
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ArchitectureIcon className="w-4 h-4" />
          ส่วนประกอบห้อง
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-5 gap-2">
              {buttonTools.map((tool) => (
              <button
                  key={tool.type}
                  onClick={() => handleToolClick(tool.type)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 border ${
                    selectedTool === tool.type 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  title={`${tool.name} - ${tool.subtitle}`}
              >
                  <div style={{ color: tool.color }}>
                      {tool.icon}
                  </div>
              </button>
              ))}
          </div>
      
          <div className="border-t pt-3">
              <div className="grid grid-cols-5 gap-2">
                  {decorativeTools.map((tool) => (
                      <button
                          key={tool.type}
                          onClick={() => {
                            // For decorative items, we don't set them as selected tools
                            // This is just for visual reference
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700"
                          title={`เพิ่ม ${tool.name}`}
                      >
                          <div className="text-gray-600 dark:text-gray-400">
                              {tool.icon}
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      </CardContent>
    </Card>
  );
}
